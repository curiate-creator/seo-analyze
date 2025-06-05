import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const acceptedEmail = process.env.ACCEPTED_EMAIL;

    if (!acceptedEmail) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const isValid = email.toLowerCase().trim() === acceptedEmail.toLowerCase();

    return NextResponse.json({ isValid });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }
}
