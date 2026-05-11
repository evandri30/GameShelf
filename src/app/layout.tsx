import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FadeIn, ScrollFadeIn } from '@/components/AnimatedSection'
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./globals.css";
import Provider from "./Provider";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <FadeIn>
            <Navbar />
          </FadeIn>
          <main className="pt-16">
            <ToastContainer position="top-center" autoClose={1000} />
            {children}
          </main>
          <ScrollFadeIn>
            <Footer />
          </ScrollFadeIn>
        </Provider>
      </body>
    </html>
  );
}
