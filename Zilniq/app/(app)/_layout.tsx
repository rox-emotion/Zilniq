import ChatIcon from '@/assets/icons/ChatIcon';
import MenuIcon from '@/assets/icons/MenuIcon';
import StatsIcon from '@/assets/icons/StatsIcon';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Pressable, TouchableOpacity } from 'react-native';
import { CustomDrawerContent } from './_drawerContent';

function getMainRouteName(route: any) {
  const name = getFocusedRouteNameFromRoute(route);
  // când intri prima dată, poate fi undefined -> consideră "home"
  return name ?? 'home';
}

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerTitle: '',
        drawerActiveBackgroundColor: '#FFF',
        drawerActiveTintColor: '#111',
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ paddingHorizontal: 20 }}
          >
            <MenuIcon />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="(main)"
        options={({ route, navigation }) => {
          const focused = getMainRouteName(route);

          const isStats = focused === 'stats';

          return {
            title: '',
            headerRight: isStats
              ? () => (
                <LinearGradient colors={["#606060", "#060606"]} style={{height:48, width:48, borderRadius:48/2, justifyContent:"center", alignItems:"center", marginRight:20}}>
                        <Pressable onPress={() => router.push("/home")}>
                            <ChatIcon />
                        </Pressable>
                  </LinearGradient>
              )
              : () => (
                   <LinearGradient colors={["#606060", "#060606"]} style={{height:48, width:48, borderRadius:48/2, justifyContent:"center", alignItems:"center", marginRight:20}}>
                        <Pressable onPress={() => router.push("/stats")}>
                            <StatsIcon />
                        </Pressable>
                  </LinearGradient>
                ),
          };
        }}
      />

    </Drawer>
  );
}
