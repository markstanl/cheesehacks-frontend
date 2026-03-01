"use client"; // Mark as Client Component

import React from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/logout-button";

const Navbar = () => {
    const { status } = useSession();
    const pathname = usePathname();

    const isAuthenticated = status === "authenticated";

    return (
        <header className="bg-primary p-4 text-cream shadow-md">
            <nav className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-cream">
                    Align
                </Link>
                <div className="flex space-x-4">
                    {isAuthenticated && pathname !== "/quiz" && (
                        <Link href="/quiz" className="hover:underline text-ink">
                            Quiz
                        </Link>
                    )}
                    {isAuthenticated && pathname !== "/diagnostics" && (
                        <Link href="/diagnostics" className="hover:underline text-ink">
                            Diagnostics
                        </Link>
                    )}
                    {isAuthenticated && pathname !== "/friends" && (
                        <Link href="/friends" className="hover:underline text-ink">
                            Friends
                        </Link>
                    )}
                    {isAuthenticated && (
                        <LogoutButton />
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
