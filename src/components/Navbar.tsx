import React from 'react'
import Link from "next/link";

const Navbar = () => {
    return (
        <header className="bg-primary-red p-4 text-ink shadow-md">
            <nav className="container mx-auto flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold">
                    Align
                </Link>
                <div className="flex space-x-4">
                    <Link href="/quiz" className="hover:underline">
                        Quiz
                    </Link>
                    <Link href="/diagnostics" className="hover:underline">
                        Diagnostics
                    </Link>
                    <Link href="/" className="hover:underline">
                        Logout
                    </Link>
                    <Link href="/friends" className="hover:underline">
                        Friends
                    </Link>
                </div>
            </nav>
        </header>
    )
}
export default Navbar
