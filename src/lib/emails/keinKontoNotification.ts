import { Resend } from "resend";

export async function sendKeinKontoNotification(): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[keinKontoNotification] RESEND_API_KEY nicht gesetzt.");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "pflegematch.at <noreply@pflegematch.at>",
    to: "office@ms-consulting.at",
    subject: "pflegematch.at – Kein Konto Anfrage",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: linear-gradient(135deg, #C06B4A, #A05438); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Neue Konto-Anfrage</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Jemand hat auf der Login-Seite von <strong>pflegematch.at</strong> auf „Kein Konto?" geklickt und möchte Kontakt aufnehmen.</p>
          <p>Bitte melde dich bei dieser Person oder prüfe, ob eine Registrierung gewünscht wird.</p>
          <hr style="border: none; border-top: 1px solid #EAD9C8; margin: 24px 0;" />
          <p style="color: #888; font-size: 13px; margin: 0;">
            Mit freundlichen Grüßen<br />
            Ihr pflegematch.at System
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error (kein konto notification):", error);
  }
}
