"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function LandingPage() {
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/"); // Redirect to login if not authenticated
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="text-ink">Loading session...</p>
            </div>
        );
    }

    if (status === "authenticated") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <main className="w-full max-w-2xl rounded-lg bg-dark-ink text-cream p-8 shadow-md ">
                    <h1 className="mb-6 text-center text-3xl font-bold text-primary">
                        Welcome to Align!
                    </h1>
                    <p className="text-center text-base text-light-grey mb-8">
                        Ready to discover more about yourself and contribute to understanding human values?
                    </p>
                    <div className="flex flex-col space-y-4">
                        <Link href="/quiz" passHref className="bg-primary text-cream hover:bg-primary/90 font-sans font-bold text-base py-3 px-8 rounded-md text-center transition-colors duration-300 shadow-sm">
                            Start Quiz
                        </Link>
                        <Link href="/diagnostics" passHref className="bg-secondary text-cream hover:bg-secondary/90 font-sans font-medium text-sm py-3 px-8 rounded-md text-center transition-colors duration-300 shadow-sm">
                            View Diagnostics
                        </Link>
                        <Link href="/friends" passHref className="bg-accent text-cream hover:bg-accent/90 font-sans font-medium text-sm py-3 px-8 rounded-md text-center transition-colors duration-300 shadow-sm">
                            Manage Friends
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return null; // Should not reach here if redirection works
}
