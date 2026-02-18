// components/VideoSplashScreen.tsx
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  onFinish: () => void;
};

export function VideoSplash({ onFinish }: Props) {
  const videoSource = require('../assets/videos/splash.mp4');
  const hasFinished = useRef(false);
  
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      if (!hasFinished.current) {
        hasFinished.current = true;
        onFinish();
      }
    });

    // Fallback timeout în caz că event-ul nu se declanșează
    const timeout = setTimeout(() => {
      if (!hasFinished.current) {
        hasFinished.current = true;
        onFinish();
      }
    }, 10000);

    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
  }, [player, onFinish]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});