"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const Page = () => {
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="">Loading session...</p>
            </div>
        );
    }

    if (status === "authenticated") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <main className="w-full max-w-2xl rounded-lg bg-dark-ink text-cream p-8 shadow-md ">
                    <h1 className="mb-6 text-center text-3xl font-bold text-cream">
                        Friends
                    </h1>
                    {/* Add friends content here */}
                    <p>This is the friends page content.</p>
                </main>
            </div>
        );
    }

    return null; // Should not reach here if redirection works
};

export default Page;
