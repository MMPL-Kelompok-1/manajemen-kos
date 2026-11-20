"use client";

import RouteError from "@/components/ui/RouteError";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  return <RouteError error={error} retry={retry} />;
}
