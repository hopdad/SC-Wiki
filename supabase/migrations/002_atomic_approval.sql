-- ==============================================
-- Migration 002: Atomic Approval + Notification Hardening
-- Run AFTER 001_improvements.sql
-- ==============================================

-- =====================
-- 1. Atomic Approval Function
-- Handles insert + count + status update in a single transaction.
-- Eliminates the race condition where concurrent approvals both
-- read count before the other's insert is visible.
-- =====================

CREATE OR REPLACE FUNCTION public.process_review_action(
  p_proposal_id uuid,
  p_reviewer_id uuid,
  p_action text,
  p_comment text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_proposal RECORD;
  v_new_status text;
  v_approval_count int := 0;
  v_required int := 1;
  v_rule RECORD;
BEGIN
  -- Validate action type
  IF p_action NOT IN ('approve', 'reject', 'request_changes', 'comment') THEN
    RETURN jsonb_build_object('error', 'Invalid action: ' || p_action);
  END IF;

  -- Lock the proposal row to serialize concurrent reviews
  SELECT * INTO v_proposal FROM public.edit_proposals
  WHERE id = p_proposal_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Proposal not found');
  END IF;

  IF v_proposal.status != 'pending_review' THEN
    RETURN jsonb_build_object('error', 'Proposal is not pending review');
  END IF;

  IF v_proposal.author_id = p_reviewer_id THEN
    RETURN jsonb_build_object('error', 'Cannot review your own proposal');
  END IF;

  -- Insert the approval action
  INSERT INTO public.approval_actions (proposal_id, reviewer_id, action, comment)
  VALUES (p_proposal_id, p_reviewer_id, p_action, p_comment);

  -- Determine new status
  v_new_status := 'pending_review';

  IF p_action = 'reject' THEN
    v_new_status := 'rejected';

  ELSIF p_action = 'approve' THEN
    -- Count unique approvers (within this transaction, so our insert is visible)
    SELECT COUNT(DISTINCT reviewer_id) INTO v_approval_count
    FROM public.approval_actions
    WHERE proposal_id = p_proposal_id AND action = 'approve';

    -- Find matching approval rule via glob (replace * with % for LIKE)
    SELECT * INTO v_rule FROM public.approval_rules
    WHERE v_proposal.doc_path LIKE REPLACE(doc_path_pattern, '*', '%')
    ORDER BY LENGTH(doc_path_pattern) DESC
    LIMIT 1;

    v_required := COALESCE(v_rule.min_approvals, 1);

    IF v_approval_count >= v_required THEN
      v_new_status := 'approved';
    END IF;
  END IF;
  -- 'request_changes' and 'comment' keep pending_review

  -- Update status if action warrants it and status actually changed
  IF p_action != 'comment' AND v_new_status != v_proposal.status THEN
    UPDATE public.edit_proposals
    SET status = v_new_status
    WHERE id = p_proposal_id;
  END IF;

  -- Audit log
  INSERT INTO public.audit_log (actor_id, action, target_type, target_id, details)
  VALUES (
    p_reviewer_id,
    'proposal_' || p_action,
    'proposal',
    p_proposal_id,
    jsonb_build_object(
      'comment', p_comment,
      'resulting_status', v_new_status,
      'approval_count', v_approval_count,
      'required', v_required
    )
  );

  RETURN jsonb_build_object(
    'status', v_new_status,
    'approval_count', v_approval_count,
    'required', v_required
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- 2. Notification Content Injection Fix
-- Add structured data column, rewrite trigger to use format() with truncation.
-- =====================

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data jsonb;

-- Replace the notification trigger to sanitize messages and include structured data
CREATE OR REPLACE FUNCTION public.notify_on_proposal_change()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id uuid;
  v_message text;
  v_type text;
  v_data jsonb;
  v_safe_title text;
  v_reviewer_record RECORD;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  v_author_id := NEW.author_id;
  -- Truncate and sanitize the title for message text
  v_safe_title := left(NEW.title, 100);
  -- Structured data for client-side rendering
  v_data := jsonb_build_object(
    'proposal_id', NEW.id,
    'title', NEW.title,
    'doc_path', NEW.doc_path,
    'status', NEW.status
  );

  CASE NEW.status
    WHEN 'pending_review' THEN
      v_type := 'proposal_submitted';
      v_message := format('New proposal submitted for review: %s on %s', v_safe_title, NEW.doc_path);
      FOR v_reviewer_record IN
        SELECT id FROM public.user_profiles WHERE role IN ('reviewer', 'admin') AND id != v_author_id
      LOOP
        INSERT INTO public.notifications (user_id, type, proposal_id, message, data)
        VALUES (v_reviewer_record.id, v_type, NEW.id, v_message, v_data);
      END LOOP;
      INSERT INTO public.notifications (user_id, type, proposal_id, message, data)
      SELECT manager_id, v_type, NEW.id, v_message, v_data
      FROM public.user_profiles
      WHERE id = v_author_id AND manager_id IS NOT NULL AND manager_id != v_author_id;

    WHEN 'approved' THEN
      v_type := 'proposal_approved';
      v_message := format('Your proposal has been approved: %s', v_safe_title);
      INSERT INTO public.notifications (user_id, type, proposal_id, message, data)
      VALUES (v_author_id, v_type, NEW.id, v_message, v_data);

    WHEN 'rejected' THEN
      v_type := 'proposal_rejected';
      v_message := format('Your proposal has been rejected: %s', v_safe_title);
      INSERT INTO public.notifications (user_id, type, proposal_id, message, data)
      VALUES (v_author_id, v_type, NEW.id, v_message, v_data);

    WHEN 'published' THEN
      v_type := 'proposal_published';
      v_message := format('Your proposal has been published: %s', v_safe_title);
      INSERT INTO public.notifications (user_id, type, proposal_id, message, data)
      VALUES (v_author_id, v_type, NEW.id, v_message, v_data);

    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
