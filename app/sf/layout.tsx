import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Torque CRM",
  description: "Torque Auto Advisor - CRM Admin Panel",
};

export default function CrmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <link rel="stylesheet" href="/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/css/style.default.css" />
      <link rel="stylesheet" href="/css/font-awesome.min.css" />
      <link rel="stylesheet" href="/css/roboto.css" />
      <link rel="stylesheet" href="/css/lato.css" />
      <link rel="stylesheet" href="/css/animate.min.css" />
      {children}
    </>
  );
}
