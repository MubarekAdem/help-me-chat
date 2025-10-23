import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages, aiMessages, userQuestion } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured. Please add GEMINI_API_KEY to .env.local" }),
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build the chat context from message history
    let contextInfo = "";
    if (messages && messages.length > 0) {
      contextInfo = "\n\nHere is the full chat history:\n";
      messages.forEach((msg: { type: string; text: string; timestamp: number }) => {
        const sender = msg.type === "sent" ? "User (sent)" : "User (received)";
        contextInfo += `${sender}: ${msg.text}\n`;
      });
    } else {
      contextInfo = "\n\nThe chat is currently empty (no messages yet).";
    }

    // Build the AI conversation history
    let conversationHistory = "";
    if (aiMessages && aiMessages.length > 1) {
      // Exclude the last message (current question)
      const previousMessages = aiMessages.slice(0, -1);
      conversationHistory = "\n\nOur previous conversation:\n";
      previousMessages.forEach((msg: { role: string; text: string }) => {
        conversationHistory += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}\n`;
      });
    }

    // Create the prompt with full context
    const prompt = `You are a helpful AI assistant. The user is using a personal chat application where they can send and receive messages (both from themselves - it's for practicing conversations or taking notes).

${contextInfo}
${conversationHistory}

The user is now asking you: "${userQuestion}"

Please help them with their question. You can reference the chat history if relevant to their question. Be helpful, concise, and friendly.`;

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
          });

          for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get AI response" }),
      { status: 500 }
    );
  }
}
