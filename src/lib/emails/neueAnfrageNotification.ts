import { Resend } from "resend";

interface NeueAnfrageNotificationParams {
  adminEmail: string;
  adminName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dashboardUrl: string;
}

export async function sendNeueAnfrageNotification({
  adminEmail,
  adminName,
  contactName,
  contactEmail,
  contactPhone,
  dashboardUrl,
}: NeueAnfrageNotificationParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[neueAnfrage] RESEND_API_KEY nicht gesetzt.");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "pflegematch.at <noreply@mail.pflegematch.at>",
    to: adminEmail,
    subject: "Neue Pflegeanfrage – Bitte Matching durchführen",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: linear-gradient(135deg, #C06B4A, #A05438); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Neue Pflegeanfrage</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hallo ${adminName},</p>
          <p>Eine neue Pflegeanfrage wurde Ihnen auf <strong>pflegematch.at</strong> zugewiesen. Bitte führen Sie das Matching durch.</p>

          <h2 style="font-size: 15px; color: #C06B4A; margin: 24px 0 12px;">Kontaktdaten der anfragenden Person</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 6px 12px 6px 0; color: #666; white-space: nowrap; vertical-align: top;"><strong>Name:</strong></td>
              <td style="padding: 6px 0; color: #2D2D2D;">${contactName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px 6px 0; color: #666; white-space: nowrap; vertical-align: top;"><strong>E-Mail:</strong></td>
              <td style="padding: 6px 0; color: #2D2D2D;">${contactEmail}</td>
            </tr>
            ${contactPhone ? `<tr>
              <td style="padding: 6px 12px 6px 0; color: #666; white-space: nowrap; vertical-align: top;"><strong>Telefon:</strong></td>
              <td style="padding: 6px 0; color: #2D2D2D;">${contactPhone}</td>
            </tr>` : ""}
          </table>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${dashboardUrl}" style="background: #C06B4A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Zur Anfrage im Dashboard
            </a>
          </div>

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
    console.error("Resend error (neue Anfrage Notification):", error);
  }
}
