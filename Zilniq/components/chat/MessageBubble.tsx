import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import type { Message } from '@/types/message';
import { normalizeDate } from '@/utils/utils';
import { StyleSheet, Text, View } from 'react-native';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.sender === 'user';

  return (
    <View>
      <View style={[styles.bubble, isMe ? styles.userBubble : styles.assistantBubble]}>
        <Text style={styles.text} selectable>
          {message?.blocks?.[0]?.type === 'text' ? message.blocks[0].content : ''}
        </Text>
      </View>
      {isMe && <Text style={styles.timestamp}>{normalizeDate(message?.timestamp)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderTopEndRadius: 30,
    borderBottomStartRadius: 30,
    borderTopStartRadius: 30,
    maxWidth: '90%',
    marginBottom: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    alignSelf: 'flex-end',
    paddingHorizontal: 25,
    paddingVertical: 18,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.md,
  },
  text: {
    lineHeight: 24,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textTimestamp,
    alignSelf: 'flex-end',
  },
});
