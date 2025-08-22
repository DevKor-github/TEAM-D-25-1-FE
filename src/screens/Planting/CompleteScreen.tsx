import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

// WelcomeScreen은 이제 route prop이 필요 없습니다.
export default function WelcomeScreen({ navigation }: { navigation: any }) {
  // `nickname`을 받아오던 코드는 제거합니다.

  const goToMap = () => {
    // 회원가입/씨앗심기 스택을 없애고 맵 화면으로 바로 이동하도록 replace를 사용합니다.
    navigation.replace('Map');
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.content}>
        <Image
          // ▼▼▼ 이미지 소스를 새싹 이미지로 변경합니다. ▼▼▼
          source={require('../../assets/welcome.png')}
          style={styles.seedImage}
          resizeMode="contain"
        />
        {/* ▼▼▼ 제목과 부제목 텍스트를 스크린샷에 맞게 수정합니다. ▼▼▼ */}
        <Text style={styles.title}>씨앗이 잘 심어졌어요!</Text>
        <Text style={styles.subtitle}>
          이제 친구들이 내 나무에 물을 주면 성장해요.
        </Text>
      </View>

      {/* ▼▼▼ 하단 버튼 UI와 기능을 스크린샷에 맞게 수정합니다. ▼▼▼ */}
      <TouchableOpacity
        style={styles.linkButton}
        activeOpacity={0.8}
        onPress={goToMap}
      >
        <Text style={styles.linkButtonText}>나무 보러가기 ›</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1, // 남은 공간을 모두 차지하여 콘텐츠를 중앙에 배치
    alignItems: 'center',
    justifyContent: 'center', // 수직 중앙 정렬
    paddingHorizontal: 24,
    paddingBottom: 50, // 버튼과의 간격을 위해 하단에 여백 추가
  },
  seedImage: {
    width: 200,
    height: 200,
    marginBottom: 40, // 제목과의 간격
  },
  title: {
    fontSize: 23, // 폰트 크기 조정
    fontWeight: '600',
    color: '#111',
    marginBottom: 16, // 부제목과의 간격
  },
  subtitle: {
    fontSize: 14, // 폰트 크기 조정
    color: '#767676',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 24, // 줄 간격 조정
  },
  // ▼▼▼ '나무 보러가기' 버튼 스타일 ▼▼▼
  linkButton: {
    alignSelf: 'center', // 버튼을 가로 중앙에 배치
    padding: 16,
    marginBottom: 60, // 화면 하단과의 간격
  },
  linkButtonText: {
    color: '#0DBC65', // 초록색 텍스트
    fontSize: 18,
    fontWeight: '600',
  },
});