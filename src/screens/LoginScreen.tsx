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
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* 상단 로고: 이름 + 그림 분리 되어있음*/}
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
      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
      />

      {/* 비밀번호 입력 */}
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* 로그인 버튼 */}
      <TouchableOpacity style={styles.loginButton} onPress={onPress}>
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>

      {/* 소셜 로그인 아이콘 */}
      <View style={styles.socialRow}>
        <Image
          source={require('../assets/google_icon.png')}
          style={[styles.icon, {marginTop: 40}]}
        />
        <Image
          source={require('../assets/kakaotalk_icon.png')}
          style={[styles.icon, {marginTop: 40}]}
        />
        <Image
          source={require('../assets/naver_icon.png')}
          style={[styles.icon, {marginTop: 40}]}
        />
      </View>

      {/* 하단 회원가입 */}
      <TouchableOpacity>
        <Text style={styles.signupText}>이메일로 회원가입</Text>
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
    marginBottom: 40,
  },
  logoName: {
    width: 92,
    height: 69,
    resizeMode: 'contain',
    marginRight: 4,
  },
  logoPic: {
    width: 64.5,
    height: 45,
    resizeMode: 'contain',
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  loginButton: {
    width: 181,
    height: 46,
    backgroundColor: '#6BDE45',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 149, // 화면 가로 기준 가운데 배치
    marginVertical: 16,
    alignSelf: 'center',
  },
  loginText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  icon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    marginHorizontal: 6,
  },
  signupText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
