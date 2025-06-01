# BFfortless

BFfortless is a modern web application that helps you never forget a friend's birthday again. By seamlessly integrating with Google Calendar, it automatically imports and manages birthday reminders, making it effortless to be a better friend.

## Features

- 🔐 Secure authentication with Google OAuth
- 📅 Automatic birthday import from Google Calendar
- 👥 Friend management system
- 🎂 Birthday reminders and notifications
- 🎯 Clean, modern UI built with Next.js and Tailwind CSS
- 🚀 High-performance database with PlanetScale

## Tech Stack

- **Frontend**: Next.js 15.3, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PlanetScale (MySQL)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with Google OAuth
- **API Integration**: Google Calendar API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Google Cloud Platform account with Calendar API enabled
- A PlanetScale account

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mcull/bffortless.git
   cd bffortless
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   DATABASE_URL="your-planetscale-connection-string"
   NEXTAUTH_SECRET="your-nextauth-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

BFfortless follows a modern full-stack architecture:

- **App Router**: Utilizes Next.js 13+ App Router for server-side rendering and API routes
- **Server Components**: Leverages React Server Components for optimal performance
- **Edge Ready**: Deployed on Vercel's Edge Network for global availability
- **Type Safety**: Built with TypeScript for robust type checking
- **Database Schema**: Prisma schema with relations for Users, Friends, and OAuth accounts

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- PlanetScale for the scalable database solution
- Vercel for hosting and deployment
- Google Calendar API for birthday data integration

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
