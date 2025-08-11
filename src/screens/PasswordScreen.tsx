// 파일 경로: src/screens/PasswordScreen.tsx
import React, { useState } from 'react';
import SignupNavigation from '../navigations/signupNavigation';
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

export default function PasswordScreen({ navigation }: { navigation: any }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const isMatch = confirmPassword.length > 0 && password === confirmPassword;

  const validatePassword = (pwd: string) => {
    if (pwd.length < 7 || pwd.length > 14) {
      return '비밀번호는 7자 이상 14자 이하이어야 합니다.';
    }
    if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      return '비밀번호는 영문자와 숫자를 모두 포함해야 합니다.';
    }
    return null;
  };

  const onPressNext = () => {
    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }
    setPasswordError(null);

    if (password !== confirmPassword) {
      setConfirmError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setConfirmError(null);
    navigation.navigate('Nickname');
  };

  const disabledNext = !(password && confirmPassword && isMatch && !passwordError && !confirmError);

  return (
    <KeyboardAvoidingView
      style={styles.avoidContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        {/* 입력폼 전체 */}
        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>

          <Text style={styles.label}>비밀번호</Text>
          <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
            <Image source={require('../assets/key-fill.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
            />
          </View>
          <Text style={styles.subText}>7자~14자의 영문/숫자를 활용해주세요.</Text>
          {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

          <Text style={styles.label}>비밀번호 확인</Text>
          <View style={[styles.inputWrapper,
            (confirmError || (!isMatch && confirmPassword.length > 0)) && styles.inputWrapperError
          ]}>
            <Image source={require('../assets/key-fill.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력해주세요"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError(null);
              }}
            />
          </View>
          {confirmPassword.length > 0 && (
            isMatch
              ? <Text style={[styles.matchText, styles.matchTextSuccess]}>비밀번호가 일치합니다.</Text>
              : <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
          )}
        </View>

        {/* 네비게이션 버튼 영역 */}
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
    marginBottom: 4,
    height: 52,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapperError: {
    borderColor: 'red',
    backgroundColor: '#FFECEC',
  },
  icon: { width: 20, height: 20, marginRight: 12 },
  input: { flex: 1, fontSize: 14, color: '#333', height: '100%' },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  matchText: {
    fontSize: 12,
    marginBottom: 8,
  },
  matchTextSuccess: {
    color: 'green',
  },
});
