import React from 'react'
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

const Navbar = () => {
    return (
        <header className="bg-primary p-4 text-cream shadow-md">
            <nav className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-cream">
                    Align
                </Link>
                <div className="flex space-x-4">
                    <Link href="/quiz" className="hover:underline text-ink">
                        Quiz
                    </Link>
                    <Link href="/diagnostics" className="hover:underline text-ink">
                        Diagnostics
                    </Link>
                    <LogoutButton />
                    <Link href="/friends" className="hover:underline text-ink">
                        Friends
                    </Link>
                </div>
            </nav>
        </header>
    )
}
export default Navbar
