import { useUser } from '@clerk/clerk-expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export default function DemoScreen() {
  const videoSource = require('../assets/videos/demo.mp4');
  const hasFinished = useRef(false);
  const { isSignedIn } = useUser();

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = false;
    p.play();
  });

  const finish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    if (isSignedIn) {
      router.back();
    } else {
      router.replace({
        pathname: '/(auth)/sign_in',
        params: { fromVideo: 'true' },
      });
    }
  };

  useEffect(() => {
    const subscription = player.addListener('playToEnd', finish);
    const timeout = setTimeout(finish, 60000);

    return () => {
      subscription.remove();
      clearTimeout(timeout);
    };
  }, [player]);

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
