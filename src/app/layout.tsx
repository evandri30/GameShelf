import type { Metadata } from "next";
import { Chakra_Petch, Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar, { MobileNavSlot } from "../components/Navbar";
import Footer from "../components/Footer";
import TimeZoneCookie from "../components/TimeZoneCookie";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  // absolute base for OG image URLs (e.g. /u/[username]/opengraph-image) when links are shared
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "GameShelf",
  description: "GameShelf helps you explore popular games, view details, and save your favorites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${chakraPetch.variable} flex min-h-dvh flex-col font-sans antialiased`}
      >
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(198,244,50,0.07),transparent_55%)]"
        />
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
        <MobileNavSlot />
        <TimeZoneCookie />
        <ToastContainer position="top-center" autoClose={1500} theme="dark" />
      </body>
    </html>
  );
}
