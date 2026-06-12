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
  title: "Web_Trex_ - AI Assistant & Website Creator",
  description: "Web_Trex_ AI Assistant - Chat with AI, create websites instantly. Powered by advanced AI technology.",
  keywords: ["Web_Trex_", "AI Assistant", "Website Creator", "AI Chat", "Next.js", "TypeScript"],
  authors: [{ name: "Web_Trex_" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Web_Trex_ - AI Assistant",
    description: "AI Assistant & Website Creator powered by Web_Trex_",
    url: "https://webtrex-ai.firebaseapp.com",
    siteName: "Web_Trex_",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web_Trex_ - AI Assistant",
    description: "AI Assistant & Website Creator powered by Web_Trex_",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
