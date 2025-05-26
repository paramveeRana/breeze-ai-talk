
import { supabase } from '../integrations/supabase/client';

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export class ChatService {
  async createChat(title: string): Promise<Chat> {
    const { data, error } = await supabase
      .from('chats')
      .insert({ title })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChats(): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async deleteChat(chatId: string): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) throw error;
  }

  async updateChatTitle(chatId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('chats')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', chatId);

    if (error) throw error;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(msg => ({
      ...msg,
      role: msg.role as 'user' | 'assistant'
    }));
  }

  async addMessage(chatId: string, content: string, role: 'user' | 'assistant'): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, content, role })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      role: data.role as 'user' | 'assistant'
    };
  }
}
