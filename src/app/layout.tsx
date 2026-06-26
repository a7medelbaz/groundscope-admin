import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GroundScope - Admin Dashboard",
  description: "Airport Ground Services Coordination - Admin Web Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
