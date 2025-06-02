'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('User is authenticated, redirecting to home');
      router.push('/');
    }
  }, [status, router]);

  const handleSignIn = async () => {
    try {
      console.log('Starting Google sign in...');
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: true
      });
      console.log('Sign in result:', result);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to BFfortless
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Effortlessly manage birthday reminders
          </p>
        </div>
        <div>
          <button
            onClick={handleSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
} 