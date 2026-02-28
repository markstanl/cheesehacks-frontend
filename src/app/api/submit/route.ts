import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const submissionData = await request.json();
  console.log("Quiz submission received:", submissionData);

  // In a real application, you would process and store this data
  // For now, we just acknowledge receipt.
  return NextResponse.json({ message: "Quiz submitted successfully!", receivedData: submissionData });
}
