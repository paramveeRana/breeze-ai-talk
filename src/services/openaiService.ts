
import { supabase } from '../integrations/supabase/client';

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenAIService {
  async sendMessage(messages: OpenAIMessage[]): Promise<string> {
    try {
      console.log('Calling Supabase edge function with messages:', messages);
      
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { messages }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get response from AI service');
      }

      if (!data || !data.content) {
        console.error('Invalid response from edge function:', data);
        throw new Error('Invalid response from AI service');
      }

      return data.content;
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      
      if (error.message?.includes('OpenAI API key not configured')) {
        throw new Error('OpenAI API key is not configured. Please add your API key to Supabase Edge Function secrets.');
      }
      
      throw error;
    }
  }
}
