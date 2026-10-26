# Account Center

榛果繽紛樂的帳號中心

網址: [https://account.hazelnut-paradise.com](https://account.hazelnut-paradise.com)

![logo](AccountCenter.png)

This is a [Next.js](https://nextjs.org) project for user account management with [Logto](https://logto.io) authentication.

## Features

- 🔐 **User Authentication**: Login/logout with Logto
- 👤 **Profile Management**: Update user profile information
- 🔒 **Security Settings**: Password management and social account connections
- 🌐 **Social Login**: Connect/disconnect Google and GitHub accounts
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌙 **Dark Mode**: Full dark mode support

## Social Account Connection

This application supports connecting your account with:
- **Google**: Connect your Google account for quick login
- **GitHub**: Connect your GitHub account for quick login

### How it works:
1. Users can connect their social accounts in the Security settings
2. Once connected, they can use these accounts for quick login

## Getting Started

### Prerequisites

Install [Bun 1.4.4](https://github.com/oven-sh/bun/releases/tag/bun-v1.4.4).
This project uses Bun for dependency installation, scripts, tests, and the runtime.

1. A Logto instance (Cloud or self-hosted)
2. A Logto application configured with:
   - Standard web application type
   - Proper redirect URIs
   - Social connectors (if you want social login)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Logto configuration:

```bash
cp .env.example .env.local
```

Required variables:
- `LOGTO_ENDPOINT`: Your Logto endpoint URL
- `LOGTO_APP_ID`: Your Logto application ID
- `LOGTO_APP_SECRET`: Your Logto application secret
- `LOGTO_COOKIE_SECRET`: A random secret for cookies (at least 32 characters)
- `LOGTO_M2M_CLIENT_ID`: Machine-to-machine client ID for management API
- `LOGTO_M2M_CLIENT_SECRET`: Machine-to-machine client secret
- `BASE_URL_DEV`: Base URL for development (e.g., `http://localhost:3000`)
- `BASE_URL_PROD`: Base URL for production (e.g., `https://your

Optional (for social login):
- `LOGTO_GITHUB_CONNECTOR_ID`: GitHub connector ID from Logto admin
- `LOGTO_GOOGLE_CONNECTOR_ID`: Google connector ID from Logto admin

### Installation

```bash
# Install dependencies
bun install --frozen-lockfile

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The project `bunfig.toml` runs package scripts and their child JavaScript
processes with Bun, using Bun Shell for consistent behavior across platforms.
Use these commands for validation and a local production server:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
bun run start
```

Commit dependency changes with `bun.lock` so installs remain reproducible.

### Logto Configuration

1. **Create a Logto Application**:
   - Type: Traditional Web App
   - Add redirect URI: `http://localhost:3000/api/logto/sign-in-callback`
   - Add post sign-out redirect URI: `http://localhost:3000`

2. **Create a Machine-to-Machine Application** (for Management API):
   - Type: Machine-to-Machine
   - Grant access to Logto Management API
   - Add scopes: `all` or specific scopes as needed

3. **Configure Social Connectors** (Optional):
   - Set up Google connector in Logto admin
   - Set up GitHub connector in Logto admin
   - Note the connector IDs for your environment variables

4. **Social Callback Configuration**:
   - Add social callback URI: `http://localhost:3000/dashboard/profile/social/callback`

## Project Structure

```
app/
├── layout.tsx          # Root layout with authentication context
├── page.tsx           # Home page
├── logto.ts           # Logto configuration and API helpers
├── dashboard/         # Protected dashboard pages
│   ├── layout.tsx     # Dashboard layout
│   ├── page.tsx       # Dashboard home
│   ├── profile/       # Profile management
│   └── security/      # Security settings with social connections
└── components/        # Shared components
```

## API Routes

- `/api/logto/sign-in-callback`: Logto sign-in callback
- `/dashboard/security/social/callback`: Social account connection callback

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Logto**: Authentication and user management
- **Bun**: JavaScript runtime and package manager

## Development

This project uses:
- ESLint for code linting
- TypeScript for type checking
- Tailwind CSS for styling
- Next.js App Router for routing

## Deploy with Docker Compose

Both Docker stages use `oven/bun:1.4.4-alpine`. The image is built without `.env` files. Compose reads the `.env` file next to
`docker-compose.yml` and passes its values to the container at startup using
[`env_file`](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/).
The server reads these values from `process.env`. Keep the file on the deployment
host and out of version control.

### Build the image

```bash
docker build -t account-center:latest .
```

If you build on another machine, transfer the image to the deployment host:

```bash
# On the build machine
docker save -o account-center.tar account-center:latest

# On the deployment host, after transferring the archive
docker load -i account-center.tar
```

### Configure and start

Place `docker-compose.yml` and your `.env` in the same deployment directory.
For a new configuration, copy `.env.example` to `.env` and fill in the Logto
values before starting. Keep any existing `.env` rather than overwriting it.

Set `BASE_URL_PROD` to the public HTTPS URL registered in your Logto application.
Compose sets `NODE_ENV=production`, overriding any value in `.env`.
Local development can continue to use `.env.local` as described above.

From the deployment directory, run:

```bash
docker compose up -d
```

The service listens on host port `1742` and container port `3000`.
When changing `.env`, recreate the container to load the new values:

```bash
docker compose up -d --force-recreate app
```

Environment changes do not require rebuilding the image. Replace images built
with the previous Dockerfile with a newly built image to remove bundled `.env`
files. Old image archives may still contain the previous configuration.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Don't forget to set up your environment variables in Vercel and update your Logto application redirect URIs to match your production domain.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Logto Documentation](https://docs.logto.io/)
- [Logto Next.js Integration](https://docs.logto.io/quick-starts/next-js/)

````
