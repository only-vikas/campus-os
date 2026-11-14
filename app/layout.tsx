import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus OS — One Intelligent Campus Operating System",
  description: "A simulated intelligent desktop environment for engineering students: learning, finance, code security, and placements.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark scroll-smooth">
        <body className={`${inter.className} min-h-screen bg-[#0A0C10] text-[#F1F5F9] antialiased selection:bg-indigo-500/30 selection:text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
