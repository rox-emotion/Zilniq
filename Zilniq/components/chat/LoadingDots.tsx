import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export const LoadingDots = () => {
  const [dots, setDots] = useState('.');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={{ width:53, height:27, alignItems:'center', justifyContent:"center", borderRadius:13, backgroundColor:"#F8F8F8" }}>
      <Text style={{ fontSize: 24, color: '#BDBDBD', lineHeight:24 }}>{dots}</Text>
    </View>
  );
};