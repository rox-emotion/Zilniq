import ChatIcon from '@/assets/icons/ChatIcon';
import MenuIcon from '@/assets/icons/MenuIcon';
import StatsIcon from '@/assets/icons/StatsIcon';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { Route } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Pressable, StyleSheet } from 'react-native';
import { CustomDrawerContent } from './_drawerContent';

function getMainRouteName(route: Route<string>): string {
  return getFocusedRouteNameFromRoute(route) ?? 'home';
}

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerTitle: '',
        drawerActiveBackgroundColor: colors.drawer.activeBackground,
        drawerActiveTintColor: colors.drawer.activeTint,
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable hitSlop={5} onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
            <MenuIcon />
          </Pressable>
        ),
      })}
    >
      <Drawer.Screen
        name="(main)"
        options={({ route }) => {
          const focused = getMainRouteName(route);
          const isStats = focused === 'stats';

          return {
            title: '',
            headerRight: isStats
              ? () => (
                  <Pressable onPress={() => router.push('/home')} hitSlop={20}>
                    <LinearGradient colors={colors.gradient.buttonActive} style={styles.headerButton}>
                      <ChatIcon />
                    </LinearGradient>
                  </Pressable>
                )
              : () => (
                  <Pressable onPress={() => router.push('/stats')} hitSlop={20}>
                    <LinearGradient colors={colors.gradient.buttonActive} style={styles.headerButton}>
                      <StatsIcon />
                    </LinearGradient>
                  </Pressable>
                ),
          };
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    paddingHorizontal: spacing.xl,
  },
  headerButton: {
    height: 48,
    width: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
});
