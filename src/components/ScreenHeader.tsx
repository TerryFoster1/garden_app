import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, typography } from "../theme/tokens";

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onBack?: () => void;
};

export function ScreenHeader({ eyebrow, title, subtitle, action, onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color={colors.leafDeep} />
          </TouchableOpacity>
        ) : null}
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {action}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 38
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm
  },
  eyebrow: {
    color: colors.leaf,
    fontSize: typography.small,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 32
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 23
  }
});

