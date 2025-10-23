This is a personal chat application with AI helper integration built with Next.js and Gemini AI.

## Features

- 💬 Personal chat interface (send and receive messages)
- 🤖 AI Helper modal that can answer questions about your chat
- 💾 Messages saved to localStorage
- 🎨 Clean, modern UI

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Gemini AI API Key

Create a file called `.env.local` in the root directory and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

### Main Chat
- Type a message in the input field
- Click **"Send"** to add it as a sent message (appears on the right in blue)
- Click **"Receive"** to add it as a received message (appears on the left in white)
- Messages are automatically saved to your browser's localStorage

### AI Helper
1. Click the **"🤖 AI Helper"** button in the top right corner
2. A modal will open on the top right of the screen
3. Ask the AI questions about your chat (e.g., "Summarize my messages", "What did I say about...")
4. The AI has full access to your chat context and can help you understand or analyze your messages
5. Click the **×** to close the modal

### Clear Chat
- Click **"Clear Chat"** in the top menu to delete all messages

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
