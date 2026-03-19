import { Resend } from "resend";
import { format } from "date-fns";
import { de } from "date-fns/locale";

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
    from: "pflegematch AT <onboarding@resend.dev>",
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
    from: "pflegematch AT <onboarding@resend.dev>",
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
