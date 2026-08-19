"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui";

/** Contact now lives on the About page. Redirect any old links there. */
export default function ContactRedirect() {
  useEffect(() => {
    window.location.replace("/about/#contact");
  }, []);
  return (
    <Container className="flex min-h-[50vh] items-center justify-center py-20 text-sm text-muted">
      Taking you to contact…
    </Container>
  );
}
