import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Torque Auto Advisor",
  description: "Vehicle Insurance Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/style.default.css" />
        <link rel="stylesheet" href="/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/css/roboto.css" />
        <link rel="stylesheet" href="/css/lato.css" />
        <link rel="stylesheet" href="/css/animate.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
