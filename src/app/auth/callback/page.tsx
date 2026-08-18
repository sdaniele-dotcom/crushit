"use client";

import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { getSupabase } from "@/lib/supabase";

/** Landing page for email-confirmation / magic links. Exchanges the code for a
 *  session (PKCE) then forwards to the dashboard. */
export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("Signing you in…");

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      window.location.assign("/");
      return;
    }
    const url = window.location.href;
    const finish = () => window.location.assign("/dashboard");
    if (url.includes("code=")) {
      sb.auth
        .exchangeCodeForSession(url)
        .then(({ error }) => {
          if (error) setMsg(error.message);
          else finish();
        })
        .catch(() => setMsg("Could not complete sign-in. Try logging in."));
    } else {
      // detectSessionInUrl handles hash-based tokens; give it a moment.
      setTimeout(finish, 600);
    }
  }, []);

  return (
    <AuthShell title="One moment…" subtitle={msg}>
      <div className="flex justify-center py-4">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-crush-500 border-t-transparent" />
      </div>
    </AuthShell>
  );
}
