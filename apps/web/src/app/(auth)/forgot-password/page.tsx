'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate sending reset email
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    }, 1500);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
            <span className="text-navy-900 font-heading font-bold text-lg">EQ</span>
          </div>
          <span className="font-heading font-bold text-xl text-navy-500">EstateIQ</span>
        </div>
        <CardTitle className="text-2xl">
          {sent ? 'Check your email' : 'Reset your password'}
        </CardTitle>
        <CardDescription>
          {sent
            ? `We sent a password reset link to ${email}`
            : 'Enter your email address and we\'ll send you a link to reset your password'}
        </CardDescription>
      </CardHeader>

      {sent ? (
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-center space-y-2">
            <p className="text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSent(false)}
              className="text-gold-400 hover:text-gold-500"
            >
              Try another email
            </Button>
          </div>
          <CardFooter className="flex flex-col gap-4 px-0">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Button>
            </Link>
          </CardFooter>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={isLoading || !email}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
