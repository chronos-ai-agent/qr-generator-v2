import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beautiful QR Code Generator - Free Custom QR Codes",
  description: "Create stunning, customizable QR codes for free. Add your logo, choose your colors, and download instantly. No signup required.",
  keywords: "QR code, QR generator, custom QR code, QR code with logo, free QR code",
  openGraph: {
    title: "Beautiful QR Code Generator",
    description: "Create stunning QR codes with custom colors and logos.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beautiful QR Code Generator",
    description: "Create stunning QR codes with custom colors and logos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
