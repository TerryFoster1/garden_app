import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PlantLocationType } from "../../domain";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type BedTypeOption = {
  label: string;
  value: PlantLocationType;
  kind: "outdoor" | "container" | "indoor";
};

type GardenSetupFlowScreenProps = {
  onBack: () => void;
  onCreateBed?: (input: { name: string; lengthFeet: number; widthFeet: number; depthInches?: number; locationType: PlantLocationType; kind: "outdoor" | "container" | "indoor"; sunExposure?: string }) => void;
};

const bedTypes: BedTypeOption[] = [
  { label: "Raised bed", value: "raised-bed", kind: "outdoor" },
  { label: "In-ground bed", value: "in-ground", kind: "outdoor" },
  { label: "Container", value: "container", kind: "container" },
  { label: "Pot", value: "container", kind: "container" },
  { label: "Greenhouse bed", value: "greenhouse", kind: "outdoor" }
];

export function GardenSetupFlowScreen({ onBack, onCreateBed }: GardenSetupFlowScreenProps) {
  const [name, setName] = useState("Raised Bed 1");
  const [selectedType, setSelectedType] = useState<BedTypeOption>(bedTypes[0]);
  const [lengthFeet, setLengthFeet] = useState("5");
  const [widthFeet, setWidthFeet] = useState("2");
  const [depthFeet, setDepthFeet] = useState("1");
  const [sunExposure, setSunExposure] = useState("not-mapped");

  function saveSetup() {
    if (onCreateBed) {
      onCreateBed({
        name: name.trim() || "Garden Bed",
        lengthFeet: Number(lengthFeet) || 5,
        widthFeet: Number(widthFeet) || 2,
        depthInches: depthFeet.trim() ? Math.round((Number(depthFeet) || 0) * 12) : undefined,
        locationType: selectedType.value,
        kind: selectedType.kind,
        sunExposure
      });
      return;
    }

    onBack();
  }

  return (
    <View>
      <ScreenHeader onBack={onBack} eyebrow="Garden setup" title="Create a growing space" subtitle="Start with the basics. Sun and shade can be mapped later when you are outside." />
      <GardenCard tone="warm">
        <Text style={styles.cardTitle}>Create your first bed or container</Text>
        <Text style={styles.cardText}>No fake sun, shade, or moisture data will be assumed. Pattypan will label unknowns clearly until you map them.</Text>
      </GardenCard>

      <View style={styles.form}>
        <Field label="Bed name" value={name} onChangeText={setName} placeholder="Raised Bed 1" />
        <Text style={styles.fieldLabel}>Bed type</Text>
        <View style={styles.optionWrap}>
          {bedTypes.map((type) => (
            <TouchableOpacity key={`${type.label}-${type.value}`} accessibilityRole="button" style={[styles.optionChip, selectedType.label === type.label && styles.optionChipActive]} onPress={() => setSelectedType(type)}>
              <Text style={[styles.optionText, selectedType.label === type.label && styles.optionTextActive]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Enter bed dimensions</Text>
        <Field label="Length (feet)" value={lengthFeet} onChangeText={setLengthFeet} placeholder="5 ft" keyboardType="numeric" />
        <Field label="Width (feet)" value={widthFeet} onChangeText={setWidthFeet} placeholder="2 ft" keyboardType="numeric" />
        <Field label="Depth / height (feet)" value={depthFeet} onChangeText={setDepthFeet} placeholder="1 ft" keyboardType="numeric" />

        <View style={styles.optionalPanel}>
          <View style={styles.optionalHeader}>
            <Ionicons name="sunny-outline" size={22} color={colors.leafDeep} />
            <Text style={styles.cardTitle}>Improve sun accuracy</Text>
          </View>
          <Text style={styles.cardText}>Set this manually now, or map shade later from Bed Detail.</Text>
          <View style={styles.optionWrap}>
            {["not-mapped", "full-sun", "part-sun", "part-shade", "shade"].map((value) => (
              <TouchableOpacity key={value} accessibilityRole="button" style={[styles.optionChip, sunExposure === value && styles.optionChipActive]} onPress={() => setSunExposure(value)}>
                <Text style={[styles.optionText, sunExposure === value && styles.optionTextActive]}>{value.replace(/-/g, " ")}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <PrimaryButton label="Save Garden Bed" onPress={saveSetup} icon={<Ionicons name="checkmark" size={20} color={colors.white} />} />
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: "numeric" }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={colors.textMuted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "700"
  },
  form: {
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  field: {
    gap: spacing.xs
  },
  fieldLabel: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    marginTop: spacing.sm
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  optionChip: {
    minHeight: 42,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  optionChipActive: {
    backgroundColor: colors.leafDeep,
    borderColor: colors.leafDeep
  },
  optionText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  optionTextActive: {
    color: colors.white
  },
  optionalPanel: {
    borderRadius: 22,
    backgroundColor: colors.surfaceWarm,
    padding: spacing.md,
    gap: spacing.sm
  },
  optionalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  }
});
