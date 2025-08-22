// 파일: src/screens/ProfileEditScreen.tsx
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
  getUser,
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

  // MyPage에서 전달한 초기값
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

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) return;
      try {
        const res = await getUser();
        if (res?.nickname) setNickname(res.nickname);
      } catch (e) {
        console.error('닉네임을 불러오지 못했습니다:', e);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (route.params?.mbti !== undefined) setMbti(route.params.mbti);
    if (route.params?.styles) setStylesArr(route.params.styles);
    if (route.params?.foods) setFoodsArr(route.params.foods);
    if (route.params?.avatarUri !== undefined) setAvatarUri(route.params.avatarUri);
  }, [route.params?.mbti, route.params?.styles, route.params?.foods, route.params?.avatarUri]);

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

  const isHttpUrl = (u?: string | null) => !!u && /^https?:\/\//i.test(u || '');

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
          // 이미 원격 URL이면 바로 반영
          tasks.push(patchMyProfileImageByUrl(avatarUri));
        } else {
          // 로컬 이미지 → /images/review 업로드 → URL 획득 → URL PATCH
          const uploadResArr = await postImageReview([avatarUri]);
          const first: any = uploadResArr?.[0];
          // 서버 응답의 URL 키 이름에 맞게 아래 중 하나가 잡히도록 처리
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
          avatarUri, // 필요하면 여기서 서버 URL로 교체해도 됨
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
              <TouchableOpacity
                onPress={pickAvatar}
                activeOpacity={0.85}
                style={styles.avatarHit}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={saving}
              >
                {!avatarUri && <CameraIcon width={44} height={44} />}
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
