import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";

import "./globals.css";
import { Room } from "./Room";

export const metadata = {
  title: "Figma Clone",
  description:
    "A minimalist Figma clone using fabric.js and Liveblocks for realtime collaboration",
};

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${workSans.className} bg-primary-grey-100`}>
        <Room>{children}</Room>
      </body>
    </html>
  );
}
