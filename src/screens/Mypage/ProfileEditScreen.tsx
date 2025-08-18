// src/screens/ProfileEditScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import CameraIcon from '../../assets/camera.svg';
import Chip from '../../components/Chip';
import * as ImagePicker from 'react-native-image-picker';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { getUser } from '../../apis/api/user';

const backIcon = require('../../assets/arrow.png');
const plusIcon = require('../../assets/plus_icon.png');

export default function ProfileEditScreen({ navigation, route }: any) {
  // ✅ 서버 닉네임
  const [nickname, setNickname] = useState<string>('');

  // ✅ MyPage에서 전달한 초기값
  const [intro, setIntro] = useState<string>(route.params?.intro ?? '');
  const [mbti, setMbti] = useState<string | null>(route.params?.mbti ?? null);
  const [stylesArr, setStylesArr] = useState<string[]>(route.params?.styles ?? []);
  const [foodsArr, setFoodsArr] = useState<string[]>(route.params?.foods ?? []);
  const [avatarUri, setAvatarUri] = useState<string | null>(route.params?.avatarUri ?? null);

  // ✅ onSave 콜백 보관
  const onSaveRef = useRef(route.params?.onSave);
  useEffect(() => {
    if (route.params?.onSave) onSaveRef.current = route.params.onSave;
  }, [route.params?.onSave]);

  // ✅ 서버에서 닉네임 불러오기 (MyPage와 동일 흐름)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) return;
      try {
        const res = await getUser();
        console.log('getUser from ProfileEdit:', res);
        if (res?.nickname) setNickname(res.nickname);
      } catch (e) {
        console.error('닉네임을 불러오지 못했습니다:', e);
      }
    });
    return unsubscribe;
  }, []);

  // ✅ KeywordSelection 복귀 시 동기화
  useEffect(() => {
    if (route.params?.mbti !== undefined) setMbti(route.params.mbti);
    if (route.params?.styles) setStylesArr(route.params.styles);
    if (route.params?.foods) setFoodsArr(route.params.foods);
    if (route.params?.avatarUri !== undefined) setAvatarUri(route.params.avatarUri);
  }, [route.params?.mbti, route.params?.styles, route.params?.foods, route.params?.avatarUri]);

  // ▶ 갤러리에서 아바타 선택
  const pickAvatar = useCallback(() => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 1,
    };
    ImagePicker.launchImageLibrary(options, (res) => {
      if (res.didCancel || res.errorCode) return;
      const uri = res.assets?.[0]?.uri;
      if (uri) setAvatarUri(uri);
    });
  }, []);

  // ✅ 확인: 저장 콜백 호출 후 뒤로가기
  const onConfirm = () => {
    const payload = { intro, mbti, styles: stylesArr, foods: foodsArr, avatarUri };
    try { onSaveRef.current?.(payload); } catch {}
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Image source={backIcon} style={styles.headerIcon} />
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
            {/* 회색 원 배경 */}
            <View style={styles.avatarBg} />
            {/* 선택된 사진이 있을 때만 표시 */}
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : null}

            {/* 원 전체가 터치 영역, 가운데 카메라 아이콘 */}
            <TouchableOpacity
              onPress={pickAvatar}
              activeOpacity={0.85}
              style={styles.avatarHit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {!avatarUri && <CameraIcon width={44} height={44} />}
            </TouchableOpacity>
          </View>

          {/* ✅ 서버에서 받은 닉네임 표시 */}
          <Text style={styles.nickname}>{nickname || '닉네임'}</Text>

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

          {/* ➕ 키워드 선택 이동 */}
          <TouchableOpacity
            style={styles.plusIconWrapper}
            onPress={() =>
              navigation.navigate('KeywordSelection', {
                mbti, styles: stylesArr, foods: foodsArr, avatarUri,
                onApply: (next: { mbti: string | null; styles: string[]; foods: string[] }) => {
                  setMbti(next.mbti);
                  setStylesArr(next.styles);
                  setFoodsArr(next.foods);
                },
              })
            }
          >
            <Image source={plusIcon} style={styles.plusIconSmall} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 150;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerButton: { width: 40, alignItems: 'center' },
  headerIcon: { width: 24, height: 24, resizeMode: 'contain' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  headerConfirm: { fontSize: 20, color: '#0DBC65', fontWeight: '600' },

  container: { flex: 1, paddingHorizontal: 20 },

  card: { backgroundColor: '#F7F7F7', borderRadius: 20, paddingVertical: 40, paddingHorizontal: 20, alignItems: 'center', marginTop: 16 },

  /* 아바타 */
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarBg: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#DDD',
  },
  avatarImage: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarHit: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nickname: { fontSize: 21, fontWeight: '600', color: '#111', marginTop: 8 , marginBottom: 16,},

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
