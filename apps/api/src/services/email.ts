import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.EMAIL_FROM ?? 'TroveJob <noreply@trovejob.com>'
const WEB    = process.env.WEB_URL    ?? 'https://trovejob.com'

// ── Candidate emails ──────────────────────────────────────────────────────────

export async function sendApplicationConfirmation(opts: {
  to:          string
  name:        string
  jobTitle:    string
  company:     string
  deadline:    Date
  token:       string
}) {
  const statusUrl = `${WEB}/application/${opts.token}`
  const deadlineStr = opts.deadline.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Application received — ${opts.jobTitle} at ${opts.company}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1714">
        <p style="font-size:13px;color:#8c7f72;letter-spacing:0.1em;text-transform:uppercase">TroveJob</p>
        <h2 style="font-weight:300;font-size:24px;margin:8px 0">Application received</h2>
        <p>Hi ${opts.name},</p>
        <p>Your application for <strong>${opts.jobTitle}</strong> at <strong>${opts.company}</strong> has been received.</p>
        <p>${opts.company} has committed to responding to every applicant by <strong>${deadlineStr}</strong>.</p>
        <p style="margin:24px 0">
          <a href="${statusUrl}" style="background:#b8913a;color:#f5f0e8;padding:12px 24px;text-decoration:none;font-family:monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">
            Track your application
          </a>
        </p>
        <p style="font-size:12px;color:#8c7f72">
          No account needed — the link above is your personal status page.<br/>
          Browse more roles at <a href="${WEB}" style="color:#b8913a">${WEB}</a>
        </p>
      </div>
    `,
  })
}

export async function sendApplicationStatusUpdate(opts: {
  to:         string
  name:       string
  jobTitle:   string
  company:    string
  status:     'viewed' | 'responded' | 'hired'
  note?:      string
  token:      string
}) {
  const messages: Record<string, string> = {
    viewed:    `${opts.company} has viewed your application.`,
    responded: `${opts.company} has responded to your application.`,
    hired:     `Congratulations — ${opts.company} wants to move forward with you.`,
  }

  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Update on your application — ${opts.jobTitle}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1714">
        <p style="font-size:13px;color:#8c7f72;letter-spacing:0.1em;text-transform:uppercase">TroveJob</p>
        <h2 style="font-weight:300;font-size:24px;margin:8px 0">Application update</h2>
        <p>Hi ${opts.name},</p>
        <p>${messages[opts.status]}</p>
        ${opts.note ? `<blockquote style="border-left:2px solid #b8913a;padding-left:16px;color:#1a1714">${opts.note}</blockquote>` : ''}
        <p style="margin:24px 0">
          <a href="${WEB}/application/${opts.token}" style="background:#b8913a;color:#f5f0e8;padding:12px 24px;text-decoration:none;font-family:monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">
            View status
          </a>
        </p>
      </div>
    `,
  })
}

// ── Employer emails ───────────────────────────────────────────────────────────

export async function sendNewApplicationAlert(opts: {
  to:          string
  applicant:   string
  jobTitle:    string
  note?:       string
  applicationUrl: string
}) {
  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `New application — ${opts.jobTitle}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1714">
        <p style="font-size:13px;color:#8c7f72;letter-spacing:0.1em;text-transform:uppercase">TroveJob</p>
        <h2 style="font-weight:300;font-size:24px;margin:8px 0">New application</h2>
        <p><strong>${opts.applicant}</strong> has applied for <strong>${opts.jobTitle}</strong>.</p>
        ${opts.note ? `<p style="background:#f5f0e8;padding:12px;font-style:italic">"${opts.note}"</p>` : ''}
        <p style="margin:24px 0">
          <a href="${opts.applicationUrl}" style="background:#1a1714;color:#f5f0e8;padding:12px 24px;text-decoration:none;font-family:monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">
            View application
          </a>
        </p>
        <p style="font-size:12px;color:#8c7f72">Remember — you've committed to responding within 7 days.</p>
      </div>
    `,
  })
}

export async function sendResponseDeadlineWarning(opts: {
  to:        string
  company:   string
  jobTitle:  string
  count:     number
  daysLeft:  number
  dashboardUrl: string
}) {
  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `⚠ ${opts.count} applicants awaiting response — ${opts.daysLeft} days left`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1714">
        <p style="font-size:13px;color:#8c7f72;letter-spacing:0.1em;text-transform:uppercase">TroveJob — Action required</p>
        <h2 style="font-weight:300;font-size:24px;margin:8px 0">Response deadline approaching</h2>
        <p>You have <strong>${opts.count} applicants</strong> waiting for a response on <strong>${opts.jobTitle}</strong>.</p>
        <p>Deadline: <strong>${opts.daysLeft} days remaining</strong>.</p>
        <p style="margin:24px 0">
          <a href="${opts.dashboardUrl}" style="background:#b8913a;color:#f5f0e8;padding:12px 24px;text-decoration:none;font-family:monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">
            Review applications
          </a>
        </p>
        <p style="font-size:12px;color:#8c7f72">Maintaining your response rate keeps your company visible to top candidates.</p>
      </div>
    `,
  })
}

export async function sendEmployerWelcome(opts: {
  to:      string
  name:    string
  company: string
  loginUrl: string
}) {
  await resend.emails.send({
    from:    FROM,
    to:      opts.to,
    subject: `Welcome to TroveJob — ${opts.company} is approved`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1714">
        <p style="font-size:13px;color:#8c7f72;letter-spacing:0.1em;text-transform:uppercase">TroveJob</p>
        <h2 style="font-weight:300;font-size:24px;margin:8px 0">You're approved.</h2>
        <p>Hi ${opts.name},</p>
        <p><strong>${opts.company}</strong> has been approved as a TroveJob employer. You can now post roles and start reaching serious candidates.</p>
        <p style="margin:24px 0">
          <a href="${opts.loginUrl}" style="background:#1a1714;color:#f5f0e8;padding:12px 24px;text-decoration:none;font-family:monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase">
            Set up your account
          </a>
        </p>
        <p style="font-size:12px;color:#8c7f72">Your commitment: respond to every applicant within 7 days of their application.</p>
      </div>
    `,
  })
}
