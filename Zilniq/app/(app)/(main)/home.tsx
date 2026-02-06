import { ChatInput } from '@/components/chat/ChatInput';
import { LoadingDots } from '@/components/chat/LoadingDots';
import MessageBubble from '@/components/chat/MessageBubble';
import { SafeAreaScreen } from '@/components/SafeAreaScreen';
import { MealLog } from '@/components/stats/MealLog';
import type { Message, MessageBlock } from '@/types/message';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
export default function Home() {
  
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<FlatList>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { getToken } = useAuth(); 
  const screenHeight = Dimensions.get('window').height;
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [keepWhiteSpace, setKeepWhiteSpace] = useState(false);
  const [userMessageHeight, setUserMessageHeight] = useState(0);
  const [flatListHeight, setFlatListHeight] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  function MessageRenderer({
    block,
    sender,
    timestamp,
  }: {
    block: MessageBlock;
    sender: 'user' | 'assistant';
    timestamp?: string;
  }) {
    switch (block.type) {
      case 'text':
        return (
          <MessageBubble
            message={{
              id: block.id,
              sender,
              timestamp,
              blocks: [block],
            }}
          />
        );

      case 'mealEntry':
        return <MealLog data={block} />;

      default:
        return null;
    }
  }

  const normalizeMessage = (rawMessage: any): Message => {
    const blocks = rawMessage.blocks.map((block: any, index: number) => {
      if (block.type === 'text') {
        return {
          id: `${rawMessage.id}-text-${index}`,
          type: 'text',
          content: block.data?.text || block.text,
        };
      }

      if (block.type === 'mealEntry') {
        return {
          id: `${rawMessage.id}-meal-${index}`,
          type: 'mealEntry',
          content: block,
        };
      }

      return null;
    }).filter(Boolean);

    return {
      id: rawMessage.id,
      sender: rawMessage.role === 'user' ? 'user' : 'assistant',
      timestamp: rawMessage.timestamp,
      blocks,
    };
  };

  const normalizeAssistantMessage = (data: any): Message => {
    const rawBlocks = data.messages[0].blocks
    const blocks = rawBlocks.map((block: any, index: number) => {
      if (block.type === 'text') {
        return {
          id: `text-${index}`,
          type: 'text',
          content: block.data.text,
        };
      }

      if (block.type === 'mealEntry') {
        return {
          id: `meal-${index}`,
          type: 'mealEntry',
          content: block,
        };
      }

      return null;
    }).filter(Boolean);

    return {
      id: data.conversation.lastMessageAt,
      sender: 'assistant',
      timestamp: data.conversation.lastMessageAt,
      blocks,
    };
  };

  const fetchMessages = async (currentOffset: number, isInitial: boolean) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const token = await getToken();
      const response = await fetch(
        `https://payload-cms-production-c64b.up.railway.app/api/chat/messages?limit=20&offset=${currentOffset}&sort=desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch messages`);
      }

      const data = await response.json();
      const normalizedMessages = data.messages.map(normalizeMessage);

      if (isInitial) {
        setMessages(normalizedMessages);
      } else {
        setMessages(prev => [...prev, ...normalizedMessages]);
      }

      setOffset(currentOffset + data.messages.length);
      setHasMore(data.hasMore);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const loadMoreMessages = () => {
    if (!isLoadingMore && hasMore) {
      fetchMessages(offset, false);
    }
  };

  const simulateStreaming = async (messageId: number, fullMessage: Message) => {
    const textBlock = fullMessage.blocks.find(b => b.type === 'text');
    
    if (!textBlock) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? fullMessage : msg
      ));
      return;
    }

    const fullText = textBlock.content as string;
    const words = fullText.split(' ');
    const wordsPerChunk = 1;
    const delayMs = 100;

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(0, i + wordsPerChunk).join(' ');
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            blocks: msg.blocks.map(block => 
              block.type === 'text' 
                ? { ...block, content: chunk }
                : block
            ),
          };
        }
        return msg;
      }));

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? fullMessage : msg
    ));
  };

  const sendMessage = async (message: string) => {
    setIsWaitingForResponse(true);
    setKeepWhiteSpace(false);
    
    const newUserMessage = {
      id: Math.random(),
      sender: 'user' as const,
      timestamp: new Date().toISOString(),
      blocks: [
        {
          id: `user-text-${Math.random()}`,
          type: 'text' as const,
          content: message.trim(),
        },
      ],
    };

    setMessages(prev => [newUserMessage, ...prev]);

    const assistantPlaceholderId = Math.random();
    const assistantPlaceholder = {
      id: assistantPlaceholderId,
      sender: 'assistant' as const,
      timestamp: new Date().toISOString(),
      blocks: [
        {
          id: `assistant-text-${assistantPlaceholderId}`,
          type: 'text' as const,
          content: '',
        },
      ],
    };

    setMessages(prev => [assistantPlaceholder, ...prev]);

     setTimeout(() => {
    scrollRef.current?.scrollToIndex({ 
      index: 0,
      animated: true,
      viewPosition: 1
    });
    
    setTimeout(() => {
      setScrollEnabled(false);
    }, 400);
  }, 150);

    

    try {
      const token = await getToken(); 
      const response = await fetch(
        'https://payload-cms-production-c64b.up.railway.app/api/chat/message',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: "user",
            text: message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to send message`);
      }

      const data = await response.json();
      const assistantResponse = normalizeAssistantMessage(data);

      await simulateStreaming(assistantPlaceholderId, assistantResponse);
      
      setIsWaitingForResponse(false);
      setKeepWhiteSpace(true); 

    } catch (error) {
      console.error('Error sending message:', error);
      setIsWaitingForResponse(false);
      setKeepWhiteSpace(false);
    }
  };

  useEffect(() => {
    fetchMessages(0, true);
  }, []);

  return (
    <SafeAreaScreen extraStyles={{flexGrow:1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
        keyboardVerticalOffset={16}
      >
        {messages.length > 0 ? (
          <FlatList
            ref={scrollRef}
            data={messages}
            keyExtractor={(item) => `${item.id}-${item.timestamp}`}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setFlatListHeight(height);
            }}
            renderItem={({ item, index }) => {
  const isStreamingAssistant = isWaitingForResponse && index === 0 && item.sender === 'assistant';
  const shouldKeepSpace = keepWhiteSpace && index === 0 && item.sender === 'assistant';
  const isUserDuringStreaming = isWaitingForResponse && index === 1 && item.sender === 'user';
  
  const isLoading = isStreamingAssistant && (!item.blocks[0]?.content || item.blocks[0].content === '');
  
  return (
    <View
      onLayout={(event) => {
        if (isUserDuringStreaming) {
          const { height } = event.nativeEvent.layout;
          setUserMessageHeight(height);
        }
      }}
      style={
        (isStreamingAssistant || shouldKeepSpace) && flatListHeight > 0 && userMessageHeight > 0
          ? { 
              minHeight: flatListHeight - userMessageHeight - 20,
              justifyContent: 'flex-start',
              backgroundColor: 'white'
            }
          : undefined
      }
    >
      {isLoading ? (
        <LoadingDots />
      ) : (
        item.blocks.map(block => (
          <MessageRenderer
            key={block.id}
            block={block}
            sender={item.sender}
            timestamp={item.timestamp}
          />
        ))
      )}
    </View>
  );
}}
            inverted={true}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingVertical: 12 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                scrollRef.current?.scrollToIndex({ 
                  index: info.index, 
                  animated: true,
                  viewPosition: 1
                });
              }, 100);
            }}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image 
              style={{height:108, width:108, marginBottom: 18}} 
              source={require("./../../../assets/images/logo.png")}
            />
            <Text style={{ fontSize: 22}}>Welcome to Zilniq Chat</Text>
            <Text style={{ fontSize: 16, textAlign:'center', width:'90%', marginTop:8 }}>
              The chat-based tracker that keeps things simple, calm, and judgment-free
            </Text>
          </View>
        )}
        <ChatInput send={sendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}