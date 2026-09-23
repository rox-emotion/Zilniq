import { apiFetch } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { MealEntryBlock, MealHistoryBlock, Message, MessageBlock } from '@/types/message';
import { logEvent } from '@/utils/analytics';
import { syncMealToHealthKit } from '@/utils/healthkit';
import { useAuth } from '@clerk/clerk-expo';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';

const PAGE_SIZE = 20;

interface RawBlock {
  type: string;
  data?: { text?: string };
  text?: string;
  [key: string]: unknown;
}

interface RawMessage {
  id: string | number;
  role: string;
  timestamp?: string;
  blocks: RawBlock[];
  notificationBody?: string;
}

interface MessagesResponse {
  messages: RawMessage[];
  hasMore: boolean;
}

interface SendMessageResponse {
  messages: Array<{
    blocks: RawBlock[];
    extractedData?: { intent?: string };
  }>;
  conversation: { lastMessageAt: string };
  needsClarification?: boolean;
}

interface InfiniteMessagesData {
  pages: Array<{
    messages: Message[];
    hasMore: boolean;
    nextOffset: number;
  }>;
  pageParams: number[];
}

function normalizeBlock(rawBlock: RawBlock, messageId: string | number, index: number): MessageBlock | null {
  if (rawBlock.type === 'text') {
    return {
      id: `${messageId}-text-${index}`,
      type: 'text',
      content: rawBlock.data?.text || rawBlock.text || '',
    };
  }

  if (rawBlock.type === 'mealEntry') {
    return {
      id: `${messageId}-meal-${index}`,
      type: 'mealEntry',
      content: rawBlock as never,
    };
  }

  if (rawBlock.type === 'mealHistory') {
    return {
      id: `${messageId}-history-${index}`,
      type: 'mealHistory',
      content: rawBlock as never,
    };
  }

  return null;
}

function normalizeMessage(rawMessage: RawMessage): Message {
  const blocks = rawMessage.blocks
    .map((block, index) => normalizeBlock(block, rawMessage.id, index))
    .filter((b): b is MessageBlock => b !== null);

  if (rawMessage.role === 'notification') {
    return {
      id: rawMessage.id,
      sender: 'notification',
      timestamp: rawMessage.timestamp,
      blocks: blocks.map((block) =>
        block.type === 'text' ? { ...block, content: rawMessage.notificationBody ?? block.content } : block,
      ),
    };
  }

  return {
    id: rawMessage.id,
    sender: rawMessage.role === 'user' ? 'user' : 'assistant',
    timestamp: rawMessage.timestamp,
    blocks,
  };
}

function normalizeAssistantMessage(data: SendMessageResponse): Message {
  const rawBlocks = data.messages[0].blocks;
  const blocks = rawBlocks
    .map((block, index) => normalizeBlock(block, 'assistant', index))
    .filter((b): b is MessageBlock => b !== null);

  return {
    id: data.conversation.lastMessageAt,
    sender: 'assistant',
    timestamp: data.conversation.lastMessageAt,
    blocks,
  };
}

