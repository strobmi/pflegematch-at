import { Resend } from "resend";

interface EmailChangeParams {
  to: string;
  confirmUrl: string;
}

export async function sendEmailChangeConfirmation({ to, confirmUrl }: EmailChangeParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[emailChange] RESEND_API_KEY nicht gesetzt. Confirm-URL:", confirmUrl);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "pflegematch.at <noreply@pflegematch.at>",
    to,
    subject: "E-Mail-Adresse bestätigen – pflegematch.at",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: linear-gradient(135deg, #C06B4A, #A05438); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Neue E-Mail-Adresse bestätigen</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hallo,</p>
          <p>Sie haben eine Änderung Ihrer E-Mail-Adresse auf <strong>pflegematch.at</strong> angefordert. Bitte bestätigen Sie, dass diese Adresse Ihnen gehört.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${confirmUrl}" style="background: #C06B4A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              E-Mail-Adresse bestätigen
            </a>
          </div>
          <p style="color: #888; font-size: 14px;">
            Dieser Link ist <strong>24 Stunden</strong> gültig. Falls Sie keine Änderung beantragt haben, können Sie diese E-Mail ignorieren – Ihre bisherige Adresse bleibt unverändert.
          </p>
          <p style="color: #C06B4A; font-size: 13px; word-break: break-all;">${confirmUrl}</p>
          <hr style="border: none; border-top: 1px solid #EAD9C8; margin: 24px 0;" />
          <p style="color: #888; font-size: 13px; margin: 0;">
            Mit freundlichen Grüßen<br />
            Ihr pflegematch.at Team
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error (email change):", error);
  }
}
