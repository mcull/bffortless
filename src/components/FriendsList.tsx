'use client';

import { useEffect, useState } from 'react';
import { format, differenceInDays } from 'date-fns';

type Friend = {
  id: string;
  name: string;
  birthday: string;
};

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends');
        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const getUpcomingBirthday = (birthday: string) => {
    const today = new Date();
    const birthdayDate = new Date(birthday);
    const nextBirthday = new Date(
      today.getFullYear(),
      birthdayDate.getMonth(),
      birthdayDate.getDate()
    );

    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return nextBirthday;
  };

  const sortedFriends = [...friends].sort((a, b) => {
    const dateA = getUpcomingBirthday(a.birthday);
    const dateB = getUpcomingBirthday(b.birthday);
    return dateA.getTime() - dateB.getTime();
  });

  if (loading) {
    return <div>Loading friends...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Upcoming Birthdays</h2>
      <div className="grid gap-4">
        {sortedFriends.map((friend) => {
          const nextBirthday = getUpcomingBirthday(friend.birthday);
          const daysUntil = differenceInDays(nextBirthday, new Date());
          
          return (
            <div
              key={friend.id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{friend.name}</h3>
                  <p className="text-gray-600">
                    Birthday: {format(new Date(friend.birthday), 'MMMM d')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {daysUntil === 0
                      ? "Today!"
                      : daysUntil === 1
                      ? "Tomorrow!"
                      : `${daysUntil} days away`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 