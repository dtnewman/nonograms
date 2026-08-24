import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const sessionCookie = "nonograms_admin"

function signature(): string {
  const secret = process.env.SESSION_SECRET ?? ""
  const password = process.env.ADMIN_PASSWORD ?? ""
  return createHmac("sha256", secret).update(`nonograms-admin:${password}`).digest("hex")
}

export function validPassword(value: string): boolean {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? "")
  const actual = Buffer.from(value)
  return expected.length > 0 && expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function isAdmin(): Promise<boolean> {
  const supplied = (await cookies()).get(sessionCookie)?.value ?? ""
  const expected = signature()
  return supplied.length === expected.length && supplied.length > 0 && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
}

export function adminSessionValue(): string {
  if (!process.env.SESSION_SECRET || !process.env.ADMIN_PASSWORD) throw new Error("Admin credentials are not configured")
  return signature()
}
