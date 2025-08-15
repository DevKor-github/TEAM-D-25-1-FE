// src/screens/Planting/PlantScreen.tsx
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

// 커스텀 백 버튼 & 플러스 아이콘
const backIcon = require('../../assets/arrow.png');
const plusPng = require('../../assets/plus_icon.png');

const PlantScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();

  const {
    savedRestaurant,
    savedSeed,
    savedTags,
    savedPhotos,
    reviewText,
  } = useSelector((state: RootState) => state.seedPlanting);

  const [isModalVisible, setModalVisible] = useState(false);

  const isConfirmEnabled = savedRestaurant !== null && savedSeed !== null;

  const goToMapTab = () => {
    const parent = navigation.getParent?.();
    if (parent) parent.navigate('Map');
    else navigation.navigate('Map');
  };

  const handlePlantSeed = async () => {
    if (!savedSeed || !savedRestaurant) return;
    try {
      await postTree(
        savedSeed.seedId,
        savedRestaurant.id,
        reviewText,
        reviewText,
        savedTags,
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
          <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => (isConfirmEnabled ? handlePlantSeed() : Alert.alert('안내', '장소와 씨앗을 모두 선택해주세요.'))}
          style={{ marginRight: 15 }}>
          <Text style={{ color: isConfirmEnabled ? '#0DBC65' : '#999999', fontSize: 18, fontWeight: '600' }}>
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
    ImagePicker.launchImageLibrary(options, (res) => {
      if (res.didCancel || res.errorCode) return;
      res.assets?.map(a => a.uri).filter(Boolean)?.forEach(uri => dispatch(addPhoto(uri as string)));
    });
  }, [dispatch]);

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: 'white' }} showsVerticalScrollIndicator={false}>
      {/* 장소 검색 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>장소 검색</Text>
        <TouchableOpacity style={styles.selectField} onPress={() => navigation.navigate('PlantSearch')}>
          <Text style={savedRestaurant ? styles.selectFieldText : styles.selectFieldPlaceholder}>
            {savedRestaurant ? savedRestaurant.name : '씨앗을 심을 장소를 검색해보세요.'}
          </Text>
          <SearchIcon width={24} height={24} color="#505050" />
        </TouchableOpacity>
      </View>

      {/* 씨앗 고르기 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>씨앗 고르기</Text>
        <TouchableOpacity style={styles.selectField} onPress={() => navigation.navigate('PlantSelection')}>
          <Text style={savedSeed ? styles.selectFieldText : styles.selectFieldPlaceholder}>
            {savedSeed ? savedSeed.name : '심을 씨앗의 종류를 골라봐요.'}
          </Text>
          <ArrowRightIcon width={24} height={24} color="#505050" />
        </TouchableOpacity>
      </View>

      {/* 태그 달기 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>태그 달기</Text>
        <View style={styles.tagContainer}>
          {savedTags.map((tag, idx) => (
            <View key={`${tag}-${idx}`} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {/* PNG 그대로 사용: 배경/원형 래퍼 없음 */}
          <TouchableOpacity
            onPress={() => navigation.navigate('TagSelection')}
            accessibilityLabel="태그 추가"
            activeOpacity={0.8}
            style={styles.addTagSpacer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image source={plusPng} style={{ width: 35, height: 35, resizeMode: 'contain' }}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* 구분선 */}
      <View style={{ height: 1, backgroundColor: '#ECECEC', marginVertical: 12 }} />

      {/* 사진 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>사진</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScrollContainer}>
          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <CameraIcon width={40} height={40} color="#B0B0B0" />
            <Text style={styles.addPhotoText}>사진 추가</Text>
          </TouchableOpacity>
          {savedPhotos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.addedImage} />
          ))}
        </ScrollView>
      </View>

      {/* 한줄평 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>한줄평</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="한줄평을 적을 수 있어요."
          placeholderTextColor="#888"
          multiline
          maxLength={80}
          value={reviewText}
          onChangeText={(t: string) => dispatch(setReviewText(t))}
        />
        <Text style={styles.charCount}>{reviewText.length} / 80</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '400', color: '#111111', marginBottom: 10 },

  // 선택 필드
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

  // 태그
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  tagBadge: {
    backgroundColor: '#6CDF44',
    paddingVertical: 10,
    paddingHorizontal: 19,
    borderRadius: 20,
    marginRight: 1,
    marginBottom: 10,
  },
  tagText: { color: '#111', fontSize: 14, fontWeight: '500' },

  // PNG 버튼 간격만 확보 (배경/원형 없음)
  addTagSpacer: { marginRight: 4, marginBottom: 8 },

  // 사진
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

  // 한줄평
  reviewInput: {
    backgroundColor: '#F6F6F8',
    borderRadius: 1,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#A0A0A0',
  },
  charCount: { fontSize: 12, color: '#888', textAlign: 'right', marginTop: 5 },
});

export default PlantScreen;
