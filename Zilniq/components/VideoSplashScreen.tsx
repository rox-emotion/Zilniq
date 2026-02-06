// components/VideoSplashScreen.tsx
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  onFinish: () => void;
};

export function VideoSplash({ onFinish }: Props) {
  const videoSource = require('../assets/videos/splash.mp4');
  const hasFinished = useRef(false);
  
  // const player = useVideoPlayer(videoSource, player => {
  //   player.loop = false;
  //   player.play();
  // });

  useEffect(() => {
    // Verifică periodic dacă video-ul s-a terminat
    // const interval = setInterval(() => {
    //   if (player.status === 'readyToPlay' && !hasFinished.current) {
    //     const currentTime = player.currentTime;
    //     const duration = player.duration;
        
    //     // Dacă suntem aproape de final (ultimele 100ms)
    //     if (duration > 0 && currentTime >= duration - 0.1) {
    //       hasFinished.current = true;
    //       onFinish();
    //       clearInterval(interval);
    //     }
    //   }
    // }, 100);

    // return () => {
    //   clearInterval(interval);
    // };
  }, []);

  return (
    <View style={styles.container}>
      {/* <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
      /> */}
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