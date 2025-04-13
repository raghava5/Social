# Social Network Platform

A modern social networking platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User authentication (email/password and social login)
- Profile management
- News feed with posts and media sharing
- Social interactions (likes, comments, shares)
- Private messaging
- Groups and communities
- Real-time notifications

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time Features**: Socket.io
- **Media Storage**: AWS S3
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- AWS S3 bucket (for media storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/social-network.git
   cd social-network
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
social-network/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profiles
│   └── ...               # Other pages
├── components/            # Reusable components
├── lib/                   # Utility functions
├── prisma/                # Database schema
├── public/                # Static assets
└── styles/                # Global styles
```

## Development

### Database Migrations

To create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

### Code Style

The project uses ESLint and Prettier for code formatting. Run the following commands to check and fix code style:

```bash
npm run lint
```

### Testing

Run tests:
```bash
npm test
```

## Deployment

The application can be deployed to Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Prisma for the excellent ORM
- All contributors and maintainers
