import { apiFetch } from '@/api/client';
import type { ColorPalette } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth, useClerk, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const { user } = useUser();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { override, setOverride, resolvedScheme } = useTheme();
  const isDark = resolvedScheme === 'dark';

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fullName = user?.fullName ?? 'User';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const avatar = user?.imageUrl;

  const onPrivacy = () => {
    Linking.openURL('https://zilniq.com/privacy-policy/');
  };

  const onTermsAndConditions = () => {
    Linking.openURL("https://zilniq.com/terms-and-conditions/");
  };

  const onLogout = async () => {
    props.navigation.closeDrawer();
    await signOut();
    router.replace('/(auth)/sign_in');
  };

  const onDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await apiFetch('/api/users/delete-account', { method: 'POST', token });
      setDeleteModalVisible(false);
      await signOut();
      router.replace('/(auth)/sign_in');
    } catch (err) {
      setIsDeleting(false);
      Alert.alert('Error', 'Could not delete account. Please try again.');
    }
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
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <Text style={styles.name}>{fullName}</Text>
          {!!email && <Text style={styles.email}>{email}</Text>}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Pressable
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/demo' as any);
            }}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Text style={styles.itemText}>How to use the app</Text>
          </Pressable>

          <Pressable
            onPress={onPrivacy}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Text style={styles.itemText}>Privacy policy</Text>
          </Pressable>

          <Pressable
            onPress={onTermsAndConditions}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Text style={styles.itemText}>Terms and Conditions</Text>
          </Pressable>

          <View style={styles.themeRow}>
              <Text style={styles.itemText}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
            <Switch
              value={isDark}
              onValueChange={(val) => setOverride(val ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.nutrient.kcal }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Text style={styles.itemText}>Logout</Text>
          </Pressable>

          <Pressable
            onPress={() => setDeleteModalVisible(true)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Text style={[styles.itemText, styles.deleteText]}>Delete Account</Text>
          </Pressable>
        </View>
      </DrawerContentScrollView>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalBody}>Are you sure you want to delete your account?</Text>
            <Text style={styles.modalWarning}>* This action cannot be undone</Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
                style={({ pressed }) => [styles.modalBtn, styles.modalBtnCancel, pressed && styles.itemPressed]}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onDeleteAccount}
                disabled={isDeleting}
                style={({ pressed }) => [styles.modalBtn, styles.modalBtnDelete, pressed && styles.itemPressed]}
              >
                {isDeleting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalBtnDeleteText}>Yes, Delete</Text>
                }
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
      width: 70,
      height: 70,
      borderRadius: 35,
      overflow: 'hidden',
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 35,
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
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
    },
    themeRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    themeIcon: {
      opacity: 0.85,
    },
    autoBtn: {
      paddingBottom: spacing.md,
    },
    autoBtnText: {
      fontSize: 14,
      color: colors.textSecondary,
      textDecorationLine: 'underline',
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
    deleteText: {
      color: '#E03333',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    modalBox: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: spacing.xl,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    modalBody: {
      fontSize: 16,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    modalWarning: {
      fontSize: 13,
      color: '#E03333',
      marginBottom: spacing.xl,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBtnCancel: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalBtnCancelText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    modalBtnDelete: {
      backgroundColor: '#E03333',
    },
    modalBtnDeleteText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
