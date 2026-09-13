"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/page-shell";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell
      badge="Account"
      title="Reset your password"
      subtitle="Enter the email associated with your account and we'll send you reset instructions."
    >
      <div className="max-w-md">
        <Card className="bg-zinc-900/80 border-white/10">
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-green-400 text-sm">
                  If an account exists for that email, reset instructions are on
                  their way.
                </p>
                <Link
                  to="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="bg-zinc-800 border-white/10 text-white placeholder-white/40"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Send reset link
                </Button>
                <Link
                  to="/login"
                  className="block text-center text-sm text-primary hover:underline"
                >
                  Back to sign in
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}