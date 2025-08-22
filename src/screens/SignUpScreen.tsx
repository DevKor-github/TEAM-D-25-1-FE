// 파일 경로: src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Alert, // ◀ Alert를 import 합니다.
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SignupNavigation from '../components/signupNavigation';
import { signUpUser } from '../apis/api/user'; // ◀ 1. 위에서 만든 API 함수를 import 합니다.

type EmailErrorKind = null | 'empty' | 'invalid' | 'duplicate';

export default function SignUpScreen({ navigation }: { navigation: any }) {
  // State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Error State
  const [emailErrorKind, setEmailErrorKind] = useState<EmailErrorKind>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  // Password Visibility State
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // 로딩 상태 추가 (선택 사항이지만 좋은 UX를 위해 권장)
  const [isLoading, setIsLoading] = useState(false);

  const isEmailDuplicate = (input: string) =>
    input.trim().toLowerCase() === 'eina05@korea.ac.kr';

  const validatePassword = (pwd: string) => {
    if (pwd.length < 7 || pwd.length > 14) {
      return '비밀번호는 7자 이상 14자 이하이어야 합니다.';
    }
    if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      return '비밀번호는 영문자와 숫자를 모두 포함해야 합니다.';
    }
    return null;
  };

  // ▼▼▼ 2. onPressNext 함수를 async로 변경하고 API 호출 로직을 추가합니다. ▼▼▼
  const onPressNext = async () => {
    // --- 1. 클라이언트 측 유효성 검사 (기존과 동일) ---
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === '') return setEmailErrorKind('empty');
    if (!trimmedEmail.includes('@')) return setEmailErrorKind('invalid');
    if (isEmailDuplicate(trimmedEmail)) return setEmailErrorKind('duplicate');
    setEmailErrorKind(null);

    const pwdError = validatePassword(password);
    if (pwdError) return setPasswordError(pwdError);
    setPasswordError(null);

    if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setConfirmPasswordError(null);

    // --- 2. 서버에 계정 생성 요청 ---
    setIsLoading(true); // 로딩 시작
    try {
      // API 함수를 호출하여 서버에 데이터를 전송합니다.
      await signUpUser({
        nickname: name,
        email: email,
        password: password,
      });

      // --- 3. 성공 시 화면 이동 ---
      navigation.navigate('Welcome', { nickname: name });

    } catch (error: any) {
      // API 호출 실패 시 서버에서 보내주는 에러 메시지를 사용자에게 보여줍니다.
      // (예: "이미 사용 중인 이메일입니다.")
      const errorMessage = error.response?.data?.message || '알 수 없는 에러가 발생했습니다.';
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const onPressBack = () => {
    navigation.navigate('Login');
  };

  const emailErrorMessage =
    emailErrorKind === 'empty' ? '이메일이 비어있습니다.'
    : emailErrorKind === 'invalid' ? '올바른 형식이 아닙니다.'
    : emailErrorKind === 'duplicate' ? '해당 이메일은 이미 존재합니다.'
    : '';
  
  const disabledNext = !(name && email && password && confirmPassword) || isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
        enableOnAndroid={true}
      >
        <View>
          <Text style={styles.title}>회원가입</Text>

          {/* 이름 입력 */}
          <Text style={styles.label}>닉네임</Text>
          <View style={styles.inputWrapper}>
            <Image source={require('../assets/user-fill.png')} style={styles.icon} />
            <TextInput style={styles.input} placeholder="이름을 입력해주세요" placeholderTextColor="#999" value={name} onChangeText={setName} />
          </View>

          {/* 이메일 입력 */}
          <Text style={[styles.label, { marginTop: 24 }]}>이메일 주소</Text>
          <View style={[styles.inputWrapper, !!emailErrorKind && styles.inputWrapperError]}>
            <Image source={require('../assets/email.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="이메일 주소를 입력해주세요"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={text => { setEmail(text); if (emailErrorKind) setEmailErrorKind(null); }}
            />
          </View>
          {!!emailErrorKind && <Text style={styles.errorText}>{emailErrorMessage}</Text>}

          {/* 비밀번호 입력 */}
          <Text style={[styles.label, { marginTop: 24 }]}>비밀번호</Text>
          <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
            <Image source={require('../assets/key-fill.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor="#999"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={text => { setPassword(text); if (passwordError) setPasswordError(null); }}
            />
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeButton}>
              <Image 
                source={isPasswordVisible ? require('../assets/icons/eye_open.svg') : require('../assets/icons/eye_closed.svg')} 
                style={styles.eyeIcon} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.subText}>7자~14자의 영문/숫자를 활용해주세요.</Text>
          {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

          {/* 비밀번호 확인 입력 */}
          <Text style={[styles.label, { marginTop: 24 }]}>비밀번호 확인</Text>
          <View style={[styles.inputWrapper, confirmPasswordError && styles.inputWrapperError]}>
            <Image source={require('../assets/key-fill.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호를 다시 입력해주세요"
              placeholderTextColor="#999"
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError(null);
              }}
            />
            <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeButton}>
              <Image 
                source={isConfirmPasswordVisible ? require('../assets/icons/eye_open.svg') : require('../assets/icons/eye_closed.svg')} 
                style={styles.eyeIcon} 
              />
            </TouchableOpacity>
          </View>
          {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
        </View>

        {/* 네비게이션 버튼 */}
        <SignupNavigation
          onBack={onPressBack}
          onNext={onPressNext}
          disabledNext={disabledNext}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
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
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
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
    marginTop: 4,
  },
  eyeButton: {
    padding: 5,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
});