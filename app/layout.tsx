import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuardSport — Digital Asset Protection",
  description: "Protect your sports video content from piracy. Register assets, detect violations, and take action — all in one dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }} className="min-h-full bg-slate-950 text-slate-900">{children}</body>
    </html>
  );
}
