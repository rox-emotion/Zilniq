import type { MealEntryBlockData, MealHistoryBlockData } from './meal';

export type MessageSender = 'user' | 'assistant';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
}

export interface MealEntryBlock {
  id: string;
  type: 'mealEntry';
  content: MealEntryBlockData;
}

export interface MealHistoryBlock {
  id: string;
  type: 'mealHistory';
  content: MealHistoryBlockData;
}

export type MessageBlock = TextBlock | MealEntryBlock | MealHistoryBlock;

export interface Message {
  id: string | number;
  timestamp?: string;
  sender: MessageSender;
  blocks: MessageBlock[];
}
