"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setError("Invalid link")
      return
    }

    api.get(`/api/auth/verify?token=${token}`)
      .then((res) => {
        if (res.data.role === "COMPANY") router.push("/dashboard/company")
        else router.push("/dashboard/developer")
      })
      .catch(() => setError("Invalid or expired link"))
  }, [])

  if (error) return <p>{error}</p>
  return <p>Verifying...</p>
}