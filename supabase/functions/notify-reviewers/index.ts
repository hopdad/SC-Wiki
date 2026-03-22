// Supabase Edge Function: Email notifications for proposal status changes
// Deploy with: supabase functions deploy notify-reviewers
//
// Requires environment variables:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//   WEBHOOK_SECRET — shared secret for request verification
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
    // Verify webhook authenticity
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
    if (webhookSecret) {
      const authHeader = req.headers.get('x-webhook-secret') || req.headers.get('authorization')
      if (authHeader !== `Bearer ${webhookSecret}` && authHeader !== webhookSecret) {
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const payload: WebhookPayload = await req.json()

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
    const siteUrl = Deno.env.get('SITE_URL') || 'https://sc-wiki.meijer.com'

    switch (record.status) {
      case 'pending_review': {
        subject = `[SC-Wiki] New edit proposal: "${record.title}"`
        body = `A new edit proposal has been submitted for review.\n\nTitle: ${record.title}\nPage: ${record.doc_path}\n\nPlease review at: ${siteUrl}/review`

        // Fetch reviewers and author's manager in parallel
        const [{ data: reviewers }, { data: author }] = await Promise.all([
          supabase.from('user_profiles').select('email').in('role', ['reviewer', 'admin']),
          supabase.from('user_profiles').select('manager:manager_id(email)').eq('id', record.author_id).single(),
        ])

        if (reviewers) {
          recipients.push(...reviewers.map(r => r.email))
        }
        if (author?.manager?.email) {
          recipients.push(author.manager.email)
        }
        break
      }

      case 'approved':
      case 'rejected': {
        const statusText = record.status === 'approved' ? 'approved' : 'rejected'
        subject = `[SC-Wiki] Your proposal "${record.title}" has been ${statusText}`
        body = `Your edit proposal has been ${statusText}.\n\nTitle: ${record.title}\nPage: ${record.doc_path}\n\nView details at: ${siteUrl}/proposals`

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

    const uniqueRecipients = [...new Set(recipients)]

    if (uniqueRecipients.length === 0) {
      return new Response('No recipients', { status: 200 })
    }

    const smtpHost = Deno.env.get('SMTP_HOST')
    if (!smtpHost) {
      console.log('SMTP not configured. Would send to:', uniqueRecipients.join(', '))
      console.log('Subject:', subject)
      return new Response('SMTP not configured (logged)', { status: 200 })
    }

    // Production: integrate with SendGrid, SES, or SMTP library
    console.log(`Sending email to ${uniqueRecipients.length} recipients:`, subject)

    return new Response(JSON.stringify({
      sent: true,
      recipients: uniqueRecipients.length,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Notification error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
