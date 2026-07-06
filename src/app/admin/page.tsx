import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/auth";
import { SITE_NAME } from "@/lib/config";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Area riservata",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/serate");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <Lock className="size-5" />
          </div>
          <CardTitle className="text-xl">Area riservata</CardTitle>
          <CardDescription>
            Inserisci il PIN per gestire le serate di {SITE_NAME}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Torna al sito
      </Link>
    </div>
  );
}
