// src/screens/ProfileEditScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import CameraIcon from '../assets/camera.svg';
import Chip from '../components/Chip';

export default function ProfileEditScreen({ navigation, route }: any) {
  // ✅ MyPage에서 전달한 초기값
  const [intro, setIntro] = useState<string>(route.params?.intro ?? '');
  const [mbti, setMbti] = useState<string | null>(route.params?.mbti ?? null);
  const [stylesArr, setStylesArr] = useState<string[]>(route.params?.styles ?? []);
  const [foodsArr, setFoodsArr] = useState<string[]>(route.params?.foods ?? []);

  // ✅ onSave 콜백을 ref에 보관 (KeywordSelection 왕복 후에도 유실 방지)
  const onSaveRef = useRef(route.params?.onSave);
  useEffect(() => {
    if (route.params?.onSave) onSaveRef.current = route.params.onSave;
  }, [route.params?.onSave]);

  // ✅ KeywordSelection에서 돌아왔을 때 표시용 동기화(보조용)
  useEffect(() => {
    if (route.params?.mbti !== undefined) setMbti(route.params.mbti);
    if (route.params?.styles) setStylesArr(route.params.styles);
    if (route.params?.foods) setFoodsArr(route.params.foods);
  }, [route.params?.mbti, route.params?.styles, route.params?.foods]);

  // ✅ 확인: 저장 콜백 호출 후, 기존 MyPage로 '뒤로가기'
  const onConfirm = () => {
    const payload = { intro, mbti, styles: stylesArr, foods: foodsArr };
    try { onSaveRef.current?.(payload); } catch {}
    navigation.goBack(); // ✨ navigate('MyPage') 쓰지 말고 goBack!
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        {/* '이전'도 무조건 MyPage로 돌아가게: goBack이면 바로 기존 MyPage로 */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Image source={require('../assets/arrow.png')} style={styles.headerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={onConfirm} style={styles.headerButton}>
          <Text style={styles.headerConfirm}>확인</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBackground} />
            <TouchableOpacity style={styles.cameraButton}>
              <CameraIcon width={40} height={40} />
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
          {mbti && <Chip label={mbti} variant="mbti" selected />}

          {stylesArr.map((label: string) => (
            <Chip key={`style-${label}`} label={label} variant="style" selected />
          ))}

          {foodsArr.map((label: string) => (
            <Chip key={`food-${label}`} label={label} variant="food" selected />
          ))}

          {/* ➕ 키워드 선택으로 이동 — onApply 콜백으로 자기 상태 갱신 */}
          <TouchableOpacity
            style={styles.plusIconWrapper}
            onPress={() =>
              navigation.navigate('KeywordSelection', {
                mbti, styles: stylesArr, foods: foodsArr,
                onApply: (next: { mbti: string | null; styles: string[]; foods: string[] }) => {
                  setMbti(next.mbti);
                  setStylesArr(next.styles);
                  setFoodsArr(next.foods);
                },
              })
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerButton: { width: 40, alignItems: 'center' },
  headerIcon: { width: 24, height: 24, resizeMode: 'contain' },
  headerTitle: { fontSize: 23, fontWeight: '600' },
  headerConfirm: { fontSize: 23, color: '#0DBC65', fontWeight: '600' },

  container: { flex: 1, paddingHorizontal: 20 },

  card: { backgroundColor: '#F7F7F7', borderRadius: 20, paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center', marginTop: 16 },
  avatarWrapper: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative' },
  avatarBackground: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#DDD' },
  cameraButton: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },

  nickname: { fontSize: 21, fontWeight: '600', color: '#111', marginTop: 8 },
  handle: { fontSize: 18, color: '#777', marginBottom: 16, marginTop: 5 },

  introWrapper: { width: '100%', position: 'relative' },
  introInput: { backgroundColor: '#EFEFEF', borderRadius: 8, padding: 15, fontSize: 14, color: '#333', height: 80, textAlignVertical: 'top' },
  charCount: { position: 'absolute', right: 16, bottom: 12, fontSize: 12, color: '#999' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  sectionSubtitle: { fontSize: 13, color: '#999' },

  chipsWrapper: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginVertical: 15, marginHorizontal: 15 },
  plusIconWrapper: { margin: 4, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  plusIconSmall: { width: 35, height: 35, resizeMode: 'contain' },
});
