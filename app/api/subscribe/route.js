import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, source } = body;

    // Validate email format
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const lowercasedEmail = email.toLowerCase().trim();

    // Check if already exists
    const existing = await Subscriber.findOne({ email: lowercasedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 409 }
      );
    }

    // Save new subscriber
    await Subscriber.create({
      email: lowercasedEmail,
      source: source || "homepage",
    });

    return NextResponse.json(
      { message: "Subscribed successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