export function useMessages() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef(false);

  const messagesQuery = useInfiniteQuery({
    queryKey: queryKeys.messages,
    queryFn: async ({ pageParam = 0 }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const data = await apiFetch<MessagesResponse>(
        `/api/chat/messages?limit=${PAGE_SIZE}&offset=${pageParam}&sort=desc`,
        { token },
      );

      console.log(
        `[useMessages] raw backend response for /api/chat/messages (offset=${pageParam}):\n`,
        JSON.stringify(data, null, 2),
      );

      return {
        messages: data.messages.map(normalizeMessage),
        hasMore: data.hasMore,
        nextOffset: pageParam + data.messages.length,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    initialPageParam: 0,
  });

  const messages: Message[] = messagesQuery.data?.pages.flatMap((page) => page.messages) ?? [];

  const simulateStreaming = useCallback(async (fullMessage: Message) => {
    const textBlock = fullMessage.blocks.find((b) => b.type === 'text');

    if (!textBlock) {
      setStreamingMessage(fullMessage);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const fullText = textBlock.content as string;
    const words = fullText.split(' ');
    const delayMs = 50;
    const textOnly = [textBlock];

    for (let i = 0; i < words.length; i++) {
      if (streamAbortRef.current) break;

      const partialText = words.slice(0, i + 1).join(' ');
      setStreamingMessage({
        ...fullMessage,
        blocks: textOnly.map((block) => ({ ...block, content: partialText })),
      });

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    setStreamingMessage(fullMessage);
  }, []);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await apiFetch<SendMessageResponse>('/api/chat/message', {
        token,
        method: 'POST',
        body: JSON.stringify({ role: 'user', text }),
      });

      console.log(
        '[useMessages] raw backend response for /api/chat/message:\n',
        JSON.stringify(response, null, 2),
      );

      return response;
    },

    onMutate: async (text: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages });

      const optimisticUserMessage: Message = {
        id: Math.random(),
        sender: 'user',
        timestamp: new Date().toISOString(),
        blocks: [{ id: `user-text-${Math.random()}`, type: 'text', content: text.trim() }],
      };

      queryClient.setQueryData<InfiniteMessagesData>(queryKeys.messages, (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        newPages[0] = { ...newPages[0], messages: [optimisticUserMessage, ...newPages[0].messages] };
        return { ...old, pages: newPages };
      });

      setStreamingMessage({
        id: Math.random(),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        blocks: [{ id: 'loading', type: 'text', content: '' }],
      });
      setIsStreaming(true);
      streamAbortRef.current = false;

      return { optimisticUserMessage };
    },

    onSuccess: async (data) => {
      const fullAssistantMsg = normalizeAssistantMessage(data);

      // A meal only counts as "added" when the assistant actually persisted a
      // real entry: the turn's intent is meal_log, it's not a clarification
      // request, and at least one returned entry is non-virtual (virtual entries
      // are previews/hypotheticals that were never saved).
      const intent = data.messages[0]?.extractedData?.intent;
      const mealEntryBlock = fullAssistantMsg.blocks.find(
        (b): b is MealEntryBlock => b.type === 'mealEntry',
      );
      const mealHistoryBlock = fullAssistantMsg.blocks.find(
        (b): b is MealHistoryBlock => b.type === 'mealHistory',
      );

      const mealAdded =
        intent === 'meal_log' &&
        data.needsClarification !== true &&
        (mealEntryBlock?.content.data.origin?.isVirtual === false ||
          (mealHistoryBlock?.content.data.entries?.some((e) => e.origin?.isVirtual === false) ??
            false));

      if (mealAdded) {
        const meal =
          mealEntryBlock?.content.data ??
          mealHistoryBlock?.content.data.entries?.find((e) => e.origin?.isVirtual === false);

        if (meal) {
          logEvent('meal_logged', {
            meal_type: meal.mealType ?? 'unknown',
            item_count: meal.items?.length ?? 0,
            kcal: Math.round(meal.totals?.kcal ?? 0),
          });
          // Awaited (not fire-and-forget) so the returned HealthKit sample IDs
          // land on `meal.healthKitIds` before this same object is inserted
          // into the message cache below — ready for a future delete action.
          await syncMealToHealthKit(meal);
        }
      }

      await simulateStreaming(fullAssistantMsg);

      queryClient.setQueryData<InfiniteMessagesData>(queryKeys.messages, (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        newPages[0] = { ...newPages[0], messages: [fullAssistantMsg, ...newPages[0].messages] };
        return { ...old, pages: newPages };
      });

      setStreamingMessage(null);
      setIsStreaming(false);

      queryClient.invalidateQueries({ queryKey: queryKeys.dailyTotals });
      queryClient.invalidateQueries({ queryKey: queryKeys.meals });
      queryClient.invalidateQueries({ queryKey: queryKeys.weeklyGraph });
    },

    onError: () => {
      setStreamingMessage(null);
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.messages });
    },
  });

  return {
    messages,
    streamingMessage,
    isStreaming,
    isLoading: messagesQuery.isLoading,
    isFetchingNextPage: messagesQuery.isFetchingNextPage,
    hasNextPage: messagesQuery.hasNextPage,
    fetchNextPage: messagesQuery.fetchNextPage,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
  };
}
