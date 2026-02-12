import { ChatInput } from '@/components/chat/ChatInput';
import { LoadingDots } from '@/components/chat/LoadingDots';
import { MealHistoryLog } from '@/components/chat/MealHistoryLog';
import MessageBubble from '@/components/chat/MessageBubble';
import { SafeAreaScreen } from '@/components/SafeAreaScreen';
import { MealLog } from '@/components/stats/MealLog';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useMessages } from '@/hooks/useMessages';
import type { MealEntryBlock, MealHistoryBlock, MessageBlock } from '@/types/message';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

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
      return <MealLog data={block as MealEntryBlock} />;
    case 'mealHistory':
      return <MealHistoryLog data={block as MealHistoryBlock} />;
    default:
      return null;
  }
}

export default function Home() {
  const {
    messages,
    streamingMessage,
    isStreaming,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    sendMessage,
    isSending,
  } = useMessages();

  const scrollRef = useRef<FlatList>(null);
  const [keepWhiteSpace, setKeepWhiteSpace] = useState(false);
  const [userMessageHeight, setUserMessageHeight] = useState(0);
  const [flatListHeight, setFlatListHeight] = useState(0);
  const whiteSpaceAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);

  const isWaitingForResponse = isStreaming || isSending;

  useEffect(() => {
    if (isWaitingForResponse && flatListHeight > 0 && userMessageHeight > 0 && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      const targetHeight = flatListHeight - userMessageHeight - 20;
      Animated.timing(whiteSpaceAnim, {
        toValue: targetHeight,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [isWaitingForResponse, flatListHeight, userMessageHeight]);

  const displayMessages = streamingMessage ? [streamingMessage, ...messages] : messages;

  const handleSend = (message: string) => {
    Keyboard.dismiss();
    setKeepWhiteSpace(false);
    whiteSpaceAnim.setValue(0);
    hasAnimatedRef.current = false;
    sendMessage(message, {
      onSuccess: () => setKeepWhiteSpace(true),
      onError: () => setKeepWhiteSpace(false),
    });

    setTimeout(() => {
      scrollRef.current?.scrollToIndex({ index: 0, animated: true, viewPosition: 1 });
    }, 150);
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <SafeAreaScreen extraStyles={styles.screen}>
      <LinearGradient
        colors={[colors.white, colors.fadeGradient]}
        style={styles.fadeOverlay}
      />
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 124}
      >
        {displayMessages.length > 0 ? (
          <FlatList
            ref={scrollRef}
            data={displayMessages}
            keyExtractor={(item) => `${item.id}-${item.timestamp}`}
            onLayout={(e) => setFlatListHeight(e.nativeEvent.layout.height)}
            renderItem={({ item, index }) => {
              const isStreamingAssistant = isWaitingForResponse && index === 0 && item.sender === 'assistant';
              const shouldKeepSpace = keepWhiteSpace && index === 0 && item.sender === 'assistant';
              const isUserDuringStreaming = isWaitingForResponse && index === 1 && item.sender === 'user';
              const isLoadingDots =
                isStreamingAssistant && (!item.blocks[0]?.content || item.blocks[0].content === '');

              return (
                <Animated.View
                  onLayout={(e) => {
                    if (isUserDuringStreaming) setUserMessageHeight(e.nativeEvent.layout.height);
                  }}
                  style={
                    (isStreamingAssistant || shouldKeepSpace) && flatListHeight > 0 && userMessageHeight > 0
                      ? { minHeight: whiteSpaceAnim, justifyContent: 'flex-start', backgroundColor: colors.white }
                      : undefined
                  }
                >
                  {isLoadingDots ? (
                    <LoadingDots />
                  ) : (
                    item.blocks.map((block: MessageBlock) => (
                      <MessageRenderer key={block.id} block={block} sender={item.sender} timestamp={item.timestamp} />
                    ))
                  )}
                </Animated.View>
              );
            }}
            inverted
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                scrollRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 1 });
              }, 100);
            }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Image style={styles.logo} source={require('./../../../assets/images/logo.png')} />
            <Text style={styles.welcomeTitle}>Welcome to Zilniq Chat</Text>
            <Text style={styles.welcomeSubtitle}>
              The chat-based tracker that keeps things simple, calm, and judgment-free
            </Text>
          </View>
        )}
        <ChatInput send={handleSend} disabled={isWaitingForResponse} />
      </KeyboardAvoidingView>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingTop: 6,
  },
  fadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
    zIndex: 1,
    pointerEvents: 'none',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 108,
    width: 108,
    marginBottom: 18,
  },
  welcomeTitle: {
    fontSize: 22,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    width: '90%',
    marginTop: spacing.sm,
  },
});
