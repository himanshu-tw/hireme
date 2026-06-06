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
import { useDeveloper, type DeveloperProfile } from "@/hooks/useDeveloper"
import { logout } from "@/lib/auth"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function DeveloperProfilePage() {
  const router = useRouter()
  const { getProfile, createProfile, isLoading, error } = useDeveloper()

  const [profile, setProfile] = useState<DeveloperProfile | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/sign-in")
      return
    }

    async function loadProfile() {
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

  const handleLogout = () => {
    logout()
    router.replace("/sign-in")
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsCreating(true)

    try {
      const created = await createProfile({
        name,
        bio,
        skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        resumeUrl,
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
            <Link href="/dashboard/developer" aria-label="Back to dashboard">
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
              <CardDescription>Developer profile</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Bio</p>
              <p className="text-sm">{profile.bio}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Resume</p>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                View resume
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create your profile</CardTitle>
            <CardDescription>
              Tell companies about yourself so you can start applying to jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Developer"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short intro about you"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  required
                />
                <p className="text-xs text-muted-foreground">Comma-separated</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://example.com/resume.pdf"
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
