import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="home"
        options={{
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}