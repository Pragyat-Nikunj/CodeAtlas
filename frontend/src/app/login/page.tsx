"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Mail, ArrowRight, Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

type Step = "idle" | "sent"

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<Step>("idle")

  // OTP Login — no full_name here since this is an existing user
  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Must match the same redirect as signup
        emailRedirectTo: `${location.origin}/auth/callback`,
        // shouldCreateUser: false prevents new signups via the login page.
        // Remove this line if you want login to also act as signup.
        shouldCreateUser: false,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setStep("sent")
    }

    setLoading(false)
  }

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true)

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800 backdrop-blur-xl">

        <CardHeader>
          <CardTitle className="text-white text-2xl">
            Welcome back
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {step === "idle" ? (
            <>
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {loading ? "Sending link…" : "Continue with Email"}
              </Button>

              <div className="relative">
                <Separator className="bg-slate-800" />
                <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                  OR
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full border-slate-800 text-black cursor-pointer hover:bg-slate-300"
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                  Sign up
                </a>
              </p>
            </>
          ) : (
            /* Sent state — clean confirmation UI */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="rounded-full bg-indigo-600/20 p-4">
                <Mail className="h-8 w-8 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium">Check your inbox</p>
                <p className="text-slate-400 text-sm">
                  We sent a login link to <span className="text-slate-200">{email}</span>
                </p>
              </div>
              <p className="text-slate-500 text-xs">
                Didn&apos;t get it?{" "}
                <button
                  onClick={() => {
                    setStep("idle")
                    setError("")
                  }}
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  Try again
                </button>
              </p>
              <div className="w-full pt-2">
                <Separator className="bg-slate-800" />
              </div>
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full border-slate-800 text-black cursor-pointer hover:bg-slate-300"
              >
                <FcGoogle className="mr-2 h-4 w-4" />
                Or continue with Google
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}