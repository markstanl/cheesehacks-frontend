import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Import auth function from the new auth.ts file

export async function GET() {
  const session = await auth(); // Use the auth function to get the session

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // Mock diagnostic data for the logged-in user
  const mockDiagnostics = {
    userId: session.user.id, // Use the actual user ID from the session
    quizAttempts: 5,
    lastScore: "80%",
    averageScore: "75%",
    topicsStrong: ["Mathematics", "Science"],
    topicsWeak: ["History", "Literature"],
    recommendations: ["Review history concepts", "Try more science quizzes"],
  };

  return NextResponse.json(mockDiagnostics);
}
