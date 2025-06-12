// 파일 경로: src/screens/PasswordScreen.tsx
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

export default function PasswordScreen({ navigation }: { navigation: any }) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 간단히 “7~14자 영문/숫자” 조건을 확인하는 함수 예시
  const validatePassword = (pwd: string) => {
    // 길이 체크
    if (pwd.length < 7 || pwd.length > 14) {
      return '비밀번호는 7자 이상 14자 이하이어야 합니다.';
    }
    // 영문+숫자 조합 여부 체크 (간단 예시: 숫자 하나 이상 + 영문 하나 이상)
    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if (!hasLetter || !hasNumber) {
      return '비밀번호는 영문자와 숫자를 모두 포함해야 합니다.';
    }
    return null; // 문제없음
  };

  const onPressNext = () => {
   const errorMsg = validatePassword(password);
   if (errorMsg) {
     setPasswordError(errorMsg);
     return;
   }
   setPasswordError(null);
   console.log('비밀번호 통과 → Nickname 화면으로 이동');
   navigation.navigate('Nickname'); // ← NicknameScreen으로 이동
 };


  return (
    <KeyboardAvoidingView
      style={styles.avoidContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* 상단 타이틀 */}
        <Text style={styles.title}>회원가입</Text>

        {/* 비밀번호 입력 레이블 */}
        <Text style={styles.label}>비밀번호</Text>
        <View
          style={[
            styles.inputWrapper,
            passwordError && styles.inputWrapperError,
          ]}
        >
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
          />
        </View>
        {/* 안내 문구 */}
        <Text style={styles.subText}>
          7자~14자의 영문/숫자를 활용해주세요.
        </Text>
        {/* 에러 메시지 */}
        {passwordError && (
          <Text style={styles.errorText}>{passwordError}</Text>
        )}

        {/* 하단 “다음” 버튼(또는 “완료” 버튼 등) */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={onPressNext}>
            <Text style={styles.nextButtonText}>다음</Text>
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
    marginBottom: 4,
    marginLeft: 20,
    marginRight: 20,
    height: 52,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputWrapperError: {
    borderColor: 'red',
    backgroundColor: '#FFECEC',
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 20,
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
