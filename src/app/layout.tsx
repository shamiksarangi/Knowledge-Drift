import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KnowledgeDrift · RealPage Support Intelligence",
  description: "AI-Powered Self-Learning Support Intelligence for RealPage PropertySuite",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
