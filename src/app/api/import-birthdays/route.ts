import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const account = await prisma.account.findFirst({
      where: { userId: user.id, provider: 'google' },
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'No Google account connected' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: account.access_token });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get all calendars
    const calendars = await calendar.calendarList.list();
    
    let birthdayEvents = [];
    
    // Look through each calendar for birthday events
    for (const cal of calendars.data.items || []) {
      if (cal.id) {
        const events = await calendar.events.list({
          calendarId: cal.id,
          timeMin: new Date().toISOString(),
          maxResults: 2500,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const birthdays = events.data.items?.filter(event => 
          event.summary?.toLowerCase().includes('birthday') &&
          event.start?.date // Only include all-day events
        ) || [];

        birthdayEvents.push(...birthdays);
      }
    }

    // Process and store birthday events
    const friends = await Promise.all(
      birthdayEvents.map(async (event) => {
        const name = event.summary?.replace(/\'s birthday/i, '').trim();
        const birthday = new Date(event.start?.date || '');

        if (name && birthday) {
          return prisma.friend.create({
            data: {
              name,
              birthday,
              userId: user.id,
            },
          });
        }
      })
    );

    const validFriends = friends.filter(Boolean);

    return NextResponse.json({ 
      success: true, 
      count: validFriends.length 
    });

  } catch (error) {
    console.error('Error importing birthdays:', error);
    return NextResponse.json(
      { error: 'Failed to import birthdays' },
      { status: 500 }
    );
  }
} 