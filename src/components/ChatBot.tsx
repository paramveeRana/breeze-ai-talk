
import React, { useState, useRef, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { OpenAIService } from '../services/openaiService';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
}

export const ChatBot: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openaiService = new OpenAIService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, activeChat]);

  useEffect(() => {
    // Create initial chat on component mount
    if (chats.length === 0) {
      createNewChat();
    }
  }, []);

  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: `Chat ${chats.length + 1}`,
      createdAt: new Date(),
      messages: [],
    };
    
    setChats(prev => [...prev, newChat]);
    setActiveChat(newChat.id);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    if (activeChat === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id);
      } else {
        setActiveChat(null);
      }
    }
  };

  const updateChatTitle = (chatId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
    
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ));
  };

  const sendMessage = async (content: string) => {
    if (!activeChat) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    // Add user message immediately
    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));

    // Update chat title with first message
    const currentChat = chats.find(chat => chat.id === activeChat);
    if (currentChat && currentChat.messages.length === 0) {
      updateChatTitle(activeChat, content);
    }

    setIsLoading(true);

    try {
      const currentMessages = chats.find(chat => chat.id === activeChat)?.messages || [];
      const openaiMessages = [...currentMessages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log('Sending messages to OpenAI service:', openaiMessages);
      const response = await openaiService.sendMessage(openaiMessages);
      console.log('Received response from OpenAI service:', response);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));

      toast.success('Message sent successfully!');

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.message?.includes('OpenAI API key')) {
        errorMessage = 'OpenAI API key is missing. Please configure it in Supabase Edge Function secrets.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'OpenAI API quota exceeded. Please check your API usage.';
      }
      
      toast.error(errorMessage);
      
      // Add error message to chat
      const errorChatMessage: Message = {
        id: crypto.randomUUID(),
        content: `Error: ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, errorChatMessage] }
          : chat
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const currentChat = chats.find(chat => chat.id === activeChat);

  return (
    <div className="flex h-screen bg-white">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={setActiveChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
      />
      
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className="flex-1 overflow-y-auto">
              {currentChat.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <h2 className="text-2xl font-semibold mb-2">Start a new conversation</h2>
                    <p>Type a message below to begin chatting with the AI assistant.</p>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Make sure to add your OpenAI API key to Supabase Edge Function secrets for the chatbot to work.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {currentChat.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <ChatInput
              onSendMessage={sendMessage}
              disabled={!activeChat}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-semibold mb-4">Welcome to AI ChatBot</h2>
              <p className="mb-4">Create a new chat to get started.</p>
              <button
                onClick={createNewChat}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
