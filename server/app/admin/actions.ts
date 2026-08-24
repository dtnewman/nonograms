"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminSessionValue, isAdmin, sessionCookie, validPassword } from "@/lib/auth"
import { reviewPuzzle } from "@/lib/db"

export async function login(formData: FormData) {
  if (!validPassword(String(formData.get("password") ?? ""))) {
    redirect("/admin/login?error=1")
  }
  (await cookies()).set(sessionCookie, adminSessionValue(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 })
  redirect("/admin")
}

export async function logout() {
  (await cookies()).delete(sessionCookie)
  redirect("/")
}

export async function moderate(formData: FormData) {
  if (!await isAdmin()) redirect("/admin/login")
  const code = String(formData.get("code") ?? "")
  const decision = String(formData.get("decision") ?? "")
  if (/^[a-z0-9]{8}$/i.test(code) && (decision === "approved" || decision === "rejected")) reviewPuzzle(code, decision)
  redirect("/admin")
}
