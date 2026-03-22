-- ==============================================
-- Migration 003: Storage bucket for file uploads
-- Enables image and document uploads for wiki proposals
-- ==============================================

-- Create the storage bucket for wiki uploads
insert into storage.buckets (id, name, public)
values ('wiki-uploads', 'wiki-uploads', true)
on conflict (id) do nothing;

-- RLS policies for wiki-uploads bucket

-- Anyone can view uploaded files (bucket is public)
create policy "Public read access for wiki uploads"
  on storage.objects for select
  using (bucket_id = 'wiki-uploads');

-- Editors, reviewers, and admins can upload files
create policy "Editors can upload files"
  on storage.objects for insert
  with check (
    bucket_id = 'wiki-uploads'
    and exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('editor', 'reviewer', 'admin')
    )
  );

-- Users can update their own uploads
create policy "Users can update own uploads"
  on storage.objects for update
  using (
    bucket_id = 'wiki-uploads'
    and owner = auth.uid()
  );

-- Users can delete their own uploads; admins can delete any
create policy "Users can delete own uploads or admins can delete any"
  on storage.objects for delete
  using (
    bucket_id = 'wiki-uploads'
    and (
      owner = auth.uid()
      or exists (
        select 1 from public.user_profiles
        where id = auth.uid() and role = 'admin'
      )
    )
  );
