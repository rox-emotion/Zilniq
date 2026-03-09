import { useClerk } from '@clerk/clerk-expo';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export function SignOutButton() {
  const { signOut } = useClerk();
  const colors = useColors();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text style={{ color: colors.text }}>Sign out</Text>
    </TouchableOpacity>
  );
}
