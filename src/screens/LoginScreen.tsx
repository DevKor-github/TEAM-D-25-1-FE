// 파일 경로: src/screens/LoginScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,     
} from 'react-native';

const LoginScreen = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onPress = () => {
    navigation.navigate('Map');
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

      {/* 이메일 입력 (아이콘 + TextInput) */}
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
        />
      </View>

      {/* 비밀번호 입력 (아이콘 + TextInput) */}
      <View style={styles.inputWrapper}>
        <Image
          source={require('../assets/lock.png')} 
          style={styles.icon}
        />
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
      <TouchableOpacity style={styles.loginButton} onPress={onPress}>
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>

      {/* 구분선 */}
      <View style={styles.divider} />

      {/* 소셜 로그인 아이콘 + 레이블 */}
      <View style={styles.socialRow}>
        {/* Apple */}
        <View style={styles.socialItem}>
          <View style={styles.socialBox}>
            <Image
              source={require('../assets/apple_icon.png')}
              style={styles.socialIcon}
            />
          </View>
          <Text style={styles.socialLabel}>apple</Text>
        </View>
        {/* Google */}
        <View style={styles.socialItem}>
          <View style={styles.socialBox}>
            <Image
              source={require('../assets/google_icon.png')}
              style={styles.socialIcon}
            />
          </View>
          <Text style={styles.socialLabel}>Google</Text>
        </View>
      </View>

      {/* 하단 회원가입 */}
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
  // 전체 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 36,
    justifyContent: 'center',
  },
  // 로고 행
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 110,
    marginTop: 110,
  },
  logoName: {
    width: 100,
    height: 69,
    resizeMode: 'contain',
    marginRight: 4,
  },
  logoPic: {
    width: 68,
    height: 45,
    resizeMode: 'contain',
  },
  // 입력창 래퍼 (아이콘 + TextInput)
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 48,
    
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  // 로그인 버튼
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
  loginText: {
    color: '#000',
    fontWeight: 'normal',
    fontSize: 14,
  },
  // 구분선
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.20);',
    marginVertical: 50,
    marginHorizontal: 5,
    marginTop: 150,
  },
  // 소셜 행
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  // 각 소셜 아이템 (원 + 레이블)
  socialItem: {
    alignItems: 'center',
    marginHorizontal: 14,
  },
  // 원형 박스
  socialBox: {
    backgroundColor: 'rgba(217,217,217,0.3)',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  socialLabel: {
    marginTop: 6,
    fontSize: 14,
    color: '#767676',
  },
  // 회원가입 링크
  signupButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#43C217',
  },
});

export default LoginScreen;
