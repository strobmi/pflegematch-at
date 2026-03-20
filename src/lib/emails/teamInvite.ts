import { Resend } from "resend";

interface TeamInviteParams {
  to: string;
  tenantName: string;
  inviterName: string;
  inviteUrl: string;
}

export async function sendTeamInviteEmail({
  to,
  tenantName,
  inviterName,
  inviteUrl,
}: TeamInviteParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[teamInvite] RESEND_API_KEY nicht gesetzt. Einladungs-URL:", inviteUrl);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "pflegematch.at <noreply@pflegematch.at>",
    to,
    subject: `Einladung zum Team bei ${tenantName} – pflegematch.at`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: linear-gradient(135deg, #C06B4A, #A05438); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Sie wurden eingeladen</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hallo,</p>
          <p><strong>${inviterName}</strong> hat Sie eingeladen, dem Team von <strong>${tenantName}</strong> auf pflegematch.at beizutreten.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteUrl}" style="background: #C06B4A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Einladung annehmen
            </a>
          </div>
          <p style="color: #888; font-size: 14px;">
            Diese Einladung ist 7 Tage gültig. Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:
          </p>
          <p style="color: #C06B4A; font-size: 13px; word-break: break-all;">${inviteUrl}</p>
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
    console.error("Resend error (team invite):", error);
  }
}
