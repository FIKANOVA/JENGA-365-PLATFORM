import { auth } from "@/lib/auth/config"
import { headers } from "next/headers"
import PowerHourForm from "./PowerHourForm"

export default async function PowerHourPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) return null

  return <PowerHourForm mentorId={session.user.id} />
}
