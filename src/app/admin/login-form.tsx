"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AdminFormState } from "@/app/actions/admin";

const initialState: AdminFormState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pin">PIN</Label>
        <Input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="••••"
          className="text-center text-lg tracking-[0.5em]"
          autoFocus
          required
        />
      </div>
      {state.message && (
        <p className="text-sm font-medium text-destructive">{state.message}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Verifica…" : "Entra"}
      </Button>
    </form>
  );
}
