"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCompany, type CompanyProfile } from "@/hooks/useCompany"
import { getSession, logout } from "@/lib/auth"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function CompanyProfilePage() {
  const router = useRouter()
  const { getProfile, createProfile, isLoading, error } = useCompany()

  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    async function loadProfile() {
      try {
        await getSession()
      } catch {
        router.replace("/sign-in")
        return
      }
      setIsFetching(true)
      try {
        const data = await getProfile()
        setProfile(data)
      } catch (err) {
        if (!(axios.isAxiosError(err) && err.response?.status === 404)) {
          setFormError("Failed to load profile.")
        }
      } finally {
        setIsFetching(false)
      }
    }

    loadProfile()
  }, [getProfile, router])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.replace("/sign-in")
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsCreating(true)

    try {
      const created = await createProfile({
        name,
        description,
        websiteUrl,
        location,
      })
      setProfile(created)
    } catch {
      setFormError("Could not create profile. Please check your details.")
    } finally {
      setIsCreating(false)
    }
  }

  if (isFetching) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 md:p-8">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/company" aria-label="Back to dashboard">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">Profile</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>

      {profile ? (
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-sm">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>Company profile</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{profile.description}</p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Location</p>
              <p className="text-sm">{profile.location}</p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Website</p>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                {profile.website}
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create your profile</CardTitle>
            <CardDescription>
              Tell developers about your company so you can start posting jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Company name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc."
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What your company does"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="websiteUrl">Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://acme.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  required
                />
              </div>

              {(formError || error) && (
                <p className="text-xs text-destructive">{formError ?? error}</p>
              )}

              <Button type="submit" disabled={isCreating || isLoading}>
                {isCreating ? "Creating..." : "Save profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
