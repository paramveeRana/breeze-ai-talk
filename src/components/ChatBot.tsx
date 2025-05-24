
import React, { useState, useRef, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { OpenAIService } from '../services/openaiService';
import { ChatService, Chat, Message } from '../services/chatService';
import { toast } from 'sonner';

export const ChatBot: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openaiService = new OpenAIService();
  const chatService = new ChatService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const loadChats = async () => {
    try {
      const chatList = await chatService.getChats();
      setChats(chatList);
      
      if (chatList.length > 0 && !activeChat) {
        setActiveChat(chatList[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const messageList = await chatService.getMessages(chatId);
      setMessages(messageList);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const createNewChat = async () => {
    try {
      const newChat = await chatService.createChat(`Chat ${chats.length + 1}`);
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create new chat');
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      if (activeChat === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChat(remainingChats[0].id);
        } else {
          setActiveChat(null);
          setMessages([]);
        }
      }
      
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const updateChatTitle = async (chatId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
    
    try {
      await chatService.updateChatTitle(chatId, title);
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeChat) return;

    try {
      // Add user message to database
      const userMessage = await chatService.addMessage(activeChat, content, 'user');
      setMessages(prev => [...prev, userMessage]);

      // Update chat title with first message
      if (messages.length === 0) {
        updateChatTitle(activeChat, content);
      }

      setIsLoading(true);

      // Prepare messages for OpenAI
      const currentMessages = [...messages, userMessage];
      const openaiMessages = currentMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log('Sending messages to OpenAI service:', openaiMessages);
      const response = await openaiService.sendMessage(openaiMessages);
      console.log('Received response from OpenAI service:', response);

      // Add AI response to database
      const assistantMessage = await chatService.addMessage(activeChat, response, 'assistant');
      setMessages(prev => [...prev, assistantMessage]);

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
      
      // Add error message to database
      try {
        const errorChatMessage = await chatService.addMessage(activeChat, `Error: ${errorMessage}`, 'assistant');
        setMessages(prev => [...prev, errorChatMessage]);
      } catch (dbError) {
        console.error('Error saving error message:', dbError);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        {activeChat ? (
          <>
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <h2 className="text-2xl font-semibold mb-2">Start a new conversation</h2>
                    <p>Type a message below to begin chatting with the AI assistant.</p>
                  </div>
                </div>
              ) : (
                <div>
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={{
                        id: message.id,
                        content: message.content,
                        role: message.role,
                        timestamp: new Date(message.created_at)
                      }} 
                    />
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
