import { VideoSplash } from '@/components/VideoSplashScreen';
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isSignedIn, isLoaded } = useUser();
  const [showVideo, setShowVideo] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      SplashScreen.hideAsync();
      setAppIsReady(true);
      router.replace("/home");
    } else {
      SplashScreen.hideAsync();
      setAppIsReady(true);
      setShowVideo(true);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (appIsReady && !showVideo && isLoaded && !isSignedIn) {
      const timeout = setTimeout(() => {
       router.replace({
        pathname: "/(auth)/sign_in",
        params: { fromVideo: 'true' } 
      });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [showVideo, appIsReady, isLoaded, isSignedIn]);

  const handleVideoFinish = () => {
    setShowVideo(false);
  };

  if (showVideo && !isSignedIn) {
    return <VideoSplash onFinish={handleVideoFinish} />;
  }

  return null;
}