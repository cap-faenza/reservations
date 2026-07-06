import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth";
import { SITE_NAME } from "@/lib/config";
import { logoutAction } from "@/app/actions/admin";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdmin())) redirect("/admin");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin/serate" className="flex items-center gap-2">
            <span className="font-semibold tracking-tight">{SITE_NAME}</span>
            <Badge variant="secondary">Admin</Badge>
          </Link>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" target="_blank">
                <ExternalLink />
                <span className="hidden sm:inline">Vedi il sito</span>
              </Link>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
