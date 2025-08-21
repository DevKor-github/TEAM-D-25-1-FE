// src/screens/Planting/TagSelectionScreen.tsx
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setSavedTags} from '../../redux/seedPlantingSlice';
import {RootState} from '../../types/types';

import { getTag } from '../../apis/api/user';

const backIcon = require('../../assets/arrow.png');

// API 호출 실패 시를 대비한 기본(Fallback) 태그 목록 (이제 사용되지 않지만 비상용으로 둘 수 있습니다)
const fallbackTags = [
  'DRINKER', 'VEGAN_OR_VEGETARIAN', 'SPICY_FOOD_LOVER', 'PICKY_EATER', 'DESSERT_LOVER', 'DIETER', 'LATE_NIGHT_EATER', 'SWEET_TOOTH', 'HEALTH_CONSCIOUS', 'VALUE_SEEKER', 'MEAT_LOVER', 'DIET_PLANNER', 'CLASSIC_TASTE', 'STREET_FOOD_FAN', 'TTEOKBOKKI_LOVER', 'SMALL_EATER', 'BIG_EATER', 'SOLO_DINER', 'SEAFOOD_LOVER', 'HEARTY_EATER',
];

// API 응답의 key와 한글 라벨을 매핑하는 객체는 그대로 사용합니다.
const FOOD_TAG_KOREAN_MAP: {[key: string]: string} = {
  DRINKER: '애주가', VEGAN_OR_VEGETARIAN: '비건/채식', SPICY_FOOD_LOVER: '맵부심', PICKY_EATER: '편식쟁이', DESSERT_LOVER: '디저트 러버', DIETER: '다이어터', LATE_NIGHT_EATER: '야식', SWEET_TOOTH: '혈당 스파이크', HEALTH_CONSCIOUS: '건강식', VALUE_SEEKER: '가성비', MEAT_LOVER: '육식파', DIET_PLANNER: '식단', CLASSIC_TASTE: '클래식', STREET_FOOD_FAN: '길거리 음식', TTEOKBOKKI_LOVER: '떡볶이', SMALL_EATER: '소식좌', BIG_EATER: '대식가', SOLO_DINER: '혼밥러', SEAFOOD_LOVER: '해산물파', HEARTY_EATER: '든든파',
};

const TagSelectionScreen = ({navigation}: {navigation: any}) => {
  const dispatch = useDispatch();
  const {savedTags} = useSelector((state: RootState) => state.seedPlanting);

  // 화면에 표시할 태그 목록을 state로 관리합니다. 초기값은 빈 배열로 설정합니다.
  const [displayTags, setDisplayTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 진입 시 /settings를 호출하여 태그 목록을 구성
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getTag();
        if (!mounted) return;
        
        const settings = res?.settings ?? res;

        // ▼▼▼ 1. API 응답에서 `tags` 배열을 직접 가져옵니다. ▼▼▼
        const apiTagsArray = settings?.tags;

        // ▼▼▼ 2. `tags` 배열의 각 객체에서 'value' 속성만 추출합니다. ▼▼▼
        const getTagValues = (arr: any[]) =>
          (Array.isArray(arr) ? arr : [])
            .map((tag: any) => tag?.value) // 'value' 속성을 추출
            .filter(Boolean);             // 유효하지 않은 값(null, undefined 등) 제거
        
        const tagValuesFromApi = getTagValues(apiTagsArray);

        // ▼▼▼ 3. 추출한 value 목록으로 화면에 표시할 태그 state를 업데이트합니다. ▼▼▼
        if (tagValuesFromApi.length > 0) {
          setDisplayTags(tagValuesFromApi);
        } else {
          // API가 실패하거나 tags 배열이 비어있을 경우 fallback 데이터 사용
          setDisplayTags(fallbackTags);
        }
        
      } catch (e) {
        console.log('[TagSelection] getTag error:', e);
        // 에러 발생 시 fallback 데이터 사용
        setDisplayTags(fallbackTags);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setSelectedTags(savedTags || []);
  }, [savedTags]);

  const handleSave = () => {
    dispatch(setSavedTags(selectedTags));
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerTitle: '태그 선택',
      headerTitleAlign: 'center',
      headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 12, padding: 6 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ paddingRight: 20 }}>
          <Text style={{ color: '#0DBC65', fontSize: 18, fontWeight: '600' }}>확인</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.listcontainer}>
        <Text style={styles.recommendTitle}>추천 태그</Text>

        <ScrollView contentContainerStyle={styles.chipContainer}>
          {/* API로부터 받아온 displayTags를 사용해 칩을 렌더링 */}
          {displayTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.chip, isSelected && styles.chipSelected]}>
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}>
                  {/* tag(예: 'DRINKER')에 해당하는 한글 이름을 MAP에서 찾아 표시 */}
                  {FOOD_TAG_KOREAN_MAP[tag] || tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default TagSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  listcontainer: { flex: 1 },
  recommendTitle: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 4 },
  chip: {
    paddingHorizontal: 17, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: '#B9B9B9', margin: 4, backgroundColor: '#FFF'
  },
  chipText: { fontSize: 15, color: '#111111', fontWeight: '400',},
  chipSelected: {
    backgroundColor: '#6CDF44',
    borderColor: '#6CDF44',
  },
  chipTextSelected: {
    color: '#111',
    fontWeight: '400',
  },
});