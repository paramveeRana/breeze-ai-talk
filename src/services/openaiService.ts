
import { supabase } from '../integrations/supabase/client';

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenAIService {
  async sendMessage(messages: OpenAIMessage[]): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { messages }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get response from AI');
      }

      return data.content;
    } catch (error) {
      console.error('AI API Error:', error);
      throw error;
    }
  }
}
