// src/screens/ProfileEditScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CameraIcon from '../../assets/camera.svg';
import Chip from '../../components/Chip';
import * as ImagePicker from 'react-native-image-picker';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

import {
  getUser,               // ✅ 서버에서 mbti/styleTags/foodTags 포함해서 가져옴
  patchMyDescription,
  patchMyProfileImageByUrl,
} from '../../apis/api/user';
import { postImageReview } from '../../apis/api/images';

const backIcon = require('../../assets/arrow.png');
const plusIcon = require('../../assets/plus_icon.png');

export default function ProfileEditScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();

  // 서버 닉네임
  const [nickname, setNickname] = useState<string>('');

  // MyPage에서 전달한 초기값 (있으면 우선 사용)
  const [intro, setIntro] = useState<string>(route.params?.intro ?? '');
  const [mbti, setMbti] = useState<string | null>(route.params?.mbti ?? null);
  const [stylesArr, setStylesArr] = useState<string[]>(route.params?.styles ?? []);
  const [foodsArr, setFoodsArr] = useState<string[]>(route.params?.foods ?? []);
  const [avatarUri, setAvatarUri] = useState<string | null>(route.params?.avatarUri ?? null);

  const initialRef = useRef({
    intro: route.params?.intro ?? '',
    avatarUri: route.params?.avatarUri ?? null,
  });

  const [saving, setSaving] = useState(false);

  const onSaveRef = useRef(route.params?.onSave);
  useEffect(() => {
    if (route.params?.onSave) onSaveRef.current = route.params.onSave;
  }, [route.params?.onSave]);

  /** ---------- helpers ---------- */
  const toStringArray = (src: any): string[] => {
    if (!src) return [];
    if (Array.isArray(src)) {
      return src
        .map(v =>
          typeof v === 'string'
            ? v
            : (v?.label ?? v?.value ?? v?.name ?? v?.title ?? '').toString()
        )
        .filter(Boolean);
    }
    return [];
  };
  const isHttpUrl = (u?: string | null) => !!u && /^https?:\/\//i.test(u || '');

  /** ---------- 서버의 저장값(마이페이지) 로드 ---------- */
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) return;
      try {
        const me: any = await getUser();

        // 닉네임
        if (me?.nickname) setNickname(me.nickname);

        // 한줄소개
        if (typeof me?.description === 'string' && me.description.trim()) {
          setIntro(prev => (prev?.length ? prev : me.description.trim()));
          // 초기 ref도 업데이트(변경 비교 정확도↑)
          if (!initialRef.current.intro) initialRef.current.intro = me.description.trim();
        }

        // ✅ 서버에 저장된 태그들을 초기 표시로 반영 (route로 이미 값이 오면 유지)
        if (mbti == null && typeof me?.mbti === 'string' && me.mbti.trim()) {
          setMbti(me.mbti.trim());
        }
        if ((!stylesArr || stylesArr.length === 0) && me?.styleTags) {
          setStylesArr(toStringArray(me.styleTags));
        }
        if ((!foodsArr || foodsArr.length === 0) && me?.foodTags) {
          setFoodsArr(toStringArray(me.foodTags));
        }

        // 아바타(경로가 서버 상대경로일 수 있으니 그냥 그대로 미리보기로 사용)
        if (!avatarUri) {
          const img = (me?.profileImageUrl ?? me?.profileImage ?? '').trim?.() || '';
          if (img) setAvatarUri(img);
          if (!initialRef.current.avatarUri) initialRef.current.avatarUri = img || null;
        }
      } catch (e) {
        console.error('프로필/키워드 로드 실패:', e);
      }
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // route로 넘어온 값이 바뀌면 동기화
  useEffect(() => {
    if (route.params?.mbti !== undefined) setMbti(route.params.mbti);
    if (route.params?.styles) setStylesArr(route.params.styles);
    if (route.params?.foods) setFoodsArr(route.params.foods);
    if (route.params?.avatarUri !== undefined) setAvatarUri(route.params.avatarUri);
  }, [route.params?.mbti, route.params?.styles, route.params?.foods, route.params?.avatarUri]);

  /** ---------- 이미지 선택 ---------- */
  const pickAvatar = useCallback(() => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 1,
    };
    ImagePicker.launchImageLibrary(options, (res) => {
      if (res.didCancel || res.errorCode) return;
      const asset = res.assets?.[0];
      if (asset?.uri) setAvatarUri(asset.uri);
    });
  }, []);

  /** ---------- 저장 ---------- */
  const onConfirm = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const tasks: Promise<any>[] = [];

      // 1) 한줄소개 변경 시에만 PATCH
      const introTrimmed = intro.trim();
      if (introTrimmed !== (initialRef.current.intro ?? '')) {
        tasks.push(patchMyDescription(introTrimmed));
      }

      // 2) 프로필 이미지 변경 시 처리
      if (avatarUri && avatarUri !== initialRef.current.avatarUri) {
        if (isHttpUrl(avatarUri)) {
          tasks.push(patchMyProfileImageByUrl(avatarUri));
        } else {
          const uploadResArr = await postImageReview([avatarUri]);
          const first: any = uploadResArr?.[0];
          const url =
            first?.url ||
            first?.imageUrl ||
            first?.profileImageUrl ||
            first?.data?.url ||
            first?.data?.imageUrl;
          if (!url || !/^https?:\/\//i.test(url)) {
            throw new Error('이미지 업로드 응답에서 URL을 찾지 못했어');
          }
          tasks.push(patchMyProfileImageByUrl(url));
        }
      }

      if (tasks.length) await Promise.all(tasks);

      // 상위 화면에 변경 값 전달 (UI 즉시 반영)
      try {
        onSaveRef.current?.({
          intro: introTrimmed,
          mbti,
          styles: stylesArr,
          foods: foodsArr,
          avatarUri,
        });
      } catch {}

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('저장 실패', '프로필을 저장하는 중 오류가 발생했어. 잠시 뒤 다시 시도해줘.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} disabled={saving}>
          <Image source={backIcon} style={[styles.headerIcon, saving && { opacity: 0.5 }]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={onConfirm} style={styles.headerButton} disabled={saving}>
          {saving ? <ActivityIndicator /> : <Text style={styles.headerConfirm}>확인</Text>}
        </TouchableOpacity>
      </View>

      {/* ✅ 스크롤 가능 + 키보드 회피 */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 52 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.card}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarBg} />
              {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : null}

              {/* 프로필 이미지 전체와 겹치는 카메라 오버레이 */}
              <TouchableOpacity
                onPress={pickAvatar}
                activeOpacity={0.85}
                style={styles.avatarHit}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={saving}
              >
                <CameraIcon width={44} height={44} />
              </TouchableOpacity>
            </View>

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
                editable={!saving}
              />
              <Text style={styles.charCount}>{intro.length}/30자</Text>
            </View>
          </View>

          {/* Keyword Display (서버 저장값/선택값을 그대로 보여줌) */}
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

            <TouchableOpacity
              style={styles.plusIconWrapper}
              onPress={() =>
                navigation.navigate('KeywordSelection', {
                  mbti,
                  styles: stylesArr,
                  foods: foodsArr,
                  avatarUri,
                  onApply: (next: { mbti: string | null; styles: string[]; foods: string[] }) => {
                    setMbti(next.mbti);
                    setStylesArr(next.styles);
                    setFoodsArr(next.foods);
                  },
                })
              }
              disabled={saving}
            >
              <Image source={plusIcon} style={styles.plusIconSmall} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 150;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex1: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerButton: { width: 40, alignItems: 'center' },
  headerIcon: { width: 24, height: 24, resizeMode: 'contain' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  headerConfirm: { fontSize: 20, color: '#0DBC65', fontWeight: '600' },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
  },

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
  // 전체를 덮는 카메라 버튼(항상 보이게)
  avatarHit: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nickname: { fontSize: 21, fontWeight: '600', color: '#111', marginTop: 8, marginBottom: 16 },

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
  charCount: { position: 'absolute', right: 16, bottom: 12, fontSize: 12, color: '#999' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 24, marginHorizontal: 0,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  sectionSubtitle: { fontSize: 13, color: '#999' },

  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 15,
    marginHorizontal: 0,
  },
  plusIconWrapper: { margin: 4, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  plusIconSmall: { width: 35, height: 35, resizeMode: 'contain' },
});
