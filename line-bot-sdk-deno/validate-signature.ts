import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

function safeCompare(a: string, b: string): boolean {
  return a === b;
}

export default function validateSignature(
  body: string,
  channelSecret: string,
  signature: string,
): boolean {
  return safeCompare(
    hmac("sha256", channelSecret, body, "utf8", "base64") as string,
    signature,
  );
}
