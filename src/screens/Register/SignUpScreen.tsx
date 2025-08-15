// 파일 경로: src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import SignupNavigation from '../../components/signupNavigation';

type EmailErrorKind = null | 'empty' | 'invalid' | 'duplicate';

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailErrorKind, setEmailErrorKind] = useState<EmailErrorKind>(null);

  // 예시: 이 이메일만 중복 처리
  const isEmailDuplicate = (input: string) =>
    input.trim().toLowerCase() === 'eina05@korea.ac.kr';

  const onPressNext = () => {
    const trimmed = email.trim().toLowerCase();

    if (trimmed === '') {
      setEmailErrorKind('empty');
      return;
    }
    if (!trimmed.includes('@')) {
      setEmailErrorKind('invalid');
      return;
    }
    if (isEmailDuplicate(trimmed)) {
      setEmailErrorKind('duplicate');
      return;
    }

    setEmailErrorKind(null);
    navigation.navigate('Password'); // ← 유효성 통과 시 PasswordScreen으로 이동
  };

  const onPressBack = () => {
    navigation.navigate('Login'); // ← 이전 버튼은 Login으로
  };

  const emailErrorMessage =
    emailErrorKind === 'empty'
      ? '이메일이 비어있습니다.'
      : emailErrorKind === 'invalid'
      ? '올바른 형식이 아닙니다.'
      : emailErrorKind === 'duplicate'
      ? '해당 이메일은 이미 존재합니다.'
      : '';

  return (
    <KeyboardAvoidingView
      style={styles.avoidContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.container}>
        {/* 상단 타이틀 */}
        <Text style={styles.title}>회원가입</Text>

        {/* 이름 입력 */}
        <Text style={styles.label}>이름</Text>
        <View style={styles.inputWrapper}>
          <Image source={require('../../assets/user-fill.png')} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 이메일 입력 */}
        <Text style={[styles.label, { marginTop: 24 }]}>이메일 주소</Text>
        <View
          style={[
            styles.inputWrapper,
            !!emailErrorKind && styles.inputWrapperError,
            !!emailErrorKind && styles.inputWrapperErrorBg,
          ]}
        >
          <Image source={require('../../assets/email.png')} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="이메일 주소를 입력해주세요"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (emailErrorKind) setEmailErrorKind(null);
            }}
            onSubmitEditing={onPressNext}
            returnKeyType="next"
          />
        </View>

        {!!emailErrorKind && <Text style={styles.errorText}>{emailErrorMessage}</Text>}

        {/* 하단 고정 내비게이션 (이전/다음) */}
        <SignupNavigation
          onBack={onPressBack}
          onNext={onPressNext}
          disabledNext={!email.trim()} // 이메일이 비어있으면 다음 비활성화(원치 않으면 제거)
        />

        {/* 푸터가 absolute라 입력영역 가리지 않도록 여유 공간 */}
        <View style={{ height: 120 }} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avoidContainer: { flex: 1 },
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
    fontSize: 18,
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
    marginBottom: 4,
    marginLeft: 20,
    marginRight: 20,
    height: 52,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapperError: { borderColor: 'red' },
  inputWrapperErrorBg: { backgroundColor: '#FFF4F4' },
  icon: { width: 20, height: 20, marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  errorText: {
    color: '#DC1D1D',
    fontSize: 13,
    marginLeft: 20,
    marginBottom: 8,
  },
});
