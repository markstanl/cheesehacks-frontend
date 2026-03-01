import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth"; // Import auth function from the new auth.ts file
import { LogoutButton } from "@/components/logout-button"; // Import LogoutButton from its new location

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CheeseHacks Frontend",
  description: "Frontend for CheeseHacks application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth(); // Use the auth function to get the session

  return (
    <html lang="en">
      <body
        className={`${interSans.variable} ${robotoMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <header className="bg-primary-red p-4 text-white shadow-md">
            <nav className="container mx-auto flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                CheeseHacks
              </Link>
              {session && ( // Conditionally render navigation links if session exists
                <div className="flex space-x-4">
                  <Link href="/quiz" className="hover:underline">
                    Quiz
                  </Link>
                  <Link href="/diagnostics" className="hover:underline">
                    Diagnostics
                  </Link>
                  <LogoutButton />
                </div>
              )}
            </nav>
          </header>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
