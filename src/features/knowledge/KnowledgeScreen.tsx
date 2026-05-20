import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PlantSpecies } from "../../domain";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type KnowledgeScreenProps = {
  species: PlantSpecies[];
  onOpenPlant: (speciesId: string) => void;
  onDiagnoseByPhoto: () => void;
};

const topics = [
  { label: "Pests & Bugs", icon: "bug-outline" },
  { label: "Diseases", icon: "leaf-outline" },
  { label: "Plant Care", icon: "water-outline" },
  { label: "Propagation", icon: "git-branch-outline" },
  { label: "Growing From Seed", icon: "file-tray-full-outline" }
] as const;

export function KnowledgeScreen({ species, onOpenPlant, onDiagnoseByPhoto }: KnowledgeScreenProps) {
  const featuredSpecies = species.slice(0, 4);

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.subtitle}>Find answers, diagnose problems, and learn to grow with confidence.</Text>
        </View>
        <View style={styles.libraryBadge}>
          <Ionicons name="book-outline" size={25} color={colors.leafDeep} />
          <Text style={styles.libraryBadgeText}>My Library</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={28} color={colors.textMuted} />
        <TextInput placeholder="Search plants, problems, topics..." placeholderTextColor={colors.textMuted} style={styles.searchInput} />
      </View>

      <View style={styles.primaryGrid}>
        <TouchableOpacity accessibilityRole="button" style={[styles.primaryCard, styles.diagnoseCard]} onPress={onDiagnoseByPhoto}>
          <View style={styles.primaryIcon}>
            <Ionicons name="camera" size={30} color={colors.leafDeep} />
          </View>
          <Text style={styles.primaryTitle}>Diagnose by Photo</Text>
          <Text style={styles.primaryText}>Take a photo of a plant issue, pest, or disease.</Text>
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Open Camera</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button" style={[styles.primaryCard, styles.lookupCard]} onPress={() => featuredSpecies[0] && onOpenPlant(featuredSpecies[0].id)}>
          <View style={styles.primaryIconWarm}>
            <Ionicons name="leaf" size={30} color={colors.leafDeep} />
          </View>
          <Text style={styles.primaryTitle}>Look Up a Plant</Text>
          <Text style={styles.primaryText}>Identify a plant or get care information.</Text>
          <View style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Search Plants</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Explore Topics</Text>
        <Text style={styles.sectionLink}>View all</Text>
      </View>

      <View style={styles.topicRow}>
        {topics.map((topic) => (
          <TouchableOpacity key={topic.label} accessibilityRole="button" style={styles.topicChip}>
            <Ionicons name={topic.icon} size={27} color={colors.leafDeep} />
            <Text style={styles.topicText}>{topic.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity accessibilityRole="button" style={styles.seasonalTip}>
        <View style={styles.tipPlant}>
          <Ionicons name="leaf" size={42} color={colors.leaf} />
        </View>
        <View style={styles.tipCopy}>
          <Text style={styles.tipLabel}>Seasonal Tip</Text>
          <Text style={styles.tipTitle}>Warm weather is here!</Text>
          <Text style={styles.tipText}>Stay ahead with watering, mulch, and heat protection tips.</Text>
        </View>
        <View style={styles.tipArrow}>
          <Ionicons name="arrow-forward" size={22} color={colors.white} />
        </View>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently Viewed</Text>
        <Text style={styles.sectionLink}>Clear</Text>
      </View>

      <View style={styles.recentGrid}>
        {featuredSpecies.map((item) => (
          <TouchableOpacity key={item.id} accessibilityRole="button" style={styles.recentItem} onPress={() => onOpenPlant(item.id)}>
            <View style={styles.recentImage}>
              <Text style={styles.recentGlyph}>{item.commonName.charAt(0)}</Text>
            </View>
            <Text style={styles.recentTitle}>{item.commonName}</Text>
            <Text style={styles.recentMeta}>Plant Care</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.askAi}>
        <View style={styles.askIcon}>
          <Ionicons name="sparkles-outline" size={24} color={colors.leafDeep} />
        </View>
        <View style={styles.askCopy}>
          <Text style={styles.askTitle}>Can't find what you're looking for?</Text>
          <Text style={styles.askText}>Ask our AI garden assistant.</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.askButton}>
          <Text style={styles.askButtonText}>Ask AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerCopy: {
    flex: 1
  },
  title: {
    color: colors.leafDeep,
    fontSize: 46,
    fontWeight: "900",
    lineHeight: 52
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24
  },
  libraryBadge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  libraryBadgeText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  searchBox: {
    minHeight: 68,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700"
  },
  primaryGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  primaryCard: {
    flex: 1,
    minHeight: 250,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    justifyContent: "space-between"
  },
  diagnoseCard: {
    backgroundColor: "#eef6e9"
  },
  lookupCard: {
    backgroundColor: "#fff2df"
  },
  primaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dcebd5",
    alignItems: "center",
    justifyContent: "center"
  },
  primaryIconWarm: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f3dfb9",
    alignItems: "center",
    justifyContent: "center"
  },
  primaryTitle: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900",
    lineHeight: 24
  },
  primaryText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "700"
  },
  cardButton: {
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  cardButtonText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  sectionLink: {
    color: colors.leaf,
    fontSize: typography.small,
    fontWeight: "900"
  },
  topicRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  topicChip: {
    flex: 1,
    minHeight: 104,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
    gap: spacing.sm
  },
  topicText: {
    color: colors.leafDeep,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center"
  },
  seasonalTip: {
    minHeight: 132,
    borderRadius: 28,
    backgroundColor: "#eef6e9",
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  tipPlant: {
    width: 58,
    alignItems: "center"
  },
  tipCopy: {
    flex: 1
  },
  tipLabel: {
    color: colors.leaf,
    fontSize: typography.small,
    fontWeight: "900"
  },
  tipTitle: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  tipText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "700"
  },
  tipArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.leafDeep,
    alignItems: "center",
    justifyContent: "center"
  },
  recentGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  recentItem: {
    flex: 1,
    gap: spacing.xs
  },
  recentImage: {
    height: 78,
    borderRadius: 16,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center"
  },
  recentGlyph: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900"
  },
  recentTitle: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  recentMeta: {
    color: colors.leaf,
    fontSize: 11,
    fontWeight: "800"
  },
  askAi: {
    minHeight: 86,
    borderRadius: 26,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  askIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#f3dfb9",
    alignItems: "center",
    justifyContent: "center"
  },
  askCopy: {
    flex: 1
  },
  askTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  askText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "700"
  },
  askButton: {
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  askButtonText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  }
});
