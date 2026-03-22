-- ==============================================
-- Migration 001: Role System Improvements
-- Run AFTER the initial schema.sql
-- ==============================================

-- 1. Add 'cancelled' status to edit_status enum
ALTER TYPE edit_status ADD VALUE IF NOT EXISTS 'cancelled';

-- 2. Prevent duplicate approvals (same reviewer can't approve same proposal twice)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_approval_per_reviewer
  ON public.approval_actions(proposal_id, reviewer_id)
  WHERE action = 'approve';

-- 3. Email uniqueness on user_profiles
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- 4. Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_approval_actions_reviewer
  ON public.approval_actions(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_approval_actions_created
  ON public.approval_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_edit_proposals_updated
  ON public.edit_proposals(updated_at DESC);

-- 5. Notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('proposal_submitted', 'proposal_approved', 'proposal_rejected', 'proposal_changes_requested', 'proposal_comment', 'role_changed')),
  proposal_id uuid REFERENCES public.edit_proposals(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON public.notifications(user_id, read, created_at DESC);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Allow authors to cancel their own pending proposals
CREATE POLICY "Authors can cancel own proposals"
  ON public.edit_proposals FOR UPDATE
  USING (
    author_id = auth.uid()
    AND status IN ('draft', 'pending_review')
  )
  WITH CHECK (
    author_id = auth.uid()
    AND status = 'cancelled'
  );

-- 7. Allow reviewers to publish approved proposals
CREATE POLICY "Reviewers can publish approved proposals"
  ON public.edit_proposals FOR UPDATE
  USING (
    status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('reviewer', 'admin')
    )
  )
  WITH CHECK (status = 'published');

-- 8. Function to create notifications on proposal status changes
CREATE OR REPLACE FUNCTION public.notify_on_proposal_change()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id uuid;
  v_message text;
  v_type text;
  v_reviewer_record RECORD;
BEGIN
  -- Only trigger on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  v_author_id := NEW.author_id;

  -- Notify based on new status
  CASE NEW.status
    WHEN 'pending_review' THEN
      v_type := 'proposal_submitted';
      v_message := 'New proposal "' || NEW.title || '" submitted for review on ' || NEW.doc_path;
      -- Notify all reviewers and admins
      FOR v_reviewer_record IN
        SELECT id FROM public.user_profiles WHERE role IN ('reviewer', 'admin') AND id != v_author_id
      LOOP
        INSERT INTO public.notifications (user_id, type, proposal_id, message)
        VALUES (v_reviewer_record.id, v_type, NEW.id, v_message);
      END LOOP;
      -- Also notify author's manager
      INSERT INTO public.notifications (user_id, type, proposal_id, message)
      SELECT manager_id, v_type, NEW.id, v_message
      FROM public.user_profiles
      WHERE id = v_author_id AND manager_id IS NOT NULL AND manager_id != v_author_id;

    WHEN 'approved' THEN
      v_type := 'proposal_approved';
      v_message := 'Your proposal "' || NEW.title || '" has been approved';
      INSERT INTO public.notifications (user_id, type, proposal_id, message)
      VALUES (v_author_id, v_type, NEW.id, v_message);

    WHEN 'rejected' THEN
      v_type := 'proposal_rejected';
      v_message := 'Your proposal "' || NEW.title || '" has been rejected';
      INSERT INTO public.notifications (user_id, type, proposal_id, message)
      VALUES (v_author_id, v_type, NEW.id, v_message);

    WHEN 'published' THEN
      v_message := 'Your proposal "' || NEW.title || '" has been published';
      INSERT INTO public.notifications (user_id, type, proposal_id, message)
      VALUES (v_author_id, 'proposal_approved', NEW.id, v_message);

    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_proposal_change
  AFTER UPDATE ON public.edit_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_proposal_change();

-- 9. Enable real-time for notifications and edit_proposals
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.edit_proposals;
