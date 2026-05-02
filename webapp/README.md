# ELD Mock Webapp

This is a proof-of-concept for the Singapore Elections Department (ELD) featuring a floating AI chat assistant for voter information.

## Deployment Instructions

1. Run `npm install` to install dependencies.
2. Copy `.env.example` to `.env.local` and fill in your `ANTHROPIC_API_KEY`.
3. Run `npm run dev` to start the local development server.
4. To deploy, use `npx vercel --prod` and be sure to add the `ANTHROPIC_API_KEY` in the Vercel dashboard environment variables.
