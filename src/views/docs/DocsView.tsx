import { useState } from "react";
import { Link, Shield, ExternalLink } from "@/components/icons";
import { cn } from "@/lib/cn";

// Re-uses all internal sections from APIDocsPanel by importing them directly.
// This view renders the docs full-page without the slide-over shell.
import { APIDocsFullPage } from "@/views/settings/APIDocsPanel";

export function DocsView() {
  return <APIDocsFullPage />;
}
