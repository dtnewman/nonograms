import { login } from "../actions"

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return <><h1>Admin login</h1>{error && <div className="notice danger">That password was not accepted.</div>}<form action={login}><label className="field">Password<input name="password" type="password" required autoFocus /></label><button type="submit">Log in</button></form></>
}
