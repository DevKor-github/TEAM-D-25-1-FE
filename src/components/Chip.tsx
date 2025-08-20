import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

type Variant = 'default' | 'mbti' | 'style' | 'food';

type Props = {
  label: string;
  variant?: Variant;
  selected?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;      // ✅ StyleProp로
  textStyle?: StyleProp<TextStyle>;  // ✅ StyleProp로
  disabled?: boolean;
  testID?: string;
};

function Chip({
  label,
  variant = 'default',
  selected = true,
  onPress,
  style,
  textStyle,
  disabled = false,
  testID,
}: Props) {
  const base = [styles.chip];
  const textBase = [styles.chipText];

  if (variant === 'mbti') { base.push(styles.mbtiChip); textBase.push(styles.mbtiText); }
  else if (variant === 'style') { base.push(styles.styleChip); textBase.push(styles.styleText); }
  else if (variant === 'food') { base.push(styles.foodChip); textBase.push(styles.foodText); }

  if (!selected) { base.push(styles.unselected); textBase.push(styles.unselectedText); }
  if (disabled) base.push(styles.disabled);      // ✅ 분리

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[...base, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}  // ✅ 터치 영역
      testID={testID}
    >
      <Text style={[...textBase, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default React.memo(Chip); // ✅ 선택

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 17,
    paddingVertical: 9.5,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#B9B9B9',
    margin: 4,
    backgroundColor: '#FFF',
  },
  chipText: { fontSize: 14, color: '#333' },

  mbtiChip: { backgroundColor: '#6CDF44', borderColor: '#6CDF44' },
  mbtiText: { color: '#111' },

  styleChip: { backgroundColor: '#474747', borderColor: '#474747' },
  styleText: { color: '#FFF' },

  foodChip: { backgroundColor: '#FFF', borderColor: '#000',  },
  foodText: { color: '#000' },

  unselected: { backgroundColor: '#FFF', borderColor: '#B9B9B9' },
  unselectedText: { color: '#333' },

  disabled: { opacity: 0.5 },
});
