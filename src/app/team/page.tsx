"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui";

/** The team now lives on the About page. Redirect any old links there. */
export default function TeamRedirect() {
  useEffect(() => {
    window.location.replace("/about/#team");
  }, []);
  return (
    <Container className="flex min-h-[50vh] items-center justify-center py-20 text-sm text-muted">
      Taking you to the team…
    </Container>
  );
}
