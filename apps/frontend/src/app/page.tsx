// app/page.tsx
"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    getSession()
      .then((session) => {
        if (session.role === "COMPANY") router.replace("/dashboard/company")
        else router.replace("/dashboard/developer")
      })
      .catch(() => {}) // not logged in, stay on landing
  }, [])

  return (
    <div className="flex flex-1 items-center justify-center gap-4">
      <Button asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/register">Register</Link>
      </Button>
    </div>
  )
}