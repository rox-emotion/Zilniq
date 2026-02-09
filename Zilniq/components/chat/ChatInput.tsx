import Send from '@/assets/icons/Send';
import { LinearGradient } from 'expo-linear-gradient';
// import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

export function ChatInput ({send, disabled} : {send: (text: string) => void, disabled?: boolean}) {

    const [text, setText] = useState<string>('');
    const canSend = text.trim().length > 0 && !disabled;
    const inputRef = useRef<TextInput>(null);

    const sendMessage = () => {
        if (!canSend) return;
        send(text)
        setText("")
    }

    useEffect(() => {
    // Small delay helps Android + navigation transitions
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
                onChangeText={setText}
                style={{width:"100%", borderRadius:30, borderWidth: 1, padding:14, paddingRight: 52, borderColor: "#DFDFDF", backgroundColor:"white", maxHeight:150, minHeight:50}}
                multiline={true}
                placeholder='Type here...'
                placeholderTextColor={"#ABACBC"}
                textAlignVertical='center'
            />
            <Pressable onPress={sendMessage} disabled={!canSend}>
                <LinearGradient colors={canSend ? ['#606060', "#060606"] : ['#B0B0B0', "#B0B0B0"]} style={{position:'absolute', right:6, bottom:5, width:39, height:39, borderRadius:39/2, alignItems:'center', justifyContent:'center', opacity: canSend ? 1 : 0.4}}>
                    <Send/>
                </LinearGradient>
            </Pressable>
        </View>
    )
}