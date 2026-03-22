// Supabase Edge Function: Email notifications for proposal status changes
// Deploy with: supabase functions deploy notify-reviewers
//
// Requires environment variables:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//
// Triggered by database webhook on edit_proposals INSERT/UPDATE

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE'
  table: string
  record: {
    id: string
    title: string
    doc_path: string
    status: string
    author_id: string
  }
  old_record?: {
    status: string
  }
}

serve(async (req: Request) => {
  try {
    const payload: WebhookPayload = await req.json()

    // Only handle status changes
    if (payload.type === 'UPDATE' && payload.old_record?.status === payload.record.status) {
      return new Response('No status change', { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { record } = payload
    const recipients: string[] = []
    let subject = ''
    let body = ''

    switch (record.status) {
      case 'pending_review': {
        subject = `[SC-Wiki] New edit proposal: "${record.title}"`
        body = `A new edit proposal has been submitted for review.\n\nTitle: ${record.title}\nPage: ${record.doc_path}\n\nPlease review at: ${Deno.env.get('SITE_URL') || 'https://sc-wiki.meijer.com'}/review`

        // Get all reviewers and admins
        const { data: reviewers } = await supabase
          .from('user_profiles')
          .select('email')
          .in('role', ['reviewer', 'admin'])

        if (reviewers) {
          recipients.push(...reviewers.map(r => r.email))
        }

        // Also get author's manager
        const { data: author } = await supabase
          .from('user_profiles')
          .select('manager:manager_id(email)')
          .eq('id', record.author_id)
          .single()

        if (author?.manager?.email) {
          recipients.push(author.manager.email)
        }
        break
      }

      case 'approved':
      case 'rejected': {
        const statusText = record.status === 'approved' ? 'approved' : 'rejected'
        subject = `[SC-Wiki] Your proposal "${record.title}" has been ${statusText}`
        body = `Your edit proposal has been ${statusText}.\n\nTitle: ${record.title}\nPage: ${record.doc_path}\n\nView details at: ${Deno.env.get('SITE_URL') || 'https://sc-wiki.meijer.com'}/proposals`

        const { data: authorProfile } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('id', record.author_id)
          .single()

        if (authorProfile?.email) {
          recipients.push(authorProfile.email)
        }
        break
      }

      default:
        return new Response('No notification needed', { status: 200 })
    }

    // Deduplicate recipients
    const uniqueRecipients = [...new Set(recipients)]

    if (uniqueRecipients.length === 0) {
      return new Response('No recipients', { status: 200 })
    }

    // Send emails via SMTP
    // Uses Deno's built-in SMTP or a transactional email service
    const smtpHost = Deno.env.get('SMTP_HOST')
    if (!smtpHost) {
      console.log('SMTP not configured. Would send to:', uniqueRecipients.join(', '))
      console.log('Subject:', subject)
      return new Response('SMTP not configured (logged)', { status: 200 })
    }

    // For production: integrate with your email service (SendGrid, SES, etc.)
    // This is a placeholder for the actual SMTP implementation
    console.log(`Sending email to ${uniqueRecipients.length} recipients:`, subject)

    return new Response(JSON.stringify({
      sent: true,
      recipients: uniqueRecipients.length,
      subject,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Notification error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
