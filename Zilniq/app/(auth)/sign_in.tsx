import AppleLogo from '@/assets/icons/AppleLogo';
import GoogleLogo from '@/assets/icons/GoogleLogo';
import { SafeAreaScreen } from '@/components/SafeAreaScreen';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useOAuth } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const params = useLocalSearchParams();
  const fromVideo = params.fromVideo === 'true';
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(fromVideo ? 0 : 1)).current;
  const titleOpacity = useRef(new Animated.Value(fromVideo ? 0 : 1)).current;
  const subtitleOpacity = useRef(new Animated.Value(fromVideo ? 0 : 1)).current;
  const containerTranslateY = useRef(new Animated.Value(fromVideo ? 0 : -80)).current;
  const buttonsOpacity = useRef(new Animated.Value(fromVideo ? 0 : 1)).current;

  useEffect(() => {
    if (!fromVideo) return;

    Animated.sequence([
      Animated.stagger(250, [
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(containerTranslateY, { toValue: -80, duration: 600, useNativeDriver: true }),
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [fromVideo]);

  const onGooglePress = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuth();
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/home');
      }
    } catch (err) {
      console.error('Google OAuth failed:', err);
    }
  };

  const onApplePress = async () => {
    try {
      const { createdSessionId, setActive } = await startAppleOAuth();
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/home');
      }
    } catch (err) {
      console.error('Apple OAuth failed:', err);
    }
  };

  return (
    <SafeAreaScreen extraStyles={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View style={[styles.contentCenter, { transform: [{ translateY: containerTranslateY }] }]}>
          <Animated.View style={{ opacity: logoOpacity }}>
            <Image style={styles.logo} source={require('./../../assets/images/logo.png')} />
          </Animated.View>

          <Animated.View style={{ opacity: titleOpacity }}>
            <Text style={styles.title}>Welcome to Zilniq</Text>
          </Animated.View>

          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text style={styles.subtitle}>tracking, but chill...</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.buttonsContainer, { opacity: buttonsOpacity }]}>
          <Pressable onPress={onGooglePress} style={[styles.button, styles.oauth]}>
            <GoogleLogo />
            <Text style={styles.oauthText}>Continue with Google</Text>
          </Pressable>

          <Pressable onPress={onApplePress} style={[styles.button, styles.oauth]}>
            <AppleLogo />
            <Text style={styles.oauthText}>Continue with Apple</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  contentCenter: {
    alignItems: 'center',
  },
  logo: {
    height: 108,
    width: 108,
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 15,
    color: colors.text,
  },
  subtitle: {
    fontWeight: '400',
    fontSize: 18,
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: 13,
    width: '100%',
    flexDirection: 'row',
    gap: spacing.lg,
  },
  oauth: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.auth.oauthBorder,
  },
  oauthText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});
