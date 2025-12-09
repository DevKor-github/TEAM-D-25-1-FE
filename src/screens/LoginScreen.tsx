// file: src/screens/LoginScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import {exchangeFirebaseTokenWithBackend} from '../apis/api/login';

const LoginScreen = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 로딩 시작 시 입력값 비우기
  useEffect(() => {
    if (isLoading) {
      setEmail('');
      setPassword('');
    }
  }, [isLoading]);

  const onPressLogin = async () => {
    try {
      if (!email.trim() || !password) {
        Alert.alert('입력 확인', '이메일과 비밀번호를 입력해주세요.');
        return;
      }

      setIsLoading(true);

      // Firebase 로그인
      const userCredential = await auth().signInWithEmailAndPassword(
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
      const customApplicationToken = payload.accessToken;
      console.log(
        '로그인 성공! 커스텀 애플리케이션 토큰:',
        customApplicationToken,
      );

      // 실제 화면으로 이동
      navigation.navigate('Map');
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        '로그인 실패',
        error?.message ?? '알 수 없는 오류가 발생했어요.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);

      // Apple 인증 요청
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      // Apple ID 토큰으로 Firebase credential 생성
      const {identityToken, nonce} = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      // Firebase에 로그인
      const userCredential = await auth().signInWithCredential(appleCredential);
      const user = userCredential.user;
      if (!user) {
        throw new Error('Firebase user not found after Apple login.');
      }

      // Firebase ID 토큰 → 백엔드 교환
      const firebaseIdToken = await user.getIdToken();
      console.log('Firebase ID Token (Apple):', firebaseIdToken);

      const payload = await exchangeFirebaseTokenWithBackend(firebaseIdToken);
      const customApplicationToken = payload.accessToken;
      console.log(
        'Apple 로그인 성공! 커스텀 애플리케이션 토큰:',
        customApplicationToken,
      );

      // 실제 화면으로 이동
      navigation.navigate('Map');
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      Alert.alert(
        'Apple 로그인 실패',
        error?.message ?? '알 수 없는 오류가 발생했어요.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{flex: 1}}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0} // 만약 상단에 헤더 있으면 헤더 높이만큼 조정
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
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
              <Image
                source={require('../assets/email.png')}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="이메일 주소를 입력해주세요"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                editable={!isLoading}
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
                returnKeyType="done"
                onSubmitEditing={onPressLogin}
                editable={!isLoading}
              />
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                {
                  backgroundColor: isLoading
                    ? 'rgba(193, 248, 174, 1)'
                    : '#6CDF44',
                  opacity: isLoading ? 0.9 : 1,
                },
              ]}
              onPress={onPressLogin}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <Text style={styles.loginText}>로그인</Text>
              )}
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 소셜 로그인 */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialItem}
                onPress={handleAppleSignIn}
                disabled={isLoading}
                activeOpacity={0.85}>
                <View style={styles.socialBox}>
                  <Image
                    source={require('../assets/apple_icon.png')}
                    style={styles.socialIcon}
                  />
                </View>
                <Text style={styles.socialLabel}>Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialItem}
                onPress={() => Alert.alert('Google 로그인', '구현 예정')}
                disabled={isLoading}
                activeOpacity={0.85}>
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
              disabled={isLoading}
              activeOpacity={0.85}>
              <Text style={styles.signupText}>회원가입</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* ✅ 전체 화면 로딩 오버레이 (초록색 스피너) - 필요하면 주석 해제 */}
          {/* {isLoading && (
            <View style={styles.loadingOverlay} pointerEvents="auto">
              <ActivityIndicator size="large" color="#6CDF44" />
            </View>
          )} */}
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 36,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 110,
    marginTop: 110,
  },
  logoName: {width: 100, height: 69, resizeMode: 'contain', marginRight: 4},
  logoPic: {width: 68, height: 45, resizeMode: 'contain'},

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F8',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 56,
  },
  icon: {width: 20, height: 20, marginRight: 8, resizeMode: 'contain'},
  input: {flex: 1, fontSize: 14, color: '#333'},

  loginButton: {
    width: 181,
    height: 48,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 16,
    marginTop: 10,
  },
  loginText: {color: '#111', fontWeight: '500', fontSize: 14},

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    marginVertical: 30,
    marginHorizontal: 4,
    marginTop: 125,
  },

  socialRow: {flexDirection: 'row', justifyContent: 'center', marginBottom: 16},
  socialItem: {alignItems: 'center', marginHorizontal: 14},
  socialBox: {
    backgroundColor: 'rgba(217,217,217,0.3)',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {width: 32, height: 32, resizeMode: 'contain'},
  socialLabel: {
    marginTop: 6,
    fontSize: 14,
    color: '#767676',
    fontWeight: '400',
  },

  signupButton: {marginTop: 16, alignSelf: 'center'},
  signupText: {
    fontSize: 15,
    color: '#43C217',
    marginBottom: 35,
    fontWeight: '500',
  },

  // ✅ 로딩 오버레이
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
