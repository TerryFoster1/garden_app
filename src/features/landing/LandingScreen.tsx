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
    <ImageBackground source={landingBackground} resizeMode="cover" style={styles.screen} imageStyle={styles.backgroundImage}>
      <LinearGradient colors={["rgba(48,75,13,0.46)", "rgba(21,43,10,0.62)"]} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={["rgba(4,16,8,0.34)", "rgba(4,16,8,0)", "rgba(4,16,8,0.62)"]} locations={[0, 0.42, 1]} style={StyleSheet.absoluteFill} />

      <View style={[styles.brandCluster, isDesktop && styles.desktopBrandCluster]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="leaf-outline" size={isDesktop ? 35 : 31} color="#fffdf3" />
          </View>
          <Text style={[styles.brandName, isDesktop && styles.desktopBrandName]}>Pattypan</Text>
        </View>
        <Text style={[styles.brandSubtitle, isDesktop && styles.desktopBrandSubtitle]}>Your Garden Companion</Text>
      </View>

      {mode === "landing" && showLearnMore ? (
        <View style={[styles.panel, isDesktop && styles.desktopPanel]}>
          <TouchableOpacity accessibilityRole="button" style={styles.backRow} onPress={() => setShowLearnMore(false)}>
            <Ionicons name="chevron-back" size={18} color={colors.leafDeep} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.panelTitle}>A garden companion that remembers.</Text>
          <Text style={styles.panelHelp}>Pattypan helps you track plants, weather, diagnoses, tasks, and garden memories without turning gardening into a spreadsheet.</Text>
          <LearnItem icon="camera-outline" text="Identify plants and problems from photos, then confirm before anything is saved." />
          <LearnItem icon="partly-sunny-outline" text="Turn frost, rain, heat, wind, and humidity into practical garden actions." />
          <LearnItem icon="leaf-outline" text="Track each plant as a living instance with photos, care tasks, and growth history." />
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
        <View style={[styles.panel, isDesktop && styles.desktopPanel]}>
          <TouchableOpacity accessibilityRole="button" style={styles.backRow} onPress={() => { setMode("landing"); setError(""); }}>
            <Ionicons name="chevron-back" size={18} color={colors.leafDeep} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.panelTitle}>{mode === "sign-up" ? "Create local account" : "Sign in locally"}</Text>
          <Text style={styles.panelHelp}>Prototype account stored only on this device. Production auth must be server-side before public launch.</Text>
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
    overflow: "hidden"
  },
  backgroundImage: {
    transform: [{ scale: 1.04 }]
  },
  brandCluster: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "41%",
    alignItems: "center"
  },
  desktopBrandCluster: {
    top: "40%"
  },
  brandRow: {
    width: 348,
    maxWidth: "82%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 13
  },
  brandMark: {
    width: 53,
    height: 53,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "#fffdf3",
    alignItems: "center",
    justifyContent: "center"
  },
  brandName: {
    color: "#fffdf3",
    fontSize: 40,
    lineHeight: 45,
    fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif",
    fontWeight: "400",
    letterSpacing: -0.6,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 8 }
  },
  desktopBrandName: {
    fontSize: 58,
    lineHeight: 64
  },
  brandSubtitle: {
    color: "#fffdf3",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "400",
    marginTop: 7,
    textShadowColor: "rgba(0,0,0,0.24)",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 5 }
  },
  desktopBrandSubtitle: {
    fontSize: 19,
    lineHeight: 26,
    marginTop: 9
  },
  actions: {
    position: "absolute",
    left: 38,
    right: 38,
    bottom: 46,
    gap: 12
  },
  desktopActions: {
    width: 348,
    left: "50%",
    right: undefined,
    marginLeft: -174,
    bottom: 68
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
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6
  },
  learnText: {
    color: "rgba(255,253,243,0.78)",
    fontSize: 14,
    fontWeight: "700"
  },
  panel: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 40,
    borderRadius: 24,
    backgroundColor: "rgba(255,253,248,0.92)",
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.36)"
  },
  desktopPanel: {
    width: 380,
    left: "50%",
    right: undefined,
    marginLeft: -190,
    bottom: 56
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
  panelTitle: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  panelHelp: {
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
