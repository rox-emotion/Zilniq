import BackArrowIcon from '@/assets/icons/BackArrowIcon';
import { SafeAreaScreen } from '@/components/SafeAreaScreen';
import { SignOutButton } from '@/components/SignOutButton';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function Profile() {
    return (
        <SafeAreaScreen>
            <Pressable onPress={() => router.back()}>
                <BackArrowIcon />
            </Pressable>
            <View style={{flex:1, justifyContent: "center", alignItems: "center"}}>
                <SignOutButton />
            </View>
        </SafeAreaScreen>
    )
}