import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { mailConfigured } from "@/lib/mailer";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <AdminShell status={{ storage: process.env.MONGODB_URI ? "MongoDB" : "Local file (dev)", storageOk: Boolean(process.env.MONGODB_URI), email: mailConfigured() }}>
      {children}
    </AdminShell>
  );
}
