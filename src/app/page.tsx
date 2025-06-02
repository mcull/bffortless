'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import FriendsList from '@/components/FriendsList';
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const importBirthdays = async () => {
    try {
      const response = await fetch('/api/import-birthdays', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to import birthdays');
      }

      const data = await response.json();
      toast.success(`Successfully imported ${data.count} birthdays!`);
      // Refresh the page to show new birthdays
      router.refresh();
    } catch (error) {
      toast.error('Failed to import birthdays. Please try again.');
      console.error('Error importing birthdays:', error);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* User Profile Section */}
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          {session?.user?.image && (
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={session.user.image}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">
              {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Welcome to BFfortless
            {session?.user?.name && (
              <span className="block text-2xl mt-2 text-blue-600">
                Hello, {session.user.name.split(' ')[0]}!
              </span>
            )}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Effortlessly manage birthday reminders for your friends with Google Calendar integration
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={importBirthdays}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Import Birthdays from Google Calendar
          </button>
        </div>

        <FriendsList />
      </div>
    </div>
  );
}
