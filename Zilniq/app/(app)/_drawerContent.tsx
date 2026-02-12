import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { signOut } = useClerk();
  const { user } = useUser();

  const fullName = user?.fullName ?? 'User';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const avatar = user?.imageUrl;

  const onPrivacy = async () => {
    const url = 'https://example.com/privacy';
    const can = await Linking.canOpenURL(url);
    if (can) Linking.openURL(url);
  };

  const onLogout = async () => {
    props.navigation.closeDrawer();
    await signOut();
    router.replace('/(auth)/sign_in');
  };

  return (
    <View style={styles.root}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.userRow}>
            <View style={styles.avatarWrap}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>{fullName?.[0]?.toUpperCase() ?? 'You'}</Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={() => props.navigation.closeDrawer()}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={18} />
            </Pressable>
          </View>

          <Text style={styles.name}>{fullName}</Text>
          {!!email && <Text style={styles.email}>{email}</Text>}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Pressable
            onPress={onPrivacy}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Text style={styles.itemText}>Privacy policy</Text>
          </Pressable>

          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Text style={styles.itemText}>Logout</Text>
          </Pressable>
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ZILNIQ 2026. All rights reserved</Text>
        <Text style={styles.footerStrong}>contact@zilniq.com</Text>
        <Text
          style={[styles.footerStrong, styles.footerLink]}
          onPress={() => Linking.openURL('https://zilniq.com')}
        >
          https://zilniq.com
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 28,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: 36,
    paddingHorizontal: spacing.xl,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  avatar: {
    width: 71,
    height: 71,
    borderRadius: 36,
  },
  avatarFallback: {
    backgroundColor: colors.drawer.fallbackAvatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.drawer.activeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  name: {
    marginTop: 9,
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
  },
  email: {
    marginTop: spacing.xs,
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    opacity: 0.75,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.xl,
    marginTop: 26,
    marginBottom: 14,
  },
  section: {
    paddingHorizontal: spacing.xl,
  },
  item: {
    paddingVertical: spacing.md,
  },
  itemPressed: {
    opacity: 0.6,
  },
  itemText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
  },
  footer: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: colors.drawer.footerText,
    textAlign: 'center',
  },
  footerStrong: {
    marginTop: spacing.xs,
    fontSize: 15,
    fontWeight: '500',
    color: colors.drawer.footerText,
    textAlign: 'center',
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});
