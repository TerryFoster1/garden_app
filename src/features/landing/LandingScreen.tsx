import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, spacing, typography } from "../../theme/tokens";

type LandingScreenProps = {
  onEnter: () => void;
  onLearnMore: () => void;
};

export function LandingScreen({ onEnter, onLearnMore }: LandingScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.skyGlow} />
      <View style={styles.vineLeft}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={index} style={[styles.leaf, { top: 44 + index * 58, left: index % 2 === 0 ? 4 : 28 }]} />
        ))}
      </View>
      <View style={styles.bed}>
        <View style={styles.tomato} />
        <View style={[styles.tomato, styles.tomatoSmall]} />
        <View style={styles.squash} />
        <View style={styles.pattypan} />
      </View>

      <View style={styles.brand}>
        <View style={styles.mark}>
          <Ionicons name="leaf" size={48} color={colors.sage} />
        </View>
        <Text style={styles.name}>Pattypan</Text>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Ionicons name="leaf-outline" size={20} color={colors.sage} />
          <View style={styles.divider} />
        </View>
        <Text style={styles.tagline}>Your Heirloom Secret</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity accessibilityRole="button" style={styles.signUpButton} onPress={onEnter}>
          <Ionicons name="leaf" size={22} color={colors.sage} />
          <Text style={styles.signUpText}>Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.signInButton} onPress={onEnter}>
          <Ionicons name="leaf-outline" size={24} color={colors.leafDeep} />
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.learnButton} onPress={onLearnMore}>
          <Text style={styles.learnText}>Learn more</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#132719",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 96,
    paddingBottom: 46,
    overflow: "hidden"
  },
  skyGlow: {
    position: "absolute",
    right: -80,
    top: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(244,200,95,0.38)"
  },
  vineLeft: {
    position: "absolute",
    left: 0,
    top: 110,
    width: 86,
    height: 520
  },
  leaf: {
    position: "absolute",
    width: 44,
    height: 26,
    borderRadius: 22,
    backgroundColor: "rgba(155,191,152,0.76)",
    transform: [{ rotate: "-24deg" }]
  },
  bed: {
    position: "absolute",
    left: -40,
    right: -40,
    bottom: 0,
    height: 330,
    backgroundColor: "#533e2f",
    borderTopLeftRadius: 72,
    borderTopRightRadius: 72,
    opacity: 0.92
  },
  tomato: {
    position: "absolute",
    right: 72,
    bottom: 168,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#b94b32"
  },
  tomatoSmall: {
    right: 34,
    bottom: 138,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#d96d5b"
  },
  squash: {
    position: "absolute",
    left: 72,
    bottom: 152,
    width: 86,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.sun
  },
  pattypan: {
    position: "absolute",
    left: 150,
    bottom: 126,
    width: 116,
    height: 82,
    borderRadius: 42,
    backgroundColor: colors.surfaceWarm
  },
  brand: {
    alignItems: "center",
    gap: spacing.sm
  },
  mark: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,253,248,0.14)"
  },
  name: {
    color: colors.surface,
    fontSize: 58,
    fontWeight: "800",
    letterSpacing: 0
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  divider: {
    width: 78,
    height: 1,
    backgroundColor: colors.sage
  },
  tagline: {
    color: colors.sage,
    fontSize: typography.title,
    fontWeight: "800"
  },
  actions: {
    gap: spacing.md
  },
  signUpButton: {
    minHeight: 76,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md
  },
  signUpText: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "900"
  },
  signInButton: {
    minHeight: 76,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md
  },
  signInText: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  learnButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  learnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "900"
  }
});
