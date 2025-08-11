// 파일: src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

type Props = {
  navigation: any;
};

export default function SplashScreen({ navigation }: Props) {
  const firedRef = useRef(false);

  const goNext = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    navigation.replace('Onboard'); // 온보딩 화면으로
  };

  useEffect(() => {
    const timer = setTimeout(goNext, 4000); //4초
    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={goNext}>
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Image
            source={require('../assets/groo-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            나만의 맛집, 나무가 되다{'\n'}
            '맛집' 공유 소셜 서비스 그루
          </Text>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});
