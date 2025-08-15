import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Image,
} from 'react-native';

export default function KeywordSelectionScreen({ navigation, route }: any) {
  const { mbti: prevMBTI, styles: prevStyles, foods: prevFoods } = route.params || {};

  const MBTIs = ['ESTJ','INFP','ISFP','INTJ','INFJ','ENTP','ISTJ','ESTP','ENTJ', 'ENFJ','ESFP','ISFJ'];
  const FoodStyles = ['애주가','비건/채식','맵부심','편식쟁이','혈당 스파이크','건강식','가성비','육식러','길거리 음식','맵찔이','소식좌','대식가'];
  const FavoriteFoods = ['떡볶이','스테이크','빵','햄버거','곱창','디저트','라면','파스타','삼겹살','소주','초밥','국밥','피자','회'];

  const [selectedMBTI, setSelectedMBTI] = useState<string | null>(prevMBTI || null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(prevStyles || []);
  const [selectedFoods, setSelectedFoods] = useState<string[]>(prevFoods || []);

  const toggleSelect = (item: string, selected: string[] | string | null, setSelected: (v: any) => void, limit: number) => {
    if (Array.isArray(selected)) {
      if (selected.includes(item)) setSelected(selected.filter(x => x !== item));
      else if (selected.length < limit) setSelected([...selected, item]);
    } else {
      setSelected(item === selected ? null : item);
    }
  };

  // ✅ 확인: ProfileEdit에서 넘긴 onApply 콜백을 호출하고 뒤로가기
  const onConfirm = () => {
    const next = { mbti: selectedMBTI, styles: selectedStyles, foods: selectedFoods };

    if (route.params?.onApply) {
      try { route.params.onApply(next); } catch {}
    }
    navigation.goBack(); // 기존 ProfileEdit로 복귀 (onSave 유지)
  };

  const CHIP_TOTAL_WIDTH = 50;

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
        <Image
          source={require('../../assets/selection_ex.png')}
          style={styles.exampleImage}
        />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {/* MBTI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 MBTI는…😎</Text>
          <Text style={styles.sectionHint}>*최대 1개 선택</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.chipContainer, { height: 80, width: MBTIs.length * CHIP_TOTAL_WIDTH }]}>
            {MBTIs.map(item => {
              const isSelected = item === selectedMBTI;
              const disabled = selectedMBTI !== null && !isSelected;
              return (
                <TouchableOpacity
                  key={item}
                  disabled={disabled}
                  onPress={() => toggleSelect(item, selectedMBTI, setSelectedMBTI, 1)}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelectedMBTI,
                    disabled && styles.chipDisabled,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelectedMBTI,
                    disabled && styles.chipTextDisabled,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Food Styles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 미식 스타일은…🍽️</Text>
          <Text style={styles.sectionHint}>*최대 3개 선택</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.chipContainer, { height: 120, width: FoodStyles.length * CHIP_TOTAL_WIDTH }]}>
            {FoodStyles.map(item => {
              const isSelected = selectedStyles.includes(item);
              const disabled = !isSelected && selectedStyles.length >= 3;
              return (
                <TouchableOpacity
                  key={item}
                  disabled={disabled}
                  onPress={() => toggleSelect(item, selectedStyles, setSelectedStyles, 3)}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelectedStyle,
                    disabled && styles.chipDisabled,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelectedStyle,
                    disabled && styles.chipTextDisabled,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Favorite Foods */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>내 최애 음식은…🍕</Text>
          <Text style={styles.sectionHint}>*최대 3개 선택</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.chipContainer, { height: 120, width: FavoriteFoods.length * CHIP_TOTAL_WIDTH }]}>
            {FavoriteFoods.map(item => {
              const isSelected = selectedFoods.includes(item);
              const disabled = !isSelected && selectedFoods.length >= 3;
              return (
                <TouchableOpacity
                  key={item}
                  disabled={disabled}
                  onPress={() => toggleSelect(item, selectedFoods, setSelectedFoods, 3)}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelectedFood,
                    disabled && styles.chipDisabled,
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelectedFood,
                    disabled && styles.chipTextDisabled,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerButton: { width: 40, alignItems: 'center' },
  headerBack: { fontSize: 20 },
  headerIcon: { width: 24, height: 24, resizeMode: 'contain' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  headerConfirm: { fontSize: 20, color: '#0DBC65', fontWeight: '600' },
  body: { padding: 16 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '500', marginBottom: 10, marginTop: 5 },
  sectionHint: { fontSize: 12, color: '#008F47', marginLeft: 8 },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#B9B9B9', margin: 4, backgroundColor: '#FFF' },
  chipText: { fontSize: 15, color: '#333' },

  chipSelectedMBTI: { backgroundColor: '#6CDF44', borderColor: '#6CDF44' },
  chipTextSelectedMBTI: { color: '#111' },
  chipSelectedStyle: { backgroundColor: '#474747', borderColor: '#474747' },
  chipTextSelectedStyle: { color: '#FFF' },
  chipSelectedFood: { borderColor: '#000', borderWidth: 1.5, backgroundColor: '#FFF' },
  chipTextSelectedFood: { color: '#000' },

  chipDisabled: { opacity: 0.8 },
  chipTextDisabled: { color: '#B9B9B9' },
  examplewrapper: {alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, paddingVertical: 10, margin:20},
  exampleImage: {
   width: 160,    // 원하는 너비
   height: 100,   // 원하는 높이
   resizeMode: 'contain',
 },
});
