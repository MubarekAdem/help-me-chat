"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  text: string;
  timestamp: number;
  type: "sent" | "received";
}

interface AIMessage {
  id: string;
  text: string;
  role: "user" | "assistant";
  timestamp: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("chatMessages");
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const handleSend = (type: "sent" | "received") => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: Date.now(),
      type: type,
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend("sent");
    }
  };

  const handleAIKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAISend();
    }
  };

  const handleAISend = async () => {
    if (aiInput.trim() === "" || isAILoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: aiInput.trim(),
      role: "user",
      timestamp: Date.now(),
    };

    const updatedAiMessages = [...aiMessages, userMessage];
    setAiMessages(updatedAiMessages);
    setAiInput("");
    setIsAILoading(true);

    // Create a placeholder AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiResponse: AIMessage = {
      id: aiMessageId,
      text: "",
      role: "assistant",
      timestamp: Date.now(),
    };
    
    const messagesWithAI = [...updatedAiMessages, aiResponse];
    setAiMessages(messagesWithAI);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          aiMessages: updatedAiMessages,
          userQuestion: userMessage.text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Update the AI message with accumulated text
        setAiMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.id === aiMessageId) {
            lastMessage.text = accumulatedText;
          }
          return newMessages;
        });
      }

      setIsAILoading(false);
    } catch (error) {
      console.error("Error calling AI:", error);
      setAiMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.id === aiMessageId) {
          lastMessage.text = "Sorry, there was an error connecting to the AI.";
        }
        return newMessages;
      });
      setIsAILoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  return (
    <div className="flex h-screen bg-[#141414]">
      {/* Sidebar - Hidden on mobile, visible on md and up */}
      <div className="hidden md:flex w-72 bg-[#282828] border-r border-[#3c3c3c] flex-col">
        <div className="p-6 border-b border-[#3c3c3c]">
          <h1 className="text-2xl font-bold text-white mb-2">💬 Chat Helper</h1>
          <p className="text-sm text-gray-400">Personal Chat with AI Assistant</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">📝 About</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This is a personal chat interface where you can practice conversations, 
              take notes, or simulate dialogues with yourself.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2">✨ Features</h3>
            <ul className="text-xs text-gray-400 space-y-2">
              <li>• Send & receive messages</li>
              <li>• AI helper with full context</li>
              <li>• Auto-save to localStorage</li>
              <li>• Dark modern interface</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2">🎯 How to Use</h3>
            <ul className="text-xs text-gray-400 space-y-2">
              <li><strong className="text-gray-300">Send:</strong> Your message (right)</li>
              <li><strong className="text-gray-300">Receive:</strong> Someone's message (left)</li>
              <li><strong className="text-gray-300">AI Helper:</strong> Ask questions about your chat</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-2">⚡ Tips</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Use the AI Helper to analyze your conversations, get summaries, 
              or ask questions about your chat history.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Menu */}
        <div className="bg-[#28283c] text-white px-4 md:px-8 py-4 shadow-lg border-b border-[#3c3c50] flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold">Help me Chat</h1>
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => setIsAIModalOpen(!isAIModalOpen)}
              className="text-xs md:text-sm bg-[#3c3c50] hover:bg-[#4c4c60] px-3 md:px-4 py-2 rounded font-medium transition-colors"
            >
              🤖 <span className="hidden sm:inline">AI Helper</span><span className="sm:hidden">AI</span>
            </button>
            <button
              onClick={clearChat}
              className="text-xs md:text-sm bg-[#282828] hover:bg-[#3c3c3c] px-3 md:px-4 py-2 rounded transition-colors"
            >
              <span className="hidden sm:inline">Clear Chat</span><span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-4 max-w-5xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm">Start typing to send a message</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "sent" ? "justify-end" : "justify-start"
                }`}
              >
              <div
                className={`rounded-lg shadow-lg p-3 md:p-4 max-w-[85%] md:max-w-2xl ${
                  message.type === "sent"
                    ? "bg-[#3c3c50] text-white"
                    : "bg-[#282828] text-gray-200"
                }`}
              >
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {message.text}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.type === "sent" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#282828] border-t border-[#3c3c3c] px-4 md:px-12 py-5">
          <div className="max-w-4xl mx-auto space-y-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full bg-[#141414] border border-[#3c3c3c] text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3c3c50] resize-none"
              rows={2}
            />
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => handleSend("sent")}
                disabled={inputText.trim() === ""}
                className="flex-1 bg-[#3c3c50] hover:bg-[#4c4c60] text-white px-4 md:px-6 py-3 rounded-lg text-sm md:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
              <button
                onClick={() => handleSend("received")}
                disabled={inputText.trim() === ""}
                className="flex-1 bg-[#28283c] hover:bg-[#3c3c50] text-white px-4 md:px-6 py-3 rounded-lg text-sm md:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Receive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Helper Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-4 md:top-20 md:right-8 md:left-auto md:bottom-auto md:w-96 md:h-128 bg-[#282828] rounded-lg shadow-2xl border border-[#3c3c3c] flex flex-col z-50">
          {/* Modal Header */}
          <div className="bg-[#3c3c50] text-white px-4 py-3 rounded-t-lg flex items-center justify-between border-b border-[#3c3c3c]">
            <h2 className="font-semibold">🤖 AI Helper</h2>
            <button
              onClick={() => setIsAIModalOpen(false)}
              className="text-white hover:text-gray-400 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* AI Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#141414]">
            {aiMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-sm">Ask me anything about your chat!</p>
                <p className="text-xs mt-2">
                  I can see all your messages and help you.
                </p>
              </div>
            ) : (
              aiMessages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[85%] text-sm ${
                      msg.role === "user"
                        ? "bg-[#3c3c50] text-white shadow-lg"
                        : "bg-[#28283c] text-gray-200 shadow-lg"
                    }`}
                  >
                    <p className="whitespace-pre-wrap wrap-break-word">
                      {msg.text}
                      {msg.role === "assistant" && isAILoading && index === aiMessages.length - 1 && (
                        <span className="inline-block w-1 h-4 ml-1 bg-white typing-cursor"></span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={aiMessagesEndRef} />
          </div>

          {/* AI Input Area */}
          <div className="p-3 border-t border-[#3c3c3c] bg-[#282828] rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={handleAIKeyPress}
                placeholder="Ask AI about your chat..."
                disabled={isAILoading}
                className="flex-1 bg-[#141414] border border-[#3c3c3c] text-white placeholder-gray-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c3c50] disabled:opacity-50"
              />
              <button
                onClick={handleAISend}
                disabled={isAILoading || aiInput.trim() === ""}
                className="bg-[#3c3c50] hover:bg-[#4c4c60] text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAILoading ? "Thinking..." : "Ask"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}