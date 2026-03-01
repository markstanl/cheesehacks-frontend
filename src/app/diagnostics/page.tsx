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
        const userIdWithSuffix = `${session.user.id}google`;
        const url = `${backendUrl}/profile/getCharacteristics`; // Endpoint for fetching current user's characteristics
        logToServer('log', `Sending GET request to ${url}`, {
            headers: { "X-User-Id": userIdWithSuffix }
        });

        const res = await fetch(url, {
          headers: {
            "X-User-Id": userIdWithSuffix, // Authenticated user ID for the header
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch characteristics data: ${res.status} ${res.statusText}`);
        }
        // The /profile/getCharacteristics endpoint is expected to return an object with a 'characteristics' array
        // or potentially the array directly if the backend implementation differs slightly from the mock interpretation.
        const responseData = await res.json();
        let fetchedCharacteristics: Characteristic[] = [];

        if (Array.isArray(responseData)) {
            // If the API returns an array directly
            fetchedCharacteristics = responseData;
        } else if (responseData && typeof responseData === 'object' && Array.isArray(responseData.characteristics)) {
            // If the API returns an object with a 'characteristics' array
            fetchedCharacteristics = responseData.characteristics;
        } else {
            logToServer('warn', 'Unexpected data format from /profile/getCharacteristics endpoint:', responseData);
        }
        setCharacteristics(fetchedCharacteristics);
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-cream text-ink">
      <main className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-primary">
          User Characteristics
        </h1>
        <div className="space-y-4 text-ink">
          {characteristics.map((char) => (
            <div key={char.trait_key} className="p-3 bg-cream rounded-md border border-light-grey">
              <p>
                <strong>{char.trait_key}:</strong>{" "}
                {Array.isArray(char.value) ? char.value.map(val => (typeof val === 'number' ? val.toFixed(4) : val)).join(", ") : char.value}
                {" "}
                <span className="text-sm text-secondary">
                  {char.is_public ? "(Public)" : "(Private)"}
                </span>
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
