import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTag, patchMyPreference } from '../../apis/api/user';

type OptionKV = { key: string; value: string };

const FALLBACK = {
  MBTIs: ['ESTJ','INFP','ISFP','INTJ','INFJ','ENTP','ISTJ','ESTP','ENTJ','ENFJ','ESFP','ISFJ'],
  FoodStyles: ['애주가','비건/채식','맵부심','편식쟁이','혈당 스파이크','건강식','가성비','육식러','길거리 음식','맵찔이','소식좌','대식가'],
  FavoriteFoods: ['떡볶이','스테이크','빵','햄버거','곱창','디저트','라면','파스타','삼겹살','소주','초밥','국밥','피자','회'],
};

export default function KeywordSelectionScreen({ navigation, route }: any) {
  const { mbti: prevMBTI, styles: prevStyles, foods: prevFoods } = route.params || {};

  // 서버 옵션
  const [mbtiOptions, setMbtiOptions] = useState<string[]>(FALLBACK.MBTIs);
  const [styleOptions, setStyleOptions] = useState<OptionKV[]>(
    FALLBACK.FoodStyles.map(v => ({ key: v, value: v }))
  );
  const [foodOptions, setFoodOptions] = useState<OptionKV[]>(
    FALLBACK.FavoriteFoods.map(v => ({ key: v, value: v }))
  );

  // 선택값은 전부 "value" 문자열
  const [selectedMBTI, setSelectedMBTI] = useState<string | null>(prevMBTI ?? null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(Array.isArray(prevStyles) ? prevStyles : []);
  const [selectedFoods, setSelectedFoods] = useState<string[]>(Array.isArray(prevFoods) ? prevFoods : []);

  /** ---------- helpers ---------- */
  const coalesce = (...vals: any[]) => vals.find(v => v !== undefined && v !== null);

  // 옵션 표준화: 항상 { key, value }로 만들기
  const normalizeOptions = (src: any): OptionKV[] => {
    if (!src) return [];
    if (Array.isArray(src)) {
      return src.map((it: any) => {
        if (typeof it === 'string') return { key: it, value: it };
        const value = coalesce(it?.value, it?.label, it?.name, it?.title, it?.text);
        const key   = String(coalesce(it?.key, it?.code, it?.id, value));
        return value ? { key, value: String(value) } : null;
      }).filter(Boolean) as OptionKV[];
    }
    if (typeof src === 'object') {
      return Object.entries(src).map(([k, v]) => {
        const value = typeof v === 'string' ? v : coalesce((v as any)?.value, (v as any)?.label, k);
        return { key: String(k), value: String(value) };
      });
    }
    return [];
  };

  const normalizeMBTIs = (src: any): string[] => {
    if (!src) return [];
    if (Array.isArray(src)) {
      return src.map(m => (typeof m === 'string' ? m : coalesce(m?.value, m?.label, m?.name)))
               .filter(Boolean);
    }
    return [];
  };

  /** ---------- /settings 로드 ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getTag();
        const s = res?.settings ?? res;

        const styleSrc = coalesce(s?.styleTags, s?.styletags, s?.style_tags, s?.styles);
        const foodSrc  = coalesce(s?.foodTags,  s?.foodtags,  s?.food_tags,  s?.foods);
        const mbtiSrc  = coalesce(s?.mbti, s?.MBTI, s?.Mbti);

        const mbtis = normalizeMBTIs(mbtiSrc);
        const styleKVs = normalizeOptions(styleSrc);
        const foodKVs  = normalizeOptions(foodSrc);

        if (mbtis.length) setMbtiOptions(mbtis);
        if (styleKVs.length) setStyleOptions(styleKVs);
        if (foodKVs.length)  setFoodOptions(foodKVs);

        // ✅ 옵션과 교차검증(유효한 value만 유지)
        setSelectedMBTI(prev => (prev && mbtis.includes(prev) ? prev : null));
        setSelectedStyles(prev => Array.isArray(prev) ? prev.filter(v => styleKVs.some(o => o.value === v)) : []);
        setSelectedFoods(prev => Array.isArray(prev) ? prev.filter(v => foodKVs.some(o => o.value === v)) : []);
      } catch {}
    })();
  }, [route?.params]);

  useFocusEffect(useCallback(() => { return () => {}; }, []));

  const toggleSelect = (
    itemValue: string,
    selected: string[] | string | null,
    setSelected: (v: any) => void,
    limit: number
  ) => {
    if (Array.isArray(selected)) {
      // 배열(스타일/음식) — value 기준 토글
      if (selected.includes(itemValue)) setSelected(selected.filter(x => x !== itemValue));
      else if (selected.length < limit) setSelected([...selected, itemValue]);
    } else {
      // 단일(MBTI) — value 기준 단일선택
      setSelected(itemValue === selected ? null : itemValue);
    }
  };

  // 저장 시 서버에는 key를 보낸다
  const styleKeysToSave = useMemo(
    () => selectedStyles.map(v => styleOptions.find(o => o.value === v)?.key).filter(Boolean) as string[],
    [selectedStyles, styleOptions]
  );
  const foodKeysToSave = useMemo(
    () => selectedFoods.map(v => foodOptions.find(o => o.value === v)?.key).filter(Boolean) as string[],
    [selectedFoods, foodOptions]
  );

  const onConfirm = async () => {
    const payload = {
      mbti: selectedMBTI,                       // MBTI는 value가 그대로 저장되는 API라면 그대로 사용
      tags: Array.from(new Set([...styleKeysToSave, ...foodKeysToSave])), // key 묶음
    };
    try {
      await patchMyPreference(payload);
      route.params?.onApply?.({ mbti: selectedMBTI, styles: selectedStyles, foods: selectedFoods });
      navigation.goBack();
    } catch {}
  };

  // 칩에 표시할 값은 전부 "value"
  const styleValues = styleOptions.map(o => o.value);
  const foodValues  = foodOptions.map(o => o.value);

  const splitToRows = (labels: string[], rows: number): string[][] => {
    const result = Array.from({ length: rows }, () => [] as string[]);
    labels.forEach((label, i) => result[i % rows].push(label));
    return result;
  };

  const RowChips = ({
    labels, selected, setSelected, limit,
    variant,
  }: {
    labels: string[];
    selected: string[] | string | null;
    setSelected: (v: any) => void;
    limit: number;
    variant: 'mbti' | 'style' | 'food';
  }) => {
    const isArraySel = Array.isArray(selected);
    const selectedChipStyle =
      variant === 'mbti' ? styles.chipSelectedMBTI :
      variant === 'style' ? styles.chipSelectedStyle : styles.chipSelectedFood;
    const selectedTextStyle =
      variant === 'mbti' ? styles.chipTextSelectedMBTI :
      variant === 'style' ? styles.chipTextSelectedStyle : styles.chipTextSelectedFood;

    return (
      <View style={styles.rowContent}>
        {labels.map((value) => {
          const isSelected = isArraySel ? (selected as string[]).includes(value) : selected === value;
          const disabled =
            variant !== 'mbti'
              ? !isSelected && isArraySel && (selected as string[]).length >= limit
              : selected !== null && !isSelected;

          return (
            <TouchableOpacity
              key={value}
              disabled={disabled}
              onPress={() => toggleSelect(value, selected, setSelected, limit)}
              style={[styles.chip, isSelected && selectedChipStyle, disabled && styles.chipDisabled]}
            >
              <Text style={[styles.chipText, isSelected && selectedTextStyle, disabled && styles.chipTextDisabled]}>
                {value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderSection = (
    title: string,
    hint: string,
    values: string[],
    rows: number,
    selected: string[] | string | null,
    setSelected: (v: any) => void,
    limit: number,
    variant: 'mbti' | 'style' | 'food'
  ) => {
    const rowsData = splitToRows(values, rows);
    return (
      <>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionHint}>{hint}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {rowsData.map((row, idx) => (
              <RowChips
                key={`${variant}-row-${idx}`}
                labels={row}
                selected={selected}
                setSelected={setSelected}
                limit={limit}
                variant={variant}
              />
            ))}
          </View>
        </ScrollView>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Image source={require('../../assets/arrow.png')} style={styles.headerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 키워드 등록</Text>
        <TouchableOpacity onPress={onConfirm} style={styles.headerButton}>
          <Text style={styles.headerConfirm}>확인</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.examplewrapper}>
        <Image source={require('../../assets/selection_ex.png')} style={styles.exampleImage} />
      </View>

      <View className="promoContainer" style={styles.promoContainer}>
        <Text style={styles.promoText}>내 취향을 등록해서 친구를 추천 받아보세요!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {renderSection('내 MBTI는…😎', '*최대 1개 선택', mbtiOptions, 2, selectedMBTI, setSelectedMBTI, 1, 'mbti')}
        {renderSection('내 미식 스타일은…🍽️', '*최대 3개 선택', styleValues, 3, selectedStyles, setSelectedStyles, 3, 'style')}
        {renderSection('내 최애 음식은…🍕', '*최대 3개 선택', foodValues, 3, selectedFoods, setSelectedFoods, 3, 'food')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerButton: { width: 40, alignItems: 'center' },
  headerIcon: { width: 24, height: 24, resizeMode: 'contain' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  headerConfirm: { fontSize: 20, color: '#0DBC65', fontWeight: '600' },

  body: { paddingHorizontal: 20, paddingBottom: 24 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '500' },
  sectionHint: { fontSize: 12, color: '#008F47' },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#B9B9B9',
    backgroundColor: '#FFF',
    marginRight: 5,
  },
  chipText: { fontSize: 15, color: '#333' },

  chipSelectedMBTI: { backgroundColor: '#6CDF44', borderColor: '#6CDF44' },
  chipTextSelectedMBTI: { color: '#111' },
  chipSelectedStyle: { backgroundColor: '#474747', borderColor: '#474747' },
  chipTextSelectedStyle: { color: '#FFF' },
  chipSelectedFood: { borderColor: '#000', borderWidth: 1.5, backgroundColor: '#FFF' },
  chipTextSelectedFood: { color: '#000' },

  chipDisabled: { opacity: 0.8 },
  chipTextDisabled: { color: '#B9B9B9' },

  rowContent: {
    paddingHorizontal: 0,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  examplewrapper: { alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, paddingVertical: 10, margin: 20 },
  exampleImage: { width: 160, height: 100, resizeMode: 'contain' },

  promoContainer: { alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15 },
  promoText: { fontSize: 14, color: '#505050', fontWeight: '400', textAlign: 'center' },
});
