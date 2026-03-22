import { Resend } from "resend";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, firma, email, telefon, nachricht } = await req.json();

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Bitte Namen angeben." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Bitte gültige E-Mail-Adresse angeben." }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from:    "pflegematch.at <noreply@mail.pflegematch.at>",
    to:      "office@pflegematch.at",
    replyTo: email,
    subject: "Neue Partneranfrage über pflegematch.at",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D;">
        <div style="background: linear-gradient(135deg, #C06B4A, #A05438); padding: 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Neue Partneranfrage</h1>
        </div>
        <div style="background: #fff; padding: 32px; border: 1px solid #EAD9C8; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; width: 130px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Firma</td><td style="padding: 8px 0;">${firma || "–"}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">E-Mail</td><td style="padding: 8px 0;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Telefon</td><td style="padding: 8px 0;">${telefon || "–"}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; vertical-align: top;">Nachricht</td><td style="padding: 8px 0;">${nachricht || "–"}</td></tr>
          </table>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error (partner):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
