export type MessageSender = 'user' | 'assistant';

export type MessageBlock =
    {
      id: string;
      type: 'text' | 'mealEntry';
      content: string | any;
    }

export type Message = {
  id: string | number;
  timestamp? : string;
  sender: MessageSender;
  blocks: MessageBlock[];
};
