'use client';

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function SignInContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    // Stringify objects for better logging
    console.log('[SignIn] Initial render:', JSON.stringify({
      status,
      error,
      callbackUrl
    }, null, 2));

    if (status === 'authenticated') {
      console.log('[SignIn] User is authenticated, redirecting to:', callbackUrl);
      router.push(callbackUrl);
    }

    if (error) {
      console.error('[SignIn] Auth error:', JSON.stringify({
        error,
        callbackUrl,
        status
      }, null, 2));
    }
  }, [status, router, error, callbackUrl]);

  const handleSignIn = async () => {
    try {
      console.log('[SignIn] Starting Google sign in with callbackUrl:', callbackUrl);
      const result = await signIn('google', { 
        callbackUrl: callbackUrl,
        redirect: false // Change to false to handle redirect manually
      });
      console.log('[SignIn] Sign in result:', JSON.stringify(result, null, 2));
      
      if (result?.error) {
        console.error('[SignIn] Sign in failed:', result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('[SignIn] Sign in error:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Checking authentication status...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Redirecting to {callbackUrl}...</div>
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
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error === 'Callback' ? 
                'There was an issue with the authentication callback. Please try again.' :
                `Authentication error: ${error}`
              }
            </div>
          )}
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

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
} 