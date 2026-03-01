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
                    <h1 className="mb-6 text-center text-3xl font-bold text-cream">
                        Welcome to Align!
                    </h1>
                    <p className="text-center text-lg text-cream mb-8">
                        Ready to discover more about yourself and contribute to understanding human values?
                    </p>
                    <div className="flex flex-col space-y-4">
                        <Link href="/quiz" passHref className="bg-primary text-cream hover:bg-red-800 font-serif font-bold uppercase tracking-tight py-3 px-8 rounded-md text-center transition-colors duration-300">
                            Start Quiz
                        </Link>
                        <Link href="/diagnostics" passHref className="bg-secondary text-ink hover:bg-purple-800 font-serif font-bold uppercase tracking-tight py-3 px-8 rounded-md text-center transition-colors duration-300">
                            View Diagnostics
                        </Link>
                        <Link href="/friends" passHref className="bg-accent text-cream hover:bg-green-700 font-serif font-bold uppercase tracking-tight py-3 px-8 rounded-md text-center transition-colors duration-300">
                            Manage Friends
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return null; // Should not reach here if redirection works
}
