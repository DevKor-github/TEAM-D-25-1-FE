// 파일 경로: src/screens/NicknameScreen.tsx
import React, { useState } from 'react';
import SignupNavigation from '../components/signupNavigation';
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

import auth from '@react-native-firebase/auth';
import { exchangeFirebaseTokenWithBackend } from '../apis/api/login';
import { patchNickname } from '../apis/api/user';

type EmailErrorKind = null | 'empty' | 'invalid' | 'duplicate';


export default function NicknameScreen({ navigation }: { navigation: any }) {
  const [nickname, setNickname] = useState('');
  const [Id, setId] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailErrorKind, setEmailErrorKind] = useState<EmailErrorKind>(null);

  // 예시: 이 이메일만 중복 처리
  const isEmailDuplicate = (input: string) =>
    input.trim().toLowerCase() === 'eina05@korea.ac.kr';


  const emailErrorMessage =
    emailErrorKind === 'empty'
      ? '이메일이 비어있습니다.'
      : emailErrorKind === 'invalid'
      ? '올바른 형식이 아닙니다.'
      : emailErrorKind === 'duplicate'
      ? '해당 이메일은 이미 존재합니다.'
      : '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // 이메일 유효성 검사 함수
  const validateEmail = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === '') {
      setEmailErrorKind('empty');
    } else if (!trimmedEmail.includes('@')) {
      setEmailErrorKind('invalid');
    } else if (isEmailDuplicate(trimmedEmail)) {
      setEmailErrorKind('duplicate');
    } else {
      setEmailErrorKind(null);
    }
  };
  
  const validatePassword = (pwd: string) => {
    if (pwd.length < 7 || pwd.length > 14) {
      return '비밀번호는 7자 이상 14자 이하이어야 합니다.';
    }
    if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      return '비밀번호는 영문자와 숫자를 모두 포함해야 합니다.';
    }
    return null;
  };
  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setPasswordError(error);
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      setConfirmError('비밀번호가 일치하지 않습니다.');
    } else {
      setConfirmError(null);
    }
  };

  const isMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const onPressNext = async () => {
    if (disabledNext) {
      return;
    }

    setFirebaseError(null);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;
      if (!user) {
        throw new Error('Firebase user not found after login.');
      }

      // Firebase ID 토큰 → 백엔드 교환
      const firebaseIdToken = await user.getIdToken();
      console.log('Firebase ID Token:', firebaseIdToken);

      const payload = await exchangeFirebaseTokenWithBackend(firebaseIdToken);
      const customApplicationToken = payload.accessToken
      await patchNickname(nickname);
      
      console.log(
        '로그인 성공! 커스텀 애플리케이션 토큰:',
        customApplicationToken,
      );

      // 회원가입 성공 시 다음 화면으로 이동
      navigation.navigate('Welcome', {nickname});
    } catch (error: any) {
      // Firebase 오류 처리
      console.error('Firebase 회원가입 오류:', error);
      if (error.code === 'auth/email-already-in-use') {
        setEmailErrorKind('duplicate');
        setFirebaseError('해당 이메일은 이미 사용 중입니다.');
      } else if (error.code === 'auth/invalid-email') {
        setEmailErrorKind('invalid');
        setFirebaseError('이메일 형식이 올바르지 않습니다.');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('비밀번호가 너무 약합니다.');
        setFirebaseError('비밀번호는 6자 이상이어야 합니다.');
      } else {
        setFirebaseError('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  const disabledNext = !(nickname.trim() && email.trim() && confirmPassword.trim());

  return (
    <KeyboardAvoidingView
      style={styles.avoidContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container}>
        {/* 입력폼 영역 */}
        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>

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
          <Text style={[styles.label]}>이메일 주소</Text>
          <View
            style={[
              styles.inputWrapper,
              !!emailErrorKind && styles.inputWrapperError,
            ]}>
            <Image
              source={require('../assets/email.png')}
              style={styles.icon}
            />
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

          {!!emailErrorKind && (
            <Text style={styles.errorText}>{emailErrorMessage}</Text>
          )}

          <Text style={styles.label}>비밀번호</Text>
          <View
            style={[
              styles.inputWrapper,
              passwordError && styles.inputWrapperError,
            ]}>
            <Image
              source={require('../assets/key-fill.png')}
              style={styles.icon}
            />
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
              onBlur={handlePasswordBlur}
            />
          </View>
          {!passwordError && ( // passwordError가 null일 때만 표시
            <Text style={styles.subText}>
              7자~14자의 영문/숫자를 활용해주세요.
            </Text>
          )}
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <Text style={styles.label}>비밀번호 확인</Text>
          <View
            style={[
              styles.inputWrapper,
              (confirmError || (!isMatch && confirmPassword.length > 0)) &&
                styles.inputWrapperError,
            ]}>
            <Image
              source={require('../assets/key-fill.png')}
              style={styles.icon}
            />
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
          {confirmPassword.length > 0 &&
            (isMatch ? (
              <Text style={[styles.matchText, styles.matchTextSuccess]}>
                비밀번호가 일치합니다.
              </Text>
            ) : (
              <Text style={styles.errorText}>
                비밀번호가 일치하지 않습니다.
              </Text>
            ))}
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
  avoidContainer: {flex: 1},
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
  icon: {width: 20, height: 20, marginRight: 12},
  input: {flex: 1, fontSize: 15, color: '#333', height: '100%'},
  subText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputWrapperError: {
    borderColor: '#DC1D1D', // ##을 #으로 수정
    backgroundColor: '#FFECEC',
    borderWidth: 1,
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