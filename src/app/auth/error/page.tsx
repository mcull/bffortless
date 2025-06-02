'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    console.log('[Auth Error Page] Error:', JSON.stringify({ error }, null, 2));
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error === 'Callback' ? (
              <div>
                <p className="font-medium">There was an issue with the authentication callback.</p>
                <p className="mt-2">This might be due to:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Invalid OAuth configuration</li>
                  <li>Session configuration issues</li>
                  <li>Database connection problems</li>
                </ul>
              </div>
            ) : (
              <p>Authentication error: {error || 'Unknown error'}</p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Try signing in again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 