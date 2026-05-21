import { useState } from "react";
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { signInLocal, signUpLocal, LocalSession } from "../../services/localAuth";
import { colors, radii, spacing, typography } from "../../theme/tokens";

const landingBackground = require("../../../assets/backgrounds/pattypan-greenhouse-tomatoes.jpg");

type LandingScreenProps = {
  onAuthenticated: (session: LocalSession, isNewAccount: boolean) => void;
  onLearnMore: () => void;
};

type AuthMode = "landing" | "sign-up" | "sign-in";

export function LandingScreen({ onAuthenticated, onLearnMore }: LandingScreenProps) {
  const [mode, setMode] = useState<AuthMode>("landing");
  const [showLearnMore, setShowLearnMore] = useState(false);
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
    <ImageBackground source={landingBackground} resizeMode="cover" style={styles.screen} imageStyle={styles.backgroundImage}>
      <View style={styles.scrim} />
      <View style={styles.topVeil} />
      <View style={styles.bottomVeil} />

      <View style={styles.brand}>
        <View style={styles.mark}>
          <Ionicons name="leaf-outline" size={34} color="#f4ead2" />
        </View>
        <Text style={styles.name}>Pattypan</Text>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Ionicons name="leaf-outline" size={16} color="#d9c180" />
          <View style={styles.divider} />
        </View>
        <Text style={styles.tagline}>Your Heirloom Secret</Text>
      </View>

      {mode === "landing" && showLearnMore ? (
        <View style={styles.formCard}>
          <TouchableOpacity accessibilityRole="button" style={styles.backRow} onPress={() => setShowLearnMore(false)}>
            <Ionicons name="chevron-back" size={18} color={colors.leafDeep} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>A garden companion that remembers.</Text>
          <Text style={styles.formHelp}>Pattypan helps you build a living record of your plants, beds, weather, diagnoses, and harvest timing without turning gardening into a spreadsheet.</Text>
          <LearnItem icon="camera-outline" text="Identify plants and problems from photos, then confirm before anything is saved." />
          <LearnItem icon="partly-sunny-outline" text="Use location-aware weather to turn frost, rain, heat, wind, and humidity into practical garden actions." />
          <LearnItem icon="leaf-outline" text="Track each plant as a specific living instance with photos, care tasks, and growth history." />
          <TouchableOpacity accessibilityRole="button" style={styles.submitButton} onPress={() => { setShowLearnMore(false); setMode("sign-up"); }}>
            <Text style={styles.submitText}>Create account</Text>
          </TouchableOpacity>
        </View>
      ) : mode === "landing" ? (
        <View style={styles.actions}>
          <TouchableOpacity accessibilityRole="button" style={styles.signUpButton} onPress={() => setMode("sign-up")}>
            <Ionicons name="leaf-outline" size={20} color="#f8f1df" />
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.signInButton} onPress={() => setMode("sign-in")}>
            <Ionicons name="leaf-outline" size={20} color="#113d28" />
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.learnButton}
            onPress={() => {
              setShowLearnMore(true);
              onLearnMore();
            }}
          >
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
    </ImageBackground>
  );
}

function LearnItem({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.learnItem}>
      <Ionicons name={icon} size={20} color={colors.leafDeep} />
      <Text style={styles.learnItemText}>{text}</Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingTop: 86,
    paddingBottom: 34,
    overflow: "hidden"
  },
  backgroundImage: {
    transform: [{ scale: 1.04 }]
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(6, 26, 17, 0.36)"
  },
  topVeil: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 320,
    backgroundColor: "rgba(4, 19, 12, 0.28)"
  },
  bottomVeil: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 380,
    backgroundColor: "rgba(3, 16, 10, 0.72)"
  },
  brand: {
    alignItems: "center",
    gap: 10,
    marginTop: 8
  },
  mark: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(247,241,229,0.12)",
    borderWidth: 1,
    borderColor: "rgba(247,241,229,0.34)"
  },
  name: {
    color: "#fbf4e4",
    fontSize: 64,
    fontFamily: "serif",
    fontWeight: "600",
    letterSpacing: 0,
    textShadowColor: "rgba(0,0,0,0.48)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 6 }
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: -2
  },
  divider: {
    width: 64,
    height: 1,
    backgroundColor: "rgba(217,193,128,0.7)"
  },
  tagline: {
    color: "#e4d4a5",
    fontSize: 23,
    fontFamily: "serif",
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.42)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 4 }
  },
  actions: {
    gap: 13
  },
  signUpButton: {
    minHeight: 60,
    borderRadius: radii.pill,
    backgroundColor: "rgba(11, 67, 43, 0.86)",
    borderWidth: 1,
    borderColor: "rgba(248,241,223,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }
  },
  signUpText: {
    color: "#fff9ea",
    fontSize: typography.body,
    fontWeight: "800"
  },
  signInButton: {
    minHeight: 60,
    borderRadius: radii.pill,
    backgroundColor: "rgba(248, 241, 223, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.46)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  signInText: {
    color: "#113d28",
    fontSize: typography.body,
    fontWeight: "800"
  },
  learnButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  learnText: {
    color: "#fff9ea",
    fontSize: typography.small,
    fontWeight: "800"
  },
  formCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,253,248,0.88)",
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.36)"
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
  },
  learnItem: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md
  },
  learnItemText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 19
  }
});
