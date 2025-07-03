// 파일 경로: src/screens/NicknameScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function NicknameScreen({ navigation }: { navigation: any }) {
  const [nickname, setNickname] = useState('');

  // (예시) “다음” 버튼을 누르면 Main 화면으로 이동하거나,
  // 회원가입 완료 로직을 호출하도록 구현..예정 -> 이거는 정해야하요
  const onPressNext = () => {
    // 닉네임이 빈 칸이 아닌지만 간단히 체크
    if (nickname.trim() === '') {
      return; // 빈 칸이면 아무 동작 안 함 
    }
    console.log('닉네임:', nickname);
    // 예: 회원가입 최종 API 호출 후 메인 화면으로 이동
    // navigation.replace('Map');
    // 또는 다른 스크린으로 이동
  };

  return (
    <KeyboardAvoidingView //키보드움직임설정
      style={styles.avoidContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* ——— 상단 제목 ——— */}
        <Text style={styles.title}>회원가입</Text>

        {/* ——— 닉네임 레이블 ——— */}
        <Text style={styles.label}>닉네임</Text>
        <View style={styles.inputWrapper}>
          <Image
            source={require('../assets/user-fill.png')} 
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor="#999"
            value={nickname}
            onChangeText={setNickname}
          />
        </View>
        {/* ——— 안내 문구 ——— */}
        <Text style={styles.subText}>
          닉네임은 나중에 언제든지 바꿀 수 있어요.
        </Text>

        {/* ——— 하단 “다음” 버튼 ——— */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={onPressNext}>
            <Text style={styles.nextButtonText}>완료</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avoidContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 40,
    marginLeft: 20,
    marginBottom: 35,
    color: '#111',
  },
  label: {
    fontSize: 16,
    color: '#111',
    marginLeft: 20,
    marginBottom: 8,
    fontWeight: '400',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8, // 입력창과 안내 문구 사이 간격
    marginLeft: 20,
    marginRight: 20,
    height: 52,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  subText: {
    marginLeft: 20,
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 32,
  },
  nextButton: {
    backgroundColor: '#6CDF44',
    borderRadius: 999,
    height: 48,
    marginLeft: 20,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '500',
  },
});
