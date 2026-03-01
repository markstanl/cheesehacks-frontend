"use client";

import { useState, useEffect } from "react";

interface DiagnosticsData {
  userId: string;
  quizAttempts: number;
  lastScore: string;
  averageScore: string;
  topicsStrong: string[];
  topicsWeak: string[];
  recommendations: string[];
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        const res = await fetch("/api/diagnostics");
        if (!res.ok) {
          throw new Error("Failed to fetch characteristics data");
        }
        const data: DiagnosticsData = await res.json();
        setDiagnostics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-secondary-grey">Loading characteristics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-primary">Error: {error}</p>
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-secondary-grey">No diagnostic data available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <main className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md ">
        <h1 className="mb-6 text-center text-3xl font-bold text-primary">
          User Diagnostics
        </h1>
        <div className="space-y-4 text-foreground">
          <p>
            <strong>User ID:</strong> {diagnostics.userId}
          </p>
          <p>
            <strong>Quiz Attempts:</strong> {diagnostics.quizAttempts}
          </p>
          <p>
            <strong>Last Score:</strong> {diagnostics.lastScore}
          </p>
          <p>
            <strong>Average Score:</strong> {diagnostics.averageScore}
          </p>
          <div>
            <strong>Strong Topics:</strong>
            <ul className="list-disc list-inside ml-4">
              {diagnostics.topicsStrong.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Weak Topics:</strong>
            <ul className="list-disc list-inside ml-4">
              {diagnostics.topicsWeak.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Recommendations:</strong>
            <ul className="list-disc list-inside ml-4">
              {diagnostics.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
