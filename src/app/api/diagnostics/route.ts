import { NextResponse } from "next/server";

export async function GET() {
  // Mock diagnostic data for a logged-in user
  const mockDiagnostics = {
    userId: "anonymous-user-123",
    quizAttempts: 5,
    lastScore: "80%",
    averageScore: "75%",
    topicsStrong: ["Mathematics", "Science"],
    topicsWeak: ["History", "Literature"],
    recommendations: ["Review history concepts", "Try more science quizzes"],
  };

  return NextResponse.json(mockDiagnostics);
}
