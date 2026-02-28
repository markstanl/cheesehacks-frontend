"use client"; // This component will use client-side features like `router.push`

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    // Placeholder for Google SSO logic
    console.log("Attempting Google SSO login...");
    // For now, simply navigate to the quiz page after a "successful" login
    router.push("/quiz");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-foreground">
            Welcome to CheeseHacks
          </h2>
          <p className="mt-2 text-center text-lg text-secondary-grey">
            Please sign in to continue
          </p>
        </div>
        <div>
          <button
            onClick={handleGoogleLogin}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-red py-3 px-6 text-lg font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              {/* Placeholder for Google icon, using a simple circle for now */}
              <svg
                className="h-5 w-5 text-red-100 group-hover:text-red-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                <path d="M12 11h-1V8h1v3zm2-3h-1V5h1v3zm-4 5H9v-3h1v3zm2 0h-1v-3h1v3z" />
              </svg>
            </span>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
