import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { signInLocal, signUpLocal, LocalSession } from "../../services/localAuth";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type LandingScreenProps = {
  onAuthenticated: (session: LocalSession, isNewAccount: boolean) => void;
  onLearnMore: () => void;
};

type AuthMode = "landing" | "sign-up" | "sign-in";

export function LandingScreen({ onAuthenticated, onLearnMore }: LandingScreenProps) {
  const [mode, setMode] = useState<AuthMode>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setError("");
    setIsSubmitting(true);
    try {
      const result =
        mode === "sign-up"
          ? await signUpLocal({ email, password, confirmPassword, displayName })
          : await signInLocal({ email, password });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onAuthenticated(result.session, mode === "sign-up");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.skyGlow} />
      <View style={styles.gardenBackdrop}>
        <View style={styles.leafMass} />
        <View style={styles.tomatoCluster} />
        <View style={styles.squash} />
        <View style={styles.flowerOne} />
        <View style={styles.flowerTwo} />
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

      {mode === "landing" ? (
        <View style={styles.actions}>
          <TouchableOpacity accessibilityRole="button" style={styles.signUpButton} onPress={() => setMode("sign-up")}>
            <Ionicons name="leaf" size={22} color={colors.sage} />
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.signInButton} onPress={() => setMode("sign-in")}>
            <Ionicons name="leaf-outline" size={24} color={colors.leafDeep} />
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.learnButton} onPress={onLearnMore}>
            <Text style={styles.learnText}>Learn more</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formCard}>
          <TouchableOpacity accessibilityRole="button" style={styles.backRow} onPress={() => { setMode("landing"); setError(""); }}>
            <Ionicons name="chevron-back" size={18} color={colors.leafDeep} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>{mode === "sign-up" ? "Create local account" : "Sign in locally"}</Text>
          <Text style={styles.formHelp}>Prototype account stored only on this device. Production auth must be server-side before public launch.</Text>
          {mode === "sign-up" ? <AuthInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" icon="person-outline" /> : null}
          <AuthInput value={email} onChangeText={setEmail} placeholder="Email" icon="mail-outline" keyboardType="email-address" />
          <AuthInput value={password} onChangeText={setPassword} placeholder="Password" icon="lock-closed-outline" secureTextEntry />
          {mode === "sign-up" ? <AuthInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" icon="shield-checkmark-outline" secureTextEntry /> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity accessibilityRole="button" style={styles.submitButton} onPress={submit} disabled={isSubmitting}>
            <Text style={styles.submitText}>{isSubmitting ? "Checking..." : mode === "sign-up" ? "Create account" : "Sign in"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function AuthInput({ icon, ...props }: { value: string; onChangeText: (value: string) => void; placeholder: string; icon: keyof typeof Ionicons.glyphMap; secureTextEntry?: boolean; keyboardType?: "email-address" }) {
  return (
    <View style={styles.inputRow}>
      <Ionicons name={icon} size={20} color={colors.leafDeep} />
      <TextInput {...props} autoCapitalize="none" placeholderTextColor={colors.textMuted} style={styles.input} />
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
    paddingTop: 82,
    paddingBottom: 38,
    overflow: "hidden"
  },
  skyGlow: {
    position: "absolute",
    right: -72,
    top: -62,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(244,200,95,0.42)"
  },
  gardenBackdrop: {
    position: "absolute",
    left: -40,
    right: -40,
    bottom: 0,
    height: 380,
    backgroundColor: "#4b3628",
    borderTopLeftRadius: 86,
    borderTopRightRadius: 86
  },
  leafMass: {
    position: "absolute",
    left: 20,
    bottom: 110,
    width: 220,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(79,138,95,0.9)"
  },
  tomatoCluster: {
    position: "absolute",
    right: 70,
    bottom: 150,
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.coral
  },
  squash: {
    position: "absolute",
    left: 130,
    bottom: 92,
    width: 132,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.surfaceWarm
  },
  flowerOne: {
    position: "absolute",
    right: 38,
    bottom: 92,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.sun
  },
  flowerTwo: {
    position: "absolute",
    left: 42,
    bottom: 72,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e58a3f"
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
  },
  formCard: {
    borderRadius: 30,
    backgroundColor: "rgba(255,253,248,0.94)",
    padding: spacing.lg,
    gap: spacing.sm
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  backText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  formTitle: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  formHelp: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 17,
    fontWeight: "700"
  },
  inputRow: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  errorText: {
    color: colors.coral,
    fontSize: typography.small,
    fontWeight: "900"
  },
  submitButton: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    alignItems: "center",
    justifyContent: "center"
  },
  submitText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "900"
  }
});
