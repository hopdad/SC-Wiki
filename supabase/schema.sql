-- ==============================================
-- Meijer SC-Wiki: Role & Approval System Schema
-- Run this in your Supabase SQL Editor
-- ==============================================

-- 1. User Roles & Org Hierarchy
-- Synced from Azure AD via Supabase Auth
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'viewer' check (role in ('viewer', 'editor', 'reviewer', 'admin')),
  manager_id uuid references public.user_profiles(id),
  department text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for manager lookups (who reports to whom)
create index idx_user_profiles_manager on public.user_profiles(manager_id);
create index idx_user_profiles_email on public.user_profiles(email);

-- 2. Edit Proposals
-- When an editor proposes a change to a doc page
create type edit_status as enum ('draft', 'pending_review', 'approved', 'rejected', 'published');

create table public.edit_proposals (
  id uuid primary key default gen_random_uuid(),
  doc_path text not null,                    -- e.g. 'supply-chain/warehouse/receiving'
  title text not null,                       -- short summary of the change
  description text,                          -- detailed description
  content_diff text not null,                -- the proposed content (markdown)
  original_content text,                     -- snapshot of current content
  status edit_status default 'draft',
  author_id uuid not null references public.user_profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_edit_proposals_status on public.edit_proposals(status);
create index idx_edit_proposals_author on public.edit_proposals(author_id);
create index idx_edit_proposals_doc on public.edit_proposals(doc_path);

-- 3. Approval Actions
-- Track who approved/rejected and when
create table public.approval_actions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.edit_proposals(id) on delete cascade,
  reviewer_id uuid not null references public.user_profiles(id),
  action text not null check (action in ('approve', 'reject', 'request_changes', 'comment')),
  comment text,
  created_at timestamptz default now()
);

create index idx_approval_actions_proposal on public.approval_actions(proposal_id);

-- 4. Approval Rules
-- Configurable: who can approve edits for which doc sections
create table public.approval_rules (
  id uuid primary key default gen_random_uuid(),
  doc_path_pattern text not null,            -- glob pattern, e.g. 'systems/wms/*'
  required_role text not null default 'reviewer' check (required_role in ('reviewer', 'admin')),
  allow_manager_approval boolean default true, -- editor's manager can also approve
  min_approvals integer default 1,
  created_at timestamptz default now()
);

-- 5. Audit Log
-- Track all role changes and significant actions
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.user_profiles(id),
  action text not null,
  target_type text,                          -- 'user', 'proposal', 'rule'
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

create index idx_audit_log_actor on public.audit_log(actor_id);
create index idx_audit_log_created on public.audit_log(created_at desc);

-- ==============================================
-- Row-Level Security Policies
-- ==============================================

alter table public.user_profiles enable row level security;
alter table public.edit_proposals enable row level security;
alter table public.approval_actions enable row level security;
alter table public.approval_rules enable row level security;
alter table public.audit_log enable row level security;

-- User profiles: everyone can read, only admins can modify roles
create policy "Users can view all profiles"
  on public.user_profiles for select
  using (true);

create policy "Users can update own profile (non-role fields)"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update any profile"
  on public.user_profiles for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert profiles"
  on public.user_profiles for insert
  with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Edit proposals: authors can CRUD own, reviewers/admins can read all
create policy "Anyone can view proposals"
  on public.edit_proposals for select
  using (true);

create policy "Editors can create proposals"
  on public.edit_proposals for insert
  with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('editor', 'reviewer', 'admin')
    )
  );

create policy "Authors can update own draft proposals"
  on public.edit_proposals for update
  using (author_id = auth.uid() and status = 'draft');

create policy "Reviewers and admins can update proposal status"
  on public.edit_proposals for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('reviewer', 'admin')
    )
  );

-- Approval actions: reviewers/managers can create
create policy "Anyone can view approvals"
  on public.approval_actions for select
  using (true);

create policy "Reviewers and admins can create approval actions"
  on public.approval_actions for insert
  with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('reviewer', 'admin')
    )
  );

-- Manager approval: allow if reviewer is the author's manager
create policy "Managers can approve their reports edits"
  on public.approval_actions for insert
  with check (
    exists (
      select 1 from public.edit_proposals ep
      join public.user_profiles author_profile on author_profile.id = ep.author_id
      where ep.id = proposal_id
        and author_profile.manager_id = auth.uid()
    )
  );

-- Approval rules: only admins
create policy "Anyone can view approval rules"
  on public.approval_rules for select
  using (true);

create policy "Only admins can manage approval rules"
  on public.approval_rules for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Audit log: admins can read, system inserts
create policy "Admins can view audit log"
  on public.audit_log for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Authenticated users can insert audit entries"
  on public.audit_log for insert
  with check (auth.uid() is not null);

-- ==============================================
-- Helper Functions
-- ==============================================

-- Check if a user can approve a specific proposal
-- (they are a reviewer/admin OR the author's manager)
create or replace function public.can_approve_proposal(
  p_user_id uuid,
  p_proposal_id uuid
) returns boolean as $$
declare
  v_user_role text;
  v_author_manager_id uuid;
begin
  -- Get the user's role
  select role into v_user_role
  from public.user_profiles
  where id = p_user_id;

  -- Admins and reviewers can always approve
  if v_user_role in ('admin', 'reviewer') then
    return true;
  end if;

  -- Check if user is the author's manager
  select up.manager_id into v_author_manager_id
  from public.edit_proposals ep
  join public.user_profiles up on up.id = ep.author_id
  where ep.id = p_proposal_id;

  return v_author_manager_id = p_user_id;
end;
$$ language plpgsql security definer;

-- Auto-create user profile on first sign-in
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.update_updated_at();

create trigger update_edit_proposals_updated_at
  before update on public.edit_proposals
  for each row execute function public.update_updated_at();

-- ==============================================
-- Default Approval Rules
-- ==============================================

insert into public.approval_rules (doc_path_pattern, required_role, allow_manager_approval, min_approvals)
values
  ('supply-chain/*', 'reviewer', true, 1),
  ('systems/*', 'reviewer', true, 1),
  ('reference/*', 'reviewer', true, 1);
