// 파일 경로: src/screens/NicknameScreen.tsx
import React, { useState } from 'react';
import SignupNavigation from '../navigations/signupNavigation';
import {
  View,
  Text,
  TextInput,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

export default function NicknameScreen({ navigation }: { navigation: any }) {
  const [nickname, setNickname] = useState('');
  const [Id, setId] = useState('');

  const onPressNext = () => {
    if (!nickname.trim() || !Id.trim()) return;
    // 다음 화면으로 nickname을 전달
    navigation.navigate('Welcome', { nickname });
  };

  const disabledNext = !(nickname.trim() && Id.trim());

  return (
    <KeyboardAvoidingView
      style={styles.avoidContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        {/* 입력폼 영역 */}
        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>

          <Text style={styles.label}>닉네임</Text>
          <View style={styles.inputWrapper}>
            <Image source={require('../assets/user-fill.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="닉네임을 입력해주세요"
              placeholderTextColor="#999"
              value={nickname}
              onChangeText={setNickname}
            />
          </View>
          <Text style={styles.subText}>닉네임은 나중에 언제든지 바꿀 수 있어요.</Text>

          <Text style={styles.label}>아이디</Text>
          <View style={styles.inputWrapper}>
            <Image source={require('../assets/at_icon.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="abcd_1234"
              placeholderTextColor="#999"
              value={Id}
              onChangeText={setId}
            />
          </View>
          <Text style={styles.subText}>
            영문 소문자, 숫자, _ 조합으로 4~16자까지 입력하세요.
          </Text>
        </View>

        {/* 네비게이션 버튼 */}
        <SignupNavigation
          onBack={() => navigation.goBack()}
          onNext={onPressNext}
          disabledNext={disabledNext}
        />
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
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 40,
    marginBottom: 35,
    color: '#111',
  },
  label: {
    fontSize: 18,
    color: '#111',
    marginBottom: 8,
    fontWeight: '400',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 8,
  },
  icon: { width: 20, height: 20, marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: '#333', height: '100%' },
  subText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
});