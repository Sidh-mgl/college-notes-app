import { NextResponse } from "next/server";

export async function POST(req) {
  const response = NextResponse.json({ message: "Logged out successfully" });
  
  response.cookies.set({
    name: "admin_token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
