// 파일 경로: src/screens/WelcomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function WelcomeScreen({ route, navigation }: { route: any; navigation: any }) {
  const { nickname } = route.params;

  return (
    <KeyboardAvoidingView
      style={styles.avoidContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        {/* 상단 콘텐츠 */}
        <View style={styles.content}>
          <Image
            source={require('../assets/complete.svg')} 
            style={styles.seedImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>{nickname}님, 반가워요!</Text>
          <Text style={styles.subtitle}>
            회원가입이 완료되었어요. 로그인해서 첫 씨앗을 심어보세요.
          </Text>
        </View>

        {/* 하단 버튼 */}
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avoidContainer: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  seedImage: {
    width: 200,
    height: 200,
    marginTop: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 23,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: '#767676',
    textAlign: 'center',
    lineHeight: 23,
  },
  startButton: {
    backgroundColor: '#6CDF44',
    borderRadius: 999,
    height: 55,
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 34 : 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '500',
  },
});