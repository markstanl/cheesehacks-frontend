import type {Metadata} from "next";
import {Geist, Geist_Mono, Libre_Baskerville, Inter} from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const libre = Libre_Baskerville({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-libre",
    style: ["normal", "italic"],
});

export const metadata: Metadata = {
    title: "CheeseHacks Frontend",
    description: "Frontend for CheeseHacks application",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${libre.variable} ${geistMono.variable} ${inter.variable} ${geistSans.variable}`}>
            <body
                className="antialiased font-serif h-screen w-screen"
            >
                <Navbar />
                {children}
            </body>
        </html>
    );
}