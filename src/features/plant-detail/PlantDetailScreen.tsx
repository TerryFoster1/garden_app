import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { CareTask, GardenBed, GardenHomeModel, PlantInstance, PlantSpecies } from "../../domain";
import { getPlantKnowledge } from "../../data/plantKnowledge";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type PlantDetailScreenProps = {
  plant: PlantInstance;
  model: GardenHomeModel;
  onBack: () => void;
  onMovePlant: () => void;
  onRemovePlant: () => void;
  onScanPlant: () => void;
};

export function PlantDetailScreen({ plant, model, onBack, onMovePlant, onRemovePlant, onScanPlant }: PlantDetailScreenProps) {
  const species = model.species.find((item) => item.id === plant.speciesId);
  const bed = plant.bedId ? model.beds.find((item) => item.id === plant.bedId) : undefined;
  const tasks = model.tasks.filter((task) => task.plantInstanceId === plant.id && task.status !== "done");
  const knowledge = getPlantKnowledge(species, plant.nickname);
  const isReferencePlant = plant.id.startsWith("knowledge-");

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={onBack} eyebrow={plant.locationType.replaceAll("-", " ")} title={plant.nickname} subtitle={locationLine(plant, bed, model)} />

      <View style={styles.hero}>
        <View style={styles.visualOrb}>
          <Text style={styles.visualGlyph}>{knowledge.visual}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.commonName}>{knowledge.commonName}</Text>
          {knowledge.scientificName ? <Text style={styles.scientificName}>{knowledge.scientificName}</Text> : null}
          <View style={styles.stagePill}>
            <Text style={styles.stagePillText}>{plant.stage ?? plant.source}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <PrimaryButton label="Scan" onPress={onScanPlant} tone="sun" icon={<Ionicons name="camera" size={19} color={colors.leafDeep} />} style={styles.actionButton} />
        {!isReferencePlant ? <PrimaryButton label="Move" onPress={onMovePlant} tone="quiet" icon={<Ionicons name="swap-horizontal" size={19} color={colors.leafDeep} />} style={styles.actionButton} /> : null}
        {!isReferencePlant ? <PrimaryButton label="Remove" onPress={onRemovePlant} tone="quiet" icon={<Ionicons name="trash-outline" size={19} color={colors.leafDeep} />} style={styles.actionButton} /> : null}
      </View>

      <View style={styles.quickGrid}>
        <Fact icon="sunny-outline" label="Light" value={knowledge.lightNeeds} />
        <Fact icon="water-outline" label="Water" value={knowledge.watering} />
        <Fact icon="nutrition-outline" label="Feed" value={knowledge.feeding} />
        <Fact icon="layers-outline" label="Soil" value={knowledge.soil} />
      </View>

      {knowledge.spacing ? (
        <Section title="Spacing" items={[knowledge.spacing]} />
      ) : null}

      <Section title="Companions" items={knowledge.companions} empty="No strong companion notes yet." />
      <Section title="Avoid Nearby" items={knowledge.badCompanions} empty="No known avoid notes in this mock profile." />
      <Section title="Pests + Disease Watch" items={knowledge.pestsDiseases} />
      <Section title="Natural Controls" items={knowledge.naturalControls} />

      {knowledge.seedTransplantNotes ? <InfoBlock title="Seed + Transplant" text={knowledge.seedTransplantNotes} /> : null}
      {knowledge.pruningHarvestNotes ? <InfoBlock title="Pruning + Harvest" text={knowledge.pruningHarvestNotes} /> : null}
      {knowledge.toxicity ? <InfoBlock title="Toxicity" text={knowledge.toxicity} tone="warning" /> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Current Tasks</Text>
        <Text style={styles.sectionMeta}>{tasks.length}</Text>
      </View>
      {tasks.length > 0 ? tasks.map((task) => <TaskLine key={task.id} task={task} />) : <Text style={styles.emptyText}>No active tasks for this plant.</Text>}

      <InfoBlock title="Recent Activity" text={`${plant.notes || "Added to your garden."}${plant.plantedOn ? ` Planted ${plant.plantedOn}.` : ""}`} />
    </View>
  );
}

function Fact({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={21} color={colors.leafDeep} />
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function Section({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  const visibleItems = items.length > 0 ? items : empty ? [empty] : [];
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>
        {visibleItems.map((item) => (
          <View key={item} style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function InfoBlock({ title, text, tone = "normal" }: { title: string; text: string; tone?: "normal" | "warning" }) {
  return (
    <View style={[styles.infoBlock, tone === "warning" && styles.warningBlock]}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function TaskLine({ task }: { task: CareTask }) {
  return (
    <View style={styles.taskLine}>
      <View style={[styles.taskDot, task.priority === "high" || task.priority === "urgent" ? styles.hotDot : null]} />
      <View style={styles.taskCopy}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskReason}>{task.reason}</Text>
      </View>
    </View>
  );
}

function locationLine(plant: PlantInstance, bed: GardenBed | undefined, model: GardenHomeModel) {
  const garden = model.gardens.find((item) => item.id === plant.gardenId);
  return `${garden?.name ?? "Garden"} - ${bed?.name ?? plant.locationLabel}`;
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  hero: {
    minHeight: 164,
    borderRadius: 34,
    padding: spacing.lg,
    backgroundColor: colors.leafDeep,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg
  },
  visualOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.sun,
    alignItems: "center",
    justifyContent: "center"
  },
  visualGlyph: {
    color: colors.leafDeep,
    fontSize: 42,
    fontWeight: "900"
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs
  },
  commonName: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 30
  },
  scientificName: {
    color: colors.surfaceWarm,
    fontSize: typography.small,
    fontStyle: "italic",
    fontWeight: "700"
  },
  stagePill: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs
  },
  stagePillText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: spacing.sm
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  fact: {
    width: "48%",
    minHeight: 142,
    borderRadius: 26,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs
  },
  factLabel: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  factValue: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 19
  },
  infoSection: {
    gap: spacing.sm
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  chipText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  infoBlock: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  warningBlock: {
    backgroundColor: "#fff0e9",
    borderColor: "#efc3b6"
  },
  infoTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  infoText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "700"
  },
  taskLine: {
    minHeight: 76,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md
  },
  taskDot: {
    width: 12,
    borderRadius: 8,
    backgroundColor: colors.sage
  },
  hotDot: {
    backgroundColor: colors.coral
  },
  taskCopy: {
    flex: 1
  },
  taskTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  taskReason: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 4
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800"
  }
});
