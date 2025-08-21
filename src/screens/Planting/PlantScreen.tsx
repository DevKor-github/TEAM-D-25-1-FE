// src/screens/Planting/PlantScreen.tsx
import React, { useCallback, useLayoutEffect, useState, useEffect } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import {
  addPhoto,
  setReviewText,
  resetSeedPlanting,
} from '../../redux/seedPlantingSlice';

import SearchIcon from '../../assets/search.svg';
import ArrowRightIcon from '../../assets/chevron-right.svg';
import CameraIcon from '../../assets/camera.svg';

import * as ImagePicker from 'react-native-image-picker';
import { RootState } from '../../types/types';
import { postTree } from '../../apis/api/tree';
import { postImageReview } from '../../apis/api/images';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTag } from '../../apis/api/user';

const backIcon = require('../../assets/arrow.png');
const plusPng = require('../../assets/plus_icon.png');

const REQUIRED_GREEN = '#0DBC65';

const PlantScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const { savedRestaurant, savedSeed, savedTags, savedPhotos, reviewText } =
    useSelector((state: RootState) => state.seedPlanting);

  const [tagMap, setTagMap] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const isConfirmEnabled = savedRestaurant !== null && savedSeed !== null;

  useEffect(() => {
    const fetchTagMap = async () => {
      try {
        const res = await getTag();
        const settings = res?.settings ?? res;
        const apiTags = settings?.tags || [];

        const newTagMap = (Array.isArray(apiTags) ? apiTags : []).reduce((map, tag) => {
          if (tag?.key && tag?.value) {
            map[tag.key] = tag.value;
          }
          return map;
        }, {} as Record<string, string>);

        setTagMap(newTagMap);
      } catch (error) {
        console.error('태그 맵 정보를 가져오는 데 실패했습니다:', error);
      }
    };
    fetchTagMap();
  }, []);

  const goToMapTab = () => {
    const parent = navigation.getParent?.();
    if (parent) parent.navigate('Map');
    else navigation.navigate('Map');
  };

  const handlePlantSeed = async () => {
    if (!savedSeed || !savedRestaurant) return;

    let uploadedUrls: string[] = [];
    if (savedPhotos.length > 0) {
      uploadedUrls = await handleUpload(savedPhotos);
    }
    try {
      await postTree(
        savedSeed.seedId,
        savedRestaurant.id,
        reviewText,
        savedTags,
        uploadedUrls,
      );
      Alert.alert('성공', '씨앗이 성공적으로 심어졌습니다!');
      dispatch(resetSeedPlanting());
      goToMapTab();
    } catch (error) {
      Alert.alert('실패', '씨앗 심기에 실패했습니다. 다시 시도해주세요.');
      console.error(error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerTitle: '씨앗 심기',
      headerTitleAlign: 'center',
      headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={goToMapTab}
          style={{ marginLeft: 12, padding: 6 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image
            source={backIcon}
            style={{ width: 24, height: 24, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            isConfirmEnabled
              ? handlePlantSeed()
              : Alert.alert('안내', '장소와 씨앗을 모두 선택해주세요.')
          }
          style={{ marginRight: 15 }}>
          <Text
            style={{
              color: isConfirmEnabled ? REQUIRED_GREEN : '#999999',
              fontSize: 18,
              fontWeight: '600',
            }}>
            확인
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isConfirmEnabled, savedRestaurant, savedSeed, reviewText, savedTags]);

  const handleAddPhoto = useCallback(() => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 200,
      maxWidth: 200,
      quality: 1,
      selectionLimit: 0,
    };
    ImagePicker.launchImageLibrary(options, res => {
      if (res.didCancel || res.errorCode) return;
      res.assets?.map(a => a.uri).filter(Boolean)?.forEach(uri => dispatch(addPhoto(uri as string)));
    });
  }, [dispatch]);

  const handleUpload = async (photosToUpload: string[]): Promise<string[]> => {
    if (isUploading) return [];
    setIsUploading(true);
    try {
      const result = await postImageReview(photosToUpload);
      const urls = result?.map((item: { url: string }) => item.url) ?? [];
      return urls;
    } catch (error) {
      console.error('업로드 실패:', error);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 24 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 장소 검색 */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>장소 검색</Text>
              {!savedRestaurant && <Text style={styles.required}>* 필수 입력</Text>}
            </View>

            <TouchableOpacity
              style={styles.selectField}
              onPress={() => navigation.navigate('PlantSearch')}
            >
              <Text style={savedRestaurant ? styles.selectFieldText : styles.selectFieldPlaceholder}>
                {savedRestaurant ? savedRestaurant.name : '씨앗을 심을 장소를 검색해보세요.'}
              </Text>
              <SearchIcon width={24} height={24} color="#505050" />
            </TouchableOpacity>
          </View>

          {/* 씨앗 고르기 */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>씨앗 고르기</Text>
              {!savedSeed && <Text style={styles.required}>* 필수 입력</Text>}
            </View>

            <TouchableOpacity
              style={styles.selectField}
              onPress={() => navigation.navigate('PlantSelection')}
            >
              <Text style={savedSeed ? styles.selectFieldText : styles.selectFieldPlaceholder}>
                {savedSeed ? savedSeed.name : '심을 씨앗의 종류를 골라봐요.'}
              </Text>
              <ArrowRightIcon width={24} height={24} color="#505050" />
            </TouchableOpacity>
          </View>

          {/* 태그 달기 (선택) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>태그 달기</Text>
            </View>

            <View style={styles.tagContainer}>
              {savedTags.map((tagKey, idx) => (
                <View key={`${tagKey}-${idx}`} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tagMap[tagKey] || tagKey}</Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => navigation.navigate('TagSelection')}
                accessibilityLabel="태그 추가"
                activeOpacity={0.8}
                style={styles.addTagSpacer}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Image source={plusPng} style={{ width: 34, height: 34, resizeMode: 'contain' }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 구분선 */}
          <View style={{ height: 1, backgroundColor: '#EFECEC', marginVertical: 10 }} />

          {/* 사진 (선택) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>사진</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageScrollContainer}>
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <CameraIcon width={40} height={40} color="#B0B0B0" />
                <Text style={styles.addPhotoText}>사진 추가</Text>
              </TouchableOpacity>
              {savedPhotos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.addedImage} />
              ))}
            </ScrollView>
          </View>

          {/* 한줄평 (선택) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>한줄평</Text>
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="한줄평을 적을 수 있어요."
              placeholderTextColor="#888"
              multiline
              maxLength={80}
              value={reviewText}
              onChangeText={(t: string) => dispatch(setReviewText(t))}
            />
            <Text style={styles.charCount}>
              <Text style={styles.charCountHighlight}>{reviewText.length}</Text>
              {' / 80'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexGrow: 1,
  },

  section: { marginBottom: 20 },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '400', color: '#111111' },
  required: { fontSize: 12, color: '#008F47', fontWeight: '400' },

  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F6F8',
    borderRadius: 1,
    paddingHorizontal: 15,
    height: 50,
  },
  selectFieldText: { fontSize: 15, color: '#333' },
  selectFieldPlaceholder: { fontSize: 15, color: '#888' },

  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  tagBadge: {
    backgroundColor: '#6CDF44',
    paddingVertical: 10,
    paddingHorizontal: 19,
    borderRadius: 20,
    marginRight: 1,
    marginBottom: 2,
  },
  tagText: { color: '#111', fontSize: 14, fontWeight: '400' },
  addTagSpacer: { marginRight: 4, marginBottom: 14, },

  imageScrollContainer: { flexDirection: 'row', alignItems: 'center' },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: '#F6F6F8',
    marginRight: 10,
    borderRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addPhotoText: { fontSize: 12, color: '#B0B0B0', marginTop: 5 },
  addedImage: { width: 100, height: 100, borderRadius: 1, marginRight: 10, flexShrink: 0 },

  reviewInput: {
    backgroundColor: '#F6F6F8',
    borderRadius: 1,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    fontWeight: '400',
    color: '#111111',
  },
  charCount: { fontSize: 12, color: '#868686', textAlign: 'right', marginTop: 5 },
  
  charCountHighlight: {
    color: '#008F47',
    fontWeight: '600',
  },
});

export default PlantScreen;