"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {Button} from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If the session is loaded and the user is authenticated, redirect to the new landing page.
    if (status === "authenticated") {
      router.push("/landing");
    }
  }, [status, router]);

  const handleGoogleLogin = () => {
    signIn("google"); // Initiate Google SSO login
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-ink">Loading...</p>
      </div>
    );
  }

  // Only show the login button if not authenticated and not loading
  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream text-ink">
        <div className="w-full max-w-md space-y-8 text-center bg-white p-8 rounded-lg shadow-lg">
            <div>
                <h2 className="mt-6 text-center text-7xl font-extrabold text-primary">
                    Align
                </h2>
                <p className="mt-4 text-center text-base text-ink">
                    Answer absurd ethical dilemmas, and we'll tell you about yourself.
                    Help LLMs understand human values, and we'll help you understand yourself.
                </p>
            </div>
          <div className="pt-4">
              <Button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2"
                  variant="primary"
              >
                  <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                  >
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.15 30.01 0 24 0 14.65 0 6.58 5.39 2.76 13.09l7.98 6.19C13.25 13.91 18.06 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.7 24c0-1.57-.15-3.09-.38-4.55H24v9.01h12.51c-.41 2.17-1.49 3.96-2.92 5.15l6.86 5.33c4.09-3.8 6.47-9.4 6.47-16.04z"/>
                      <path fill="#FBBC04" d="M10.75 28.5c-.87-2.61-.87-5.39 0-8L2.76 13.09C-1.07 20.79-1.07 27.21 2.76 34.91l7.99-6.41z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.95-2.13 15.96-5.75l-6.85-5.33c-2.49 1.6-5.61 2.54-9.11 2.54-5.94 0-10.75-4.41-12.51-10.91l-7.98 6.41C6.58 42.61 14.65 48 24 48z"/>
                  </svg>
                  Sign in with Google
              </Button>
          </div>
        </div>
      </div>
    );
  }
}
