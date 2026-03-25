import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aplikasi Sekolah SD - Sistem Manajemen Sekolah",
  description: "Aplikasi manajemen sekolah SD untuk pembelajaran jarak jauh tahun ajaran 2025/2026",
  keywords: ["Sekolah", "SD", "Pendidikan", "E-Learning", "Manajemen Sekolah"],
  authors: [{ name: "Tim Aplikasi Sekolah" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Aplikasi Sekolah SD",
    description: "Sistem manajemen sekolah SD untuk pembelajaran jarak jauh",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
