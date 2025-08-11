import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import {
  appleAuth,
  AppleButton,
  AppleRequestScope,
  AppleRequestOperation,
} from '@invertase/react-native-apple-authentication';

import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onPressLogin = async() => {
    try {
      const result = await auth().signInWithEmailAndPassword(email, password);
      console.log(result);
      navigation.navigate('Map');
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message);
    }
    
  };

  const handleAppleSignIn = async () => {
    try {
      if (__DEV__) {
        // 개발 환경에서는 목업 로그인 -> 다중에 이거 false처리하기
        console.log('🔧 DEV MOCK APPLE LOGIN');
        Alert.alert('Apple 로그인 (MOCK)', '개발 모드 목업 로그인 성공!');
        navigation.navigate('Map');
        return;
      }

      // 실제 Apple 로그인 요청
      const response = await appleAuth.performRequest({
        requestedOperation: AppleRequestOperation.LOGIN,
        requestedScopes: [AppleRequestScope.EMAIL, AppleRequestScope.FULL_NAME],
      });

      if (response.identityToken) {
        // 백엔드에 token 전송 등 처리 후
        Alert.alert('Apple 로그인 성공', '환영합니다!');
        navigation.navigate('Map');
      } else {
        throw new Error('No identity token returned');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Apple 로그인 오류', e.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 로고 */}
      <View style={styles.logoRow}>
        <Image
          source={require('../assets/groo_name_icon.png')}
          style={styles.logoName}
        />
        <Image
          source={require('../assets/groo_picture_icon.png')}
          style={styles.logoPic}
        />
      </View>

      {/* 이메일 입력 */}
      <View style={styles.inputWrapper}>
        <Image source={require('../assets/email.png')} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="이메일 주소를 입력해주세요"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* 비밀번호 입력 */}
      <View style={styles.inputWrapper}>
        <Image source={require('../assets/lock.png')} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>

      {/* 로그인 버튼 */}
      <TouchableOpacity style={styles.loginButton} onPress={onPressLogin}>
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 소셜 로그인 */}
      <View style={styles.socialRow}>
        {/* Apple 로그인 */}
        <TouchableOpacity style={styles.socialItem} onPress={handleAppleSignIn}>
          <View style={styles.socialBox}>
            <Image
              source={require('../assets/apple_icon.png')}
              style={styles.socialIcon}
            />
          </View>
          <Text style={styles.socialLabel}>Apple</Text>
        </TouchableOpacity>

        {/* Google 로그인 (기존처럼) */}
        <TouchableOpacity
          style={styles.socialItem}
          onPress={() => Alert.alert('Google 로그인', '구현 예정')}
        >
          <View style={styles.socialBox}>
            <Image
              source={require('../assets/google_icon.png')}
              style={styles.socialIcon}
            />
          </View>
          <Text style={styles.socialLabel}>Google</Text>
        </TouchableOpacity>
      </View>

      {/* 회원가입 */}
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.signupText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 36,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 110,
    marginTop: 110,
  },
  logoName: { width: 100, height: 69, resizeMode: 'contain', marginRight: 4 },
  logoPic: { width: 68, height: 45, resizeMode: 'contain' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  icon: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  input: { flex: 1, fontSize: 14, color: '#333' },
  loginButton: {
    width: 181,
    height: 46,
    backgroundColor: '#6BDE45',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
    marginTop: 10,
  },
  loginText: { color: '#000', fontWeight: 'normal', fontSize: 14 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.20)', // 세미콜론 제거
    marginVertical: 50,
    marginHorizontal: 5,
    marginTop: 150,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  socialItem: { alignItems: 'center', marginHorizontal: 14 },
  socialBox: {
    backgroundColor: 'rgba(217,217,217,0.3)',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: { width: 32, height: 32, resizeMode: 'contain' },
  socialLabel: { marginTop: 6, fontSize: 14, color: '#767676' },
  signupButton: { marginTop: 16, alignSelf: 'center' },
  signupText: { fontSize: 14, color: '#43C217' },
});

export default LoginScreen;
