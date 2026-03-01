"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession
import { logToServer } from "@/utils/logger"; // Import the logger utility

interface Characteristic {
    trait_key: string;
    value: string | number[]; // value can be string for most traits, or number[] for personality_vector
    is_public: boolean;
}

export default function DiagnosticsPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session status

  const [characteristics, setCharacteristics] = useState<Characteristic[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // Redirect to login if not authenticated
      return;
    }

    async function fetchCharacteristics() {
      if (!session?.user?.id) {
        logToServer('error', "User not authenticated for fetching characteristics.");
        setLoading(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      if (!backendUrl) {
          logToServer('error', "NEXT_PUBLIC_BACKEND_API_URL is not defined.");
          setLoading(false);
          return;
      }

      try {
        const url = `${backendUrl}/profile/getCharacteristics`;
        const userIdWithSuffix = `${session.user.id}google`;
        logToServer('log', `Sending GET request to ${url}`, {
            headers: { "X-User-Id": userIdWithSuffix }
        });

        // Fetch characteristics from the actual backend
        const res = await fetch(url, {
          headers: {
            "X-User-Id": session.user.id, // Always send X-User-Id
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch characteristics data: ${res.status} ${res.statusText}`);
        }
        const data: { characteristics: Characteristic[] } = await res.json(); // Backend returns an object with a 'characteristics' array
        setCharacteristics(data.characteristics);
      } catch (err: any) {
        logToServer('error', "Error fetching characteristics data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchCharacteristics();
    }
  }, [status, router, session?.user?.id]); // Add session.user.id to dependencies

  if (status === "loading" || status === "unauthenticated" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-ink">Loading characteristics...</p>
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

  if (!characteristics || characteristics.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-secondary-grey">No characteristic data available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <main className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-md ">
        <h1 className="mb-6 text-center text-3xl font-bold text-primary">
          User Characteristics
        </h1>
        <div className="space-y-4 text-foreground">
          {characteristics.map((char) => (
            <p key={char.trait_key}>
              <strong>{char.trait_key}:</strong>{" "}
              {Array.isArray(char.value) ? char.value.join(", ") : char.value}
              {" "}
              {char.is_public ? "(Public)" : "(Private)"}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}
