// 파일 경로: src/screens/ProfileEditScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function ProfileEditScreen({ navigation, route }: { navigation: any; route: any }) {
  const [intro, setIntro] = useState('');
  const [mbti, setMbti] = useState<string | null>(null);
  const [stylesArr, setStylesArr] = useState<string[]>([]);
  const [foodsArr, setFoodsArr] = useState<string[]>([]);

  // route.params가 바뀔 때마다 선택값 state에 반영
  useEffect(() => {
    if (route.params?.mbti !== undefined) setMbti(route.params.mbti);
    if (route.params?.styles) setStylesArr(route.params.styles);
    if (route.params?.foods) setFoodsArr(route.params.foods);
  }, [route.params]);

  const renderChip = (label: string, chipStyle: any, textStyle: any) => (
    <View key={label} style={[styles.chip, chipStyle]}>
      <Text style={[styles.chipText, textStyle]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Image source={require('../assets/arrow.png')} style={styles.headerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={() => {/* 확인 로직 */}} style={styles.headerButton}>
          <Text style={styles.headerConfirm}>확인</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBackground} />
            <TouchableOpacity style={styles.cameraButton}>
              <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.nickname}>이지윤</Text>
          <Text style={styles.handle}>@jiyoooon_</Text>

          <View style={styles.introWrapper}>
            <TextInput
              style={styles.introInput}
              placeholder="한줄소개로 나를 설명해보세요!"
              placeholderTextColor="#999"
              value={intro}
              onChangeText={setIntro}
              maxLength={30}
              multiline
            />
            <Text style={styles.charCount}>{intro.length}/30자</Text>
          </View>
        </View>

        {/* Keyword Display */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 키워드</Text>
          <Text style={styles.sectionSubtitle}>키워드를 등록해서 취향을 알려주세요!</Text>
        </View>
        <View style={styles.chipsWrapper}>
          {mbti && renderChip(mbti, styles.chipSelectedMBTI, styles.chipTextSelectedMBTI)}
          {stylesArr.map(label => renderChip(label, styles.chipSelectedStyle, styles.chipTextSelectedStyle))}
          {foodsArr.map(label => renderChip(label, styles.chipSelectedFood, styles.chipTextSelectedFood))}

          {/* 플러스 아이콘: 칩 뒤에, 칩 스타일 없이 */}
          <TouchableOpacity
            style={styles.plusIconWrapper}
            onPress={() =>
              navigation.navigate('KeywordSelection', { mbti, styles: stylesArr, foods: foodsArr })
            }
          >
            <Image source={require('../assets/plus_icon.png')} style={styles.plusIconSmall} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: { width: 40, alignItems: 'center' },
  headerIcon: { width: 24, height: 24, resizeMode: 'contain' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  headerConfirm: { fontSize: 20, color: '#0DBC65', fontWeight: '600' },

  container: { flex: 1, paddingHorizontal: 20 },

  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  avatarWrapper: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarBackground: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#DDD',
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  cameraButton: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: { width: 50, height: 50, resizeMode: 'contain' },

  nickname: { fontSize: 21, fontWeight: '600', color: '#111', marginTop: 8 },
  handle: { fontSize: 18, color: '#777', marginBottom: 16, marginTop: 5 },

  introWrapper: { width: '100%', position: 'relative' },
  introInput: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#333',
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    fontSize: 12,
    color: '#999',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 20,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  sectionSubtitle: { fontSize: 13, color: '#999' },

  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 15,
    marginHorizontal: 15,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B9B9B9',
    margin: 4,
    backgroundColor: '#FFF',
  },
  chipText: { fontSize: 15, color: '#333' },

  // MBTI
  chipSelectedMBTI: { backgroundColor: '#6CDF44', borderColor: '#6CDF44' },
  chipTextSelectedMBTI: { color: '#111' },

  // Styles
  chipSelectedStyle: { backgroundColor: '#474747', borderColor: '#474747' },
  chipTextSelectedStyle: { color: '#FFF' },

  // Foods
  chipSelectedFood: { backgroundColor: '#FFF', borderColor: '#000', borderWidth: 2 },
  chipTextSelectedFood: { color: '#000' },

  // 플러스 아이콘(wrapper + size)
  plusIconWrapper: {
    margin: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIconSmall: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
});
