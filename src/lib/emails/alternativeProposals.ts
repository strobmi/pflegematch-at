import { Resend } from "resend";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Proposal {
  proposedAt: Date;
  durationMin: number;
}

interface AlternativeProposalEmailParams {
  to: string | string[];
  recipientName: string;
  kundenName: string;
  proposals: Proposal[];
  matchesUrl: string;
}

export async function sendAlternativeProposalEmail({
  to,
  recipientName,
  kundenName,
  proposals,
  matchesUrl,
}: AlternativeProposalEmailParams): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const proposalRows = proposals
    .map(
      (p, i) => `
      <tr style="border-bottom: 1px solid #EAD9C8;">
        <td style="padding: 12px 8px; color: #666; width: 30px; font-weight: 600;">${i + 1}.</td>
        <td style="padding: 12px 8px; font-weight: 600;">
          ${format(p.proposedAt, "EEEE, dd. MMMM yyyy", { locale: de })}
        </td>
        <td style="padding: 12px 8px;">
          ${format(p.proposedAt, "HH:mm")} Uhr
        </td>
        <td style="padding: 12px 8px; color: #888;">
          ${p.durationMin} Min.
        </td>
      </tr>`
    )
    .join("");

  const { error } = await resend.emails.send({
    from: "pflegematch.at <noreply@pflegematch.at>",
    to,
    subject: `${kundenName} schlägt Alternativtermine vor`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: linear-gradient(135deg, #7B9E7B, #5A7D5A); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Alternativtermine vom Kunden</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hallo ${recipientName},</p>
          <p><strong>${kundenName}</strong> konnte keinen der vorgeschlagenen Termine wahrnehmen und schlägt folgende Alternativen vor:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <thead>
              <tr style="background: #FAF6F1;">
                <th style="padding: 10px 8px; text-align: left; color: #888; font-weight: 500; font-size: 13px;"></th>
                <th style="padding: 10px 8px; text-align: left; color: #888; font-weight: 500; font-size: 13px;">Datum</th>
                <th style="padding: 10px 8px; text-align: left; color: #888; font-weight: 500; font-size: 13px;">Uhrzeit</th>
                <th style="padding: 10px 8px; text-align: left; color: #888; font-weight: 500; font-size: 13px;">Dauer</th>
              </tr>
            </thead>
            <tbody>
              ${proposalRows}
            </tbody>
          </table>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${matchesUrl}" style="background: #C06B4A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Termin bestätigen
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
    throw new Error(`Resend error (alternative proposals): ${error.message}`);
  }
}
