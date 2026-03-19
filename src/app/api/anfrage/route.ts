import { Resend } from "resend";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, pflegebedarf } = await req.json();

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Bitte Namen angeben." }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from:    "pflegematch AT <onboarding@resend.dev>",
    to:      "office@ms-consulting.at",
    subject: "Neue Pflegeanfrage über pflegematch.at",
    html: `
      <p>Es ist eine neue unverbindliche Anfrage eingegangen:</p>
      <table>
        <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
        <tr><td><strong>Pflegebedarf:</strong></td><td>${pflegebedarf || "–"}</td></tr>
      </table>
    `,
  });

  if (error) {
    return NextResponse.json({ error: "E-Mail konnte nicht gesendet werden." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
