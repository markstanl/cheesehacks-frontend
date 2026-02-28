import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // Import Link for navigation

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-primary-red p-4 text-white shadow-md">
          <nav className="container mx-auto flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              CheeseHacks
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
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
