import { Resend } from "resend";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface MatchNotificationParams {
  to: string;
  caregiverName: string;
  clientName: string;
  wunschtermine?: Array<{ dateTime: string; durationMin: number }>;
  portalUrl: string;
}

export async function sendMatchNotificationEmail({
  to,
  caregiverName,
  clientName,
  wunschtermine,
  portalUrl,
}: MatchNotificationParams): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const slots = (wunschtermine ?? []).filter((s) => new Date(s.dateTime) > new Date());

  const slotsHtml = slots.length > 0
    ? `
      <p style="margin: 16px 0 8px; font-weight: 600;">Wunschtermine für das Kennenlerngespräch:</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        ${slots.map((s) => {
          const d = new Date(s.dateTime);
          return `<tr>
            <td style="padding: 6px 0; color: #666;">
              ${format(d, "EEEE, dd. MMMM yyyy · HH:mm 'Uhr'", { locale: de })}
              &nbsp;(${s.durationMin} Min.)
            </td>
          </tr>`;
        }).join("")}
      </table>
      <p style="color: #555; font-size: 14px;">Bitte bestätigen Sie einen der Wunschtermine direkt im Portal.</p>
    `
    : `<p style="color: #555; font-size: 14px;">Der Klient hat noch keine Wunschtermine angegeben. Sie können selbst einen Termin vorschlagen.</p>`;

  const { error } = await resend.emails.send({
    from: "pflegematch.at <noreply@mail.pflegematch.at>",
    to,
    subject: `Neuer Match: Kennenlerngespräch mit ${clientName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: linear-gradient(135deg, #C06B4A, #A05438); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Neuer Match für Sie</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hallo ${caregiverName},</p>
          <p>Sie wurden mit einem neuen Klienten gematcht und ein Kennenlerngespräch ist erwünscht.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0 24px;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 40%;">Klient</td>
              <td style="padding: 8px 0; font-weight: 600;">${clientName}</td>
            </tr>
          </table>
          ${slotsHtml}
          <div style="text-align: center; margin: 32px 0;">
            <a href="${portalUrl}" style="background: #C06B4A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Zum Portal
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
    console.error("Resend error (match notification):", error);
  }
}

interface MeetingScheduledParams {
  to: string;
  recipientName: string;
  partnerName: string;
  scheduledAt: Date;
  durationMin: number;
  joinUrl: string;
  notes?: string | null;
}

interface MeetingCancelledParams {
  to: string;
  recipientName: string;
  partnerName: string;
  scheduledAt: Date;
}

export async function sendMeetingScheduledEmail({
  to,
  recipientName,
  partnerName,
  scheduledAt,
  durationMin,
  joinUrl,
  notes,
}: MeetingScheduledParams): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const dateStr = format(scheduledAt, "EEEE, dd. MMMM yyyy", { locale: de });
  const timeStr = format(scheduledAt, "HH:mm", { locale: de });
  const subject = `Ihr Videotermin bei pflegematch.at – ${dateStr}`;

  const { error } = await resend.emails.send({
    from: "pflegematch.at <noreply@mail.pflegematch.at>",
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: linear-gradient(135deg, #C06B4A, #A05438); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Ihr Videotermin ist geplant</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hallo ${recipientName},</p>
          <p>Ihr Videotermin mit <strong>${partnerName}</strong> wurde erfolgreich geplant.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 40%;">Datum</td>
              <td style="padding: 8px 0; font-weight: 600;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Uhrzeit</td>
              <td style="padding: 8px 0; font-weight: 600;">${timeStr} Uhr</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Dauer</td>
              <td style="padding: 8px 0; font-weight: 600;">${durationMin} Minuten</td>
            </tr>
            ${notes ? `<tr><td style="padding: 8px 0; color: #666;">Hinweis</td><td style="padding: 8px 0;">${notes}</td></tr>` : ""}
          </table>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${joinUrl}" style="background: #C06B4A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Jetzt beitreten
            </a>
          </div>
          <p style="color: #888; font-size: 14px;">
            Sie können dem Gespräch direkt über den Button beitreten. Es ist keine Installation erforderlich.
          </p>
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
    console.error("Resend error (meeting scheduled):", error);
  }
}

export async function sendMeetingCancelledEmail({
  to,
  recipientName,
  partnerName,
  scheduledAt,
}: MeetingCancelledParams): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const dateStr = format(scheduledAt, "EEEE, dd. MMMM yyyy", { locale: de });
  const timeStr = format(scheduledAt, "HH:mm", { locale: de });

  const { error } = await resend.emails.send({
    from: "pflegematch.at <noreply@mail.pflegematch.at>",
    to,
    subject: `Videotermin abgesagt – ${dateStr}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: #888; padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Videotermin abgesagt</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hallo ${recipientName},</p>
          <p>Ihr Videotermin mit <strong>${partnerName}</strong> am <strong>${dateStr} um ${timeStr} Uhr</strong> wurde leider abgesagt.</p>
          <p>Bei Fragen wenden Sie sich bitte an Ihren Vermittler.</p>
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
    console.error("Resend error (meeting cancelled):", error);
  }
}
