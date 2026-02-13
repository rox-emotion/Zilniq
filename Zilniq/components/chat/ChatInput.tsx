import Send from '@/assets/icons/Send';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

let draft = '';

interface ChatInputProps {
  send: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ send, disabled }: ChatInputProps) {
  const [text, setText] = useState(draft);
  const canSend = text.trim().length > 0 && !disabled;
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (value: string) => {
    draft = value;
    setText(value);
  };

  const sendMessage = () => {
    if (!canSend) return;
    send(text);
    handleChangeText('');
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={text}
        onChangeText={handleChangeText}
        style={styles.input}
        multiline
        placeholder="Type here..."
        placeholderTextColor={colors.placeholder}
        textAlignVertical="center"
      />
      <Pressable onPress={sendMessage} disabled={!canSend} hitSlop={20}>
        <LinearGradient
          colors={canSend ? colors.gradient.buttonActive : colors.gradient.buttonDisabled}
          style={[styles.sendButton, { opacity: canSend ? 1 : 0.4 }]}
        >
          <Send />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderRadius: 30,
    fontWeight:"400",
    borderWidth: 1,
    paddingLeft: 15,
    paddingRight: 54,
    paddingTop: 9,
    // paddingBottom:8,
    borderColor: colors.border,
    backgroundColor: colors.white,
    maxHeight: 150,
    minHeight: 50,
    fontSize: 17,
    lineHeight: 24
  },
  sendButton: {
    position: 'absolute',
    right: 6,
    bottom: 5,
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
