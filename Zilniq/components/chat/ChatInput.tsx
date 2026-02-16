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
  const [inputHeight, setInputHeight] = useState(50);
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
    setInputHeight(50);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View>
      <View style={[styles.container, { minHeight: inputHeight }]}>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={handleChangeText}
          style={[styles.textInput, inputHeight > 50 && { lineHeight: 20, marginTop: -1 }]}
          multiline
          placeholder="Type here..."
          placeholderTextColor={colors.placeholder}
          onContentSizeChange={(e) => {
            const h = e.nativeEvent.contentSize.height + 20;
            setInputHeight(Math.min(150, Math.max(50, h)));
          }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DFDFDF',
    justifyContent: 'space-between',
    alignItems:"flex-end",
    paddingRight: 6,
    flexDirection: 'row',
    paddingLeft: 15,
    minHeight: 50,
    maxHeight: 150,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    lineHeight: 18,
    paddingRight:8,
    alignSelf:"center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical:5,
    alignSelf:"flex-end"
  },
});
