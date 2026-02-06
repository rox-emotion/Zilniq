import { useClerk, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
type MenuRoute = {
  label: string;
  routeName: string; 
  disabled?: boolean;
};

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { signOut } = useClerk();
  const { user } = useUser();

  const routes: MenuRoute[] = [
    { label: 'My profile', routeName: 'profile', disabled: true }, 
    { label: 'Settings', routeName: 'settings' },
  ];

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
    router.replace("/(auth)/sign_in");

  };

  return (
    <View style={styles.root}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.userRow}>
            <View style={styles.avatarWrap}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>
                    {fullName?.[0]?.toUpperCase() ?? 'You'}
                  </Text>
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
        <Text style={styles.footerText}>EmotionStudios 2026. All rights reserved</Text>
        <Text style={styles.footerStrong}>contact@zilniq.com</Text>
        <Text style={styles.footerStrong}>46747647880</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:28
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 24,
  },

  header: {
    paddingTop: 36,
    paddingHorizontal: 20,
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
    borderRadius: 71/2,
  },
  avatarFallback: {
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  name: {
    marginTop: 9,
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
  },
  email: {
    marginTop: 4,
    fontSize: 15,
    fontWeight:'400',
    color: '#000',
    opacity: 0.75,
  },

  divider: {
    height: 1,
    backgroundColor: '#DFDFDF',
    marginHorizontal: 20,
    marginTop:26,
    marginBottom: 14
  },

  section: {
    paddingHorizontal: 20,
  },

  item: {
    paddingVertical: 12,
  },
  itemPressed: {
    opacity: 0.6,
  },

  itemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },

  itemDisabled: {
    opacity: 0.25,
  },
  itemTextDisabled: {
    color: '#111',
  },

  footer: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#454545',
    textAlign: 'center',
  },
  footerStrong: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '500',
    color: '#454545',
    textAlign: 'center',
  },
});
