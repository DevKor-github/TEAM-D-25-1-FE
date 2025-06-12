// 파일 경로: src/screens/SignUpScreen.tsx
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

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // ✱ 빈 칸 에러: true면 "이메일이 비어있습니다." 메시지 출력
  const [isEmptyError, setIsEmptyError] = useState(false);
  // ✱ 중복 에러: true면 "해당 이메일은 이미 존재합니다." 메시지 출력
  const [emailError, setEmailError] = useState(false);

  /**
   * 이메일 중복 검사 함수
   * 예시로 'eina05@korea.ac.kr'만 중복이라고 가정
   * 실제 앱에서는 서버 API를 호출해서 확인하세요.
   */
  const isEmailDuplicate = (input: string) => {
    return input.trim().toLowerCase() === 'eina05@korea.ac.kr';
  };

  /**
   * “다음” 버튼을 눌렀을 때:
   * 1) 이메일이 빈 칸이면 isEmptyError=true → "이메일이 비어있습니다." 표시
   * 2) 이메일이 하드코딩된 중복값이면 emailError=true → "해당 이메일은 이미 존재합니다." 표시
   * 3) 나머지(빈 칸도 아님, 중복도 아님)에는 둘 다 false로 초기화하고 Password 화면으로 이동
   */
  const onPressNext = () => {
    const trimmed = email.trim().toLowerCase();

    // 1) 빈 칸 에러 처리
    if (trimmed === '') {
      setIsEmptyError(true);
      setEmailError(false);
      return;
    }
    setIsEmptyError(false);

    // 2) 중복 검사
    if (isEmailDuplicate(trimmed)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);

    // 3) 빈 칸도 아니고 중복도 아니면 다음 화면(Password)으로 이동
    navigation.navigate('Password');
  };

  return (
    // 키보드가 올라오면 콘텐츠를 밀어 올리도록 감싸기
    <KeyboardAvoidingView
      style={styles.avoidContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView style={styles.container}>
        {/* 상단 타이틀 */}
        <Text style={styles.title}>회원가입</Text>

        {/* 이름 입력 필드 */}
        <Text style={styles.label}>이름</Text>
        <View style={styles.inputWrapper}>
          <Image
            source={require('../assets/user-fill.png')} // 아이콘 경로
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#999"
            value={name}
            onChangeText={text => setName(text)}
          />
        </View>

        {/* 이메일 입력 필드 */}
        <Text style={[styles.label, { marginTop: 24 }]}>이메일 주소</Text>
        <View
          style={[
            styles.inputWrapper,
            // 빈 칸 또는 중복 에러 시 테두리와 배경색 적용
            (isEmptyError || emailError) && styles.inputWrapperError,
            (isEmptyError || emailError) && styles.inputWrapperErrorBg,
          ]}
        >
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
              // 사용자가 입력을 수정하면 에러 상태 초기화
              if (isEmptyError) setIsEmptyError(false);
              if (emailError) setEmailError(false);
            }}
          />
        </View>

        {/* ✱ 빈 칸 에러 메시지 */}
        {isEmptyError && (
          <Text style={styles.errorText}>
            이메일이 비어있습니다.
          </Text>
        )}
        {/* ✱ 중복 에러 메시지 (빈 칸 에러가 아닐 때만) */}
        {!isEmptyError && emailError && (
          <Text style={styles.errorText}>
            해당 이메일은 이미 존재합니다.
          </Text>
        )}

        {/* 하단 “다음” 버튼 */}
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
  // 빈 칸이나 중복일 때 적용할 빨간 테두리 - 오류 시 사용
  inputWrapperError: {
    borderColor: 'red',
  },
  // 빈 칸이나 중복일 때 적용할 연한 빨간 배경 - 얘도
  inputWrapperErrorBg: {
    backgroundColor: '#FFF4F4',
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
  errorText: {
    color: '#DC1D1D', 
    fontSize: 13,
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
