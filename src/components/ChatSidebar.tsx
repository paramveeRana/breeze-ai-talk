
import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Chat } from '../services/chatService';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
}) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
              activeChat === chat.id
                ? 'bg-blue-100 border border-blue-200'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onChatSelect(chat.id)}
          >
            <MessageSquare size={16} className="text-gray-500 flex-shrink-0" />
            <span className="flex-1 text-sm truncate">{chat.title}</span>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
            >
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <User size={16} />
              About
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                About the Developer
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Hello! I'm <span className="font-medium text-gray-800">Vidushi Gupta</span>, a final year BTech student at Medicaps University. 
                I'm passionate about creating intuitive and helpful applications that can make a positive impact on people's lives.
              </p>
              <p>
                My technical expertise lies in Flutter development, where I've built several cross-platform mobile applications. 
                I'm also familiar with web development technologies and enjoy exploring new frameworks and tools to expand my skill set.
              </p>
              <p>
                When I'm not coding, I enjoy reading about new technologies, participating in hackathons, and collaborating on 
                open-source projects. I believe in creating software that is accessible and beneficial for all users.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
