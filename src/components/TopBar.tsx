// src/components/TopBar.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, ViewStyle, Text, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TopBarProps = {
  onPressBack: () => void;
  style?: ViewStyle;
  iconSize?: number;
  toastPlaceholder?: React.ReactNode;
  title?: string;
  titleStyle?: TextStyle;
  backTintColor?: string | null;
  rightText?: string;
  onPressRight?: () => void;
  rightTextStyle?: TextStyle;
};

const backIcon = require('../assets/chevron-left.png');

export default function TopBar({
  onPressBack,
  style,
  iconSize = 28,
  toastPlaceholder,
  title,
  titleStyle,
  backTintColor = '#fff',
  rightText,
  onPressRight,
  rightTextStyle,
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]} pointerEvents="box-none">
      <View style={styles.inner}>
        {/* 왼쪽: 뒤로가기 */}
        <TouchableOpacity accessibilityLabel="뒤로가기" onPress={onPressBack} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} style={styles.touch}>
          <Image
            source={backIcon}
            style={[{ width: iconSize, height: iconSize, resizeMode: 'contain' }, backTintColor != null && { tintColor: backTintColor }]}
          />
        </TouchableOpacity>

        {/* 가운데 제목 */}
        {Boolean(title) && (
          <View pointerEvents="none" style={styles.centerTitleWrap}>
            <Text style={[styles.centerTitle, titleStyle]} numberOfLines={1}>{title}</Text>
          </View>
        )}

        {/* 오른쪽: 텍스트 버튼 (씨앗심기 등) */}
        {rightText ? (
          <TouchableOpacity onPress={onPressRight} style={styles.rightTouch}>
            <Text style={[styles.rightText, { color: backTintColor ?? '#fff' }, rightTextStyle]}>{rightText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.rightPlaceholder} />
        )}
      </View>

      {toastPlaceholder && <View style={styles.toastWrapper}>{toastPlaceholder}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'transparent' },
  inner: { height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, justifyContent: 'space-between' },
  touch: { padding: 4 },
  centerTitleWrap: { position: 'absolute', left: 56, right: 56, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  centerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  toastWrapper: { position: 'absolute', bottom: -8, left: 0, right: 0, alignItems: 'center' },
  rightTouch: { paddingHorizontal: 8, paddingVertical: 4, minWidth: 28 + 8, alignItems: 'flex-end' },
  rightText: { fontSize: 17, fontWeight: '600' },
  rightPlaceholder: { width: 28 + 8 },
});
