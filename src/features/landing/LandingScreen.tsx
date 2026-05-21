import { useState } from "react";
import { ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { signInLocal, signUpLocal, LocalSession } from "../../services/localAuth";
import { colors, spacing, typography } from "../../theme/tokens";

const landingBackground = require("../../../assets/landing/pattypan-vegetable-garden-hero.jpg");

type LandingScreenProps = {
  onAuthenticated: (session: LocalSession, isNewAccount: boolean) => void;
  onLearnMore: () => void;
};

type AuthMode = "landing" | "sign-up" | "sign-in";

export function LandingScreen({ onAuthenticated, onLearnMore }: LandingScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 900;
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
    <ImageBackground source={landingBackground} resizeMode="cover" style={[styles.screen, isDesktop && styles.desktopScreen]} imageStyle={styles.backgroundImage}>
      <View style={styles.scrim} />
      <LinearGradient colors={["rgba(5,18,10,0.52)", "rgba(5,18,10,0)"]} style={styles.topVeil} />
      <LinearGradient colors={["rgba(5,18,10,0)", "rgba(5,18,10,0.88)"]} style={styles.bottomVeil} />

      <View style={[styles.mark, isDesktop && styles.desktopMark]}>
        <Ionicons name="leaf-outline" size={isDesktop ? 24 : 22} color="#fffdf3" />
      </View>

      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        {isDesktop ? (
          <View style={styles.desktopPanelMark}>
            <Ionicons name="leaf-outline" size={24} color="#fffdf3" />
          </View>
        ) : null}
        <Text style={[styles.name, isDesktop && styles.desktopName]}>Pattypan</Text>
        <Text style={[styles.tagline, isDesktop && styles.desktopTagline]}>Your Heirloom Secret</Text>
        {mode === "landing" && !showLearnMore ? (
          <Text style={[styles.supportingCopy, isDesktop && styles.desktopSupportingCopy]}>Weather-aware care, plant memory, and garden guidance in one quiet companion.</Text>
        ) : null}

        {mode === "landing" && showLearnMore ? (
        <View style={[styles.formCard, isDesktop && styles.desktopFormCard]}>
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
        <View style={[styles.actions, isDesktop && styles.desktopActions]}>
          <TouchableOpacity accessibilityRole="button" style={styles.signUpButton} onPress={() => setMode("sign-up")}>
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.signInButton} onPress={() => setMode("sign-in")}>
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
          </TouchableOpacity>
        </View>
        ) : (
        <View style={[styles.formCard, isDesktop && styles.desktopFormCard]}>
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
        {isDesktop && mode === "landing" && !showLearnMore ? <Text style={styles.desktopNote}>Best on mobile for camera, notifications, and garden checks.</Text> : null}
      </View>
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
    justifyContent: "flex-end",
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 42,
    overflow: "hidden"
  },
  desktopScreen: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: "8%",
    paddingRight: 56,
    paddingVertical: 56
  },
  backgroundImage: {
    transform: [{ scale: 1.08 }]
  },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(5, 18, 10, 0.48)"
  },
  topVeil: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 180,
    backgroundColor: "rgba(5, 18, 10, 0.42)"
  },
  bottomVeil: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "58%",
    backgroundColor: "rgba(5, 18, 10, 0.88)"
  },
  content: {
    width: "100%",
    maxWidth: 330,
    alignSelf: "flex-start"
  },
  desktopContent: {
    width: 460,
    maxWidth: 460,
    padding: 40,
    borderRadius: 32,
    backgroundColor: "rgba(7, 28, 15, 0.48)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 }
  },
  mark: {
    position: "absolute",
    left: 28,
    top: 56,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  desktopMark: {
    display: "none"
  },
  desktopPanelMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginBottom: 24
  },
  name: {
    color: "#fffdf3",
    fontSize: 58,
    lineHeight: 56,
    fontWeight: "800",
    letterSpacing: -1.5,
    textShadowColor: "rgba(0,0,0,0.42)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 6 }
  },
  desktopName: {
    fontSize: 72,
    lineHeight: 68,
    maxWidth: 390
  },
  tagline: {
    color: "#f6d36b",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "600",
    marginTop: 10,
    textShadowColor: "rgba(0,0,0,0.42)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 4 }
  },
  desktopTagline: {
    fontSize: 26,
    lineHeight: 32
  },
  supportingCopy: {
    maxWidth: 310,
    color: "rgba(255,253,243,0.86)",
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "600",
    marginTop: 16,
    textShadowColor: "rgba(0,0,0,0.38)",
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 3 }
  },
  desktopSupportingCopy: {
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 390
  },
  actions: {
    width: "100%",
    gap: 12,
    marginTop: 32
  },
  desktopActions: {
    maxWidth: 340
  },
  signUpButton: {
    height: 56,
    borderRadius: 999,
    backgroundColor: "#fffdf3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 }
  },
  signUpText: {
    color: "#12351f",
    fontSize: 17,
    fontWeight: "700"
  },
  signInButton: {
    height: 54,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center"
  },
  signInText: {
    color: "#fffdf3",
    fontSize: 17,
    fontWeight: "700"
  },
  learnButton: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6
  },
  learnText: {
    color: "rgba(255,253,243,0.78)",
    fontSize: 14,
    fontWeight: "700"
  },
  desktopNote: {
    color: "rgba(255,253,243,0.7)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 20,
    maxWidth: 340
  },
  formCard: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "rgba(255,253,248,0.92)",
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.36)",
    marginTop: 24
  },
  desktopFormCard: {
    maxWidth: 380
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
    borderRadius: 999,
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
