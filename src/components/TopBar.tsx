import React, { useEffect, useState } from 'react';
import {
  View, TouchableOpacity, StyleSheet, Image, ViewStyle, Text, TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TopBarProps = {
  onPressBack: () => void;
  onPressBookmark?: () => void;
  bookmarked?: boolean;
  style?: ViewStyle;
  iconSize?: number;
  toastPlaceholder?: React.ReactNode;
  bookmarkDisabled?: boolean;
  title?: string;
  titleStyle?: TextStyle;

  /** 아이콘별 틴트 색 (null/undefined면 틴트 적용 안 함) */
  backTintColor?: string | null;       // 기본값: '#fff' (뒤로가기 흰색 유지)
  bookmarkTintColor?: string | null;   // 기본값: undefined (원본색 유지)
};

const backIcon = require('../assets/chevron-left.png');
const bookmarkOutline = require('../assets/bookmark.png');
const bookmarkFilled = require('../assets/bookmarked.png');

export default function TopBar({
  onPressBack,
  onPressBookmark,
  bookmarked,
  style,
  iconSize = 28,
  toastPlaceholder,
  bookmarkDisabled = false,
  title,
  titleStyle,

  backTintColor = '#fff',           // ← 뒤로가기 기본 흰색
  bookmarkTintColor = undefined,    // ← 북마크는 기본 원본색
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const [internalBookmarked, setInternalBookmarked] = useState<boolean>(!!bookmarked);

  useEffect(() => {
    if (typeof bookmarked === 'boolean') setInternalBookmarked(bookmarked);
  }, [bookmarked]);

  const isBookmarked = internalBookmarked;

  const handlePressBookmark = () => {
    if (bookmarkDisabled) return;
    if (typeof bookmarked !== 'boolean') setInternalBookmarked(prev => !prev);
    onPressBookmark?.();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]} pointerEvents="box-none">
      <View style={styles.inner}>
        {/* 왼쪽: 뒤로가기 */}
        <TouchableOpacity
          accessibilityLabel="뒤로가기"
          onPress={onPressBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.touch}
        >
          <Image
            source={backIcon}
            style={[
              { width: iconSize, height: iconSize, resizeMode: 'contain' },
              backTintColor != null && { tintColor: backTintColor }, // ← 필요할 때만 틴트
            ]}
          />
        </TouchableOpacity>

        {/* 가운데 제목 */}
        {Boolean(title) && (
          <View pointerEvents="none" style={styles.centerTitleWrap}>
            <Text style={[styles.centerTitle, titleStyle]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* 오른쪽: 북마크 */}
        <TouchableOpacity
          accessibilityLabel="북마크"
          accessibilityState={{ selected: isBookmarked }}
          onPress={handlePressBookmark}
          disabled={bookmarkDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[styles.touch, bookmarkDisabled && { opacity: 0.7 }]}
          activeOpacity={0.8}
        >
          <Image
            source={isBookmarked ? bookmarkFilled : bookmarkOutline}
            style={[
              { width: iconSize, height: iconSize, resizeMode: 'contain' },
              bookmarkTintColor != null && { tintColor: bookmarkTintColor }, // ← 기본적으로 적용 안 함
            ]}
          />
        </TouchableOpacity>
      </View>

      {toastPlaceholder && <View style={styles.toastWrapper}>{toastPlaceholder}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 50,
    backgroundColor: 'transparent',
  },
  inner: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  touch: { padding: 4 },
  centerTitleWrap: {
    position: 'absolute',
    left: 56, right: 56, top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  toastWrapper: {
    position: 'absolute',
    bottom: -8,
    left: 0, right: 0,
    alignItems: 'center',
  },
});
