---
sidebar_position: 4
---

# Setup Guide: Auth & Role System

This guide covers setting up the Supabase + Azure AD authentication and role-based approval system.

## Prerequisites

- A Supabase project (shared with the WMS system or dedicated)
- Azure AD tenant with app registration
- Admin access to both

## 1. Supabase Setup

### Run the Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Paste and execute the contents of `supabase/schema.sql`

This creates:
- `user_profiles` — roles, manager hierarchy, department
- `edit_proposals` — proposed content changes
- `approval_actions` — reviewer decisions
- `approval_rules` — configurable per-section rules
- `audit_log` — all actions tracked

### Configure Environment

Create a `.env.local` file in the project root:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

These values are found in Supabase **Settings > API**.

## 2. Azure AD Configuration

### Register the App in Azure AD

1. Go to **Azure Portal > Azure Active Directory > App registrations**
2. Click **New registration**
3. Set the redirect URI to: `https://your-project.supabase.co/auth/v1/callback`
4. Note the **Application (client) ID** and **Directory (tenant) ID**
5. Under **Certificates & secrets**, create a new client secret

### Configure Supabase Auth

1. Go to Supabase **Authentication > Providers**
2. Enable **Azure**
3. Enter:
   - **Azure Client ID**: from step 4 above
   - **Azure Secret**: from step 5 above
   - **Azure Tenant URL**: `https://login.microsoftonline.com/YOUR_TENANT_ID`

## 3. Role Assignment

### Initial Admin

After the first user signs in via Azure AD, manually set them as admin:

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'your-email@meijer.com';
```

### Manager Hierarchy

Set up reporting relationships in the Admin Panel (`/admin`), or via SQL:

```sql
UPDATE public.user_profiles
SET manager_id = (SELECT id FROM public.user_profiles WHERE email = 'manager@meijer.com')
WHERE email = 'employee@meijer.com';
```

## 4. Role Permissions

| Role | View | Propose Edits | Approve | Manage Users | Manage Rules |
|---|---|---|---|---|---|
| **Viewer** | Yes | No | No | No | No |
| **Editor** | Yes | Yes | No | No | No |
| **Reviewer** | Yes | Yes | Yes | No | No |
| **Admin** | Yes | Yes | Yes | Yes | Yes |
| **Manager** (of editor) | Yes | Per own role | Yes (direct reports only) | No | No |

### Manager Approval

Any user who is set as another user's `manager_id` can approve that person's edit proposals, regardless of their own role. This means a team lead with "editor" role can still approve their team members' edits.

## 5. Approval Workflow

```mermaid
graph LR
    A[Editor writes change] --> B[Draft]
    B --> C[Submit for Review]
    C --> D[Pending Review]
    D --> E{Reviewer / Manager}
    E -->|Approve| F[Approved]
    E -->|Request Changes| D
    E -->|Reject| G[Rejected]
    F --> H[Published]
```

## 6. Approval Rules

Default rules (configurable in Admin Panel):

| Doc Section | Required Role | Manager Can Approve | Min Approvals |
|---|---|---|---|
| `supply-chain/*` | Reviewer | Yes | 1 |
| `systems/*` | Reviewer | Yes | 1 |
| `reference/*` | Reviewer | Yes | 1 |
