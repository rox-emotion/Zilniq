import AppleLogo from '@/assets/icons/AppleLogo'
import GoogleLogo from '@/assets/icons/GoogleLogo'
import { SafeAreaScreen } from '@/components/SafeAreaScreen'
import { useOAuth } from '@clerk/clerk-expo'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'

WebBrowser.maybeCompleteAuthSession()

export default function SignIn() {
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' })
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' })

  const params = useLocalSearchParams();
  const fromVideo = params.fromVideo === 'true';
  const router = useRouter()

  const logoOpacity = useRef(new Animated.Value(fromVideo ? 0 : 1)).current;
  const titleOpacity = useRef(new Animated.Value(fromVideo ? 0 : 1)).current;
  const subtitleOpacity = useRef(new Animated.Value(fromVideo ? 0 : 1)).current;
  
  const containerTranslateY = useRef(new Animated.Value(fromVideo ? 0 : -80)).current;
  
  const buttonsOpacity = useRef(new Animated.Value(fromVideo ? 0 : 1)).current;

  useEffect(() => {
    if (fromVideo) {
      Animated.sequence([
        Animated.stagger(250, [
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(containerTranslateY, {
            toValue: -80, 
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(buttonsOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [fromVideo]);

  const onGooglePress = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleOAuth()
      if (createdSessionId) {
        await setActive!({ session: createdSessionId })
        router.replace('/home')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const onApplePress = async () => {
    try {
      const { createdSessionId, setActive } = await startAppleOAuth()
      if (createdSessionId) {
        await setActive!({ session: createdSessionId })
        router.replace('/home')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <SafeAreaScreen extraStyles={{alignItems:"center", justifyContent:"center", flexGrow:1}}>
      <View style={styles.container}>
        <Animated.View 
          style={{
            alignItems:"center",
            transform: [{ translateY: containerTranslateY }]
          }}
        >
          <Animated.View style={{ opacity: logoOpacity }}>
            <Image 
              style={{height:108, width:108, marginBottom: 18}} 
              source={require("./../../assets/images/logo.png")}
            />
          </Animated.View>

          <Animated.View style={{ opacity: titleOpacity }}>
            <Text style={styles.title}>Welcome to Zilniq</Text>
          </Animated.View>

          <Animated.View style={{ opacity: subtitleOpacity }}>
            <Text style={{fontWeight:"400", fontSize: 18}}>tracking, but chill...</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={{width:'100%', opacity: buttonsOpacity}}>
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
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    alignItems:"center",
    flex:1,
    justifyContent:"center",
    width:'100%'
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#FFF',
  },
  button: {
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 13,
    width:"100%",
    flexDirection: "row",
    gap: 16
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  oauth: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#000',
  },
  oauthText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  linkText: {
    textAlign: 'center',
    color: '#111',
    fontSize: 14,
    marginTop: 8,
  },
})