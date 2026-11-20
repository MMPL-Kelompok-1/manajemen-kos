// Pembantu fetch untuk komponen klien. Melempar Error berisi pesan dari API ({ error }).
export async function requestJson<T = Record<string, unknown>>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof json?.error === "string" ? json.error : "Terjadi kesalahan. Coba lagi.";
    throw new Error(message);
  }
  return json as T;
}

export function postJson<T = Record<string, unknown>>(url: string, body?: unknown) {
  return requestJson<T>(url, "POST", body);
}

export function errorMessage(err: unknown, fallback = "Terjadi kesalahan. Coba lagi.") {
  return err instanceof Error && err.message ? err.message : fallback;
}
