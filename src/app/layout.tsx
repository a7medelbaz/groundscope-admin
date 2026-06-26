import type { Metadata } from "next";
import { Manrope, Tajawal } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800"],
  subsets: ["arabic"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "GroundScope - Admin Dashboard",
  description: "Airport Ground Services Coordination - Admin Web Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${tajawal.variable} antialiased`}
        style={{ fontFamily: "var(--font-manrope), var(--font-tajawal)" }}
      >
        {children}
      </body>
    </html>
  );
}
