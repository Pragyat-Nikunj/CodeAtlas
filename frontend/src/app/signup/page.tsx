'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function SignupPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // OTP Login
  const handleEmailLogin = async () => {
    if (!email.trim()) {
      setIsError(true);
      setMessage('Please enter your email address.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          full_name: fullName.trim() || null,
        },
      },
    });

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setMessage('Check your email for a login link 🚀');
    }

    setLoading(false);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl">
            Create your account
          </CardTitle>
          <CardDescription className="text-slate-400">
            Continue with email or Google
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-slate-300">Full Name</Label>
            <Input
              type="text"
              required
              placeholder="Jane Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600"
            />
          </div>

          <Button
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500"
          >
            <Mail className="mr-2 h-4 w-4" />
            {loading ? 'Sending link…' : 'Continue with Email'}
          </Button>

          {message && (
            <p
              className={`text-sm text-center ${isError ? 'text-red-400' : 'text-slate-400'}`}
            >
              {message}
            </p>
          )}

          <div className="relative">
            <Separator className="bg-slate-800" />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
              OR
            </span>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border-slate-800 text-black cursor-pointer hover:bg-slate-300"
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
