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

// ▼▼▼ 1. API로부터 받아올 태그 객체의 타입을 명확히 정의합니다. ▼▼▼
type TagObject = {
  key: string;  // 서버와 통신할 영문 Key (예: 'DRINKER')
  label: string; // 화면에 보여줄 한글 Label (예: '애주가')
};

const TagSelectionScreen = ({navigation}: {navigation: any}) => {
  const dispatch = useDispatch();
  const {savedTags} = useSelector((state: RootState) => state.seedPlanting);

  // ▼▼▼ 2. displayTags state가 이제 TagObject의 배열을 저장합니다. ▼▼▼
  const [displayTags, setDisplayTags] = useState<TagObject[]>([]);
  // selectedTags는 서버로 보낼 영문 key(string)의 배열이므로 그대로 둡니다.
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getTag();
        if (!mounted) return;
        
        const settings = res?.settings ?? res;
        const apiTagsArray = settings?.tags;

        // API 응답을 {key, label} 형태의 객체 배열로 정규화합니다.
        const normalizeApiTags = (arr: any[]): TagObject[] =>
          (Array.isArray(arr) ? arr : [])
            .map((tag: any) => {
              // API 응답의 key와 value를 우리 앱의 key와 label에 매핑합니다.
              if (tag?.key && tag?.value) {
                return { key: tag.key, label: tag.value };
              }
              return null;
            })
            .filter((item): item is TagObject => !!item); // null인 항목은 제거합니다.
        
        const tagObjectsFromApi = normalizeApiTags(apiTagsArray);

        if (tagObjectsFromApi.length > 0) {
          setDisplayTags(tagObjectsFromApi);
        }
      } catch (e) {
        console.log('[TagSelection] getTag error:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setSelectedTags(savedTags || []);
  }, [savedTags]);

  const handleSave = () => {
    // selectedTags에는 'DRINKER'와 같은 영문 key들이 저장되어 있습니다.
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

  const toggleTag = (tagKey: string) => {
    setSelectedTags(prev =>
      prev.includes(tagKey) ? prev.filter(t => t !== tagKey) : [...prev, tagKey],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.listcontainer}>
        <Text style={styles.recommendTitle}>추천 태그</Text>

        <ScrollView contentContainerStyle={styles.chipContainer}>
          {/* ▼▼▼ 3. displayTags 배열의 객체를 순회하며 칩을 렌더링합니다. ▼▼▼ */}
          {displayTags.map(tag => { // 이제 tag는 {key: '...', label: '...'} 형태의 객체입니다.
            const isSelected = selectedTags.includes(tag.key);
            return (
              <TouchableOpacity
                key={tag.key} // key prop에는 영문 key를 사용
                onPress={() => toggleTag(tag.key)} // 선택 시에도 영문 key를 전달
                style={[styles.chip, isSelected && styles.chipSelected]}>
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}>
                  {tag.label} {/* 화면에는 한글 label을 표시 */}
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
  chipText: { fontSize: 15, color: '#111111', fontWeight: '400' },
  chipSelected: {
    backgroundColor: '#6CDF44',
    borderColor: '#6CDF44',
  },
  chipTextSelected: {
    color: '#111',
    fontWeight: '400',
  },
});