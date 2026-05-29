import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PlantSpecies } from "../../domain";
import { aiRecommendationProvider, AiAssistantResponse } from "../../services/aiRecommendationProvider";
import { getPruningTermsInText, pruningTermExplainers, PruningTermKey } from "../../services/pruningGuidance";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type KnowledgeScreenProps = {
  species: PlantSpecies[];
  onOpenPlant: (speciesId: string) => void;
  onDiagnoseByPhoto: () => void;
};

const topics = [
  { label: "Pests & Bugs", icon: "bug-outline", prompts: ["Aphids on peppers", "Cucumber beetles", "Natural pest control"] },
  { label: "Diseases", icon: "leaf-outline", prompts: ["Yellow leaves", "Powdery mildew", "Tomato blight"] },
  { label: "Plant Care", icon: "water-outline", prompts: ["Pruning tomatoes", "Pinch back basil", "What are suckers?"] },
  { label: "Propagation", icon: "git-branch-outline", prompts: ["Root rosemary cuttings", "Divide chives", "Succulent offsets"] },
  { label: "Growing From Seed", icon: "file-tray-full-outline", prompts: ["Start basil seeds", "Harden off seedlings", "When to transplant"] }
] as const;

type LibraryTopic = (typeof topics)[number];

export function KnowledgeScreen({ species, onOpenPlant, onDiagnoseByPhoto }: KnowledgeScreenProps) {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<LibraryTopic | null>(null);
  const [answer, setAnswer] = useState<AiAssistantResponse | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const featuredSpecies = species.slice(0, 4);
  const termMatches = useMemo(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      return [];
    }
    return getPruningTermsInText(normalized).slice(0, 4);
  }, [query]);
  const filteredSpecies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) {
      return [];
    }

    return species.filter((item) => `${item.commonName} ${item.scientificName ?? ""} ${item.family}`.toLowerCase().includes(normalized)).slice(0, 4);
  }, [query, species]);

  async function askPattypan(question = query.trim()) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      return;
    }

    setIsAsking(true);
    try {
      const result = await aiRecommendationProvider.askGardenAssistant({
        question: cleanQuestion,
        topic: activeTopic?.label,
        context: "Kitchener/Waterloo home garden with raised beds, containers, houseplants, herbs, tomatoes, peppers, cucumbers, lettuce, strawberries, and succulents."
      });
      setAnswer(result);
    } catch {
      setAnswer({
        provider: "local",
        confidence: "low",
        answer: "Pattypan could not reach the AI provider. Try again later, or use photo diagnosis/search for local guidance.",
        actions: ["Check the plant closely.", "Search the Library by symptom.", "Take a photo if the issue is visible."]
      });
    } finally {
      setIsAsking(false);
    }
  }

  if (activeTopic) {
    return (
      <View style={styles.screen}>
        <TouchableOpacity accessibilityRole="button" style={styles.backRow} onPress={() => { setActiveTopic(null); setAnswer(null); }}>
          <Ionicons name="chevron-back" size={20} color={colors.leafDeep} />
          <Text style={styles.sectionLink}>Library</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{activeTopic.label}</Text>
        <Text style={styles.subtitle}>Search this topic, ask Pattypan, or use a photo when symptoms are visible.</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={28} color={colors.textMuted} />
          <TextInput value={query} onChangeText={setQuery} placeholder={`Ask about ${activeTopic.label.toLowerCase()}...`} placeholderTextColor={colors.textMuted} style={styles.searchInput} onSubmitEditing={() => askPattypan()} />
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.fullButton} onPress={() => askPattypan()}>
          <Ionicons name="sparkles-outline" size={20} color={colors.white} />
          <Text style={styles.fullButtonText}>{isAsking ? "Asking Pattypan..." : "Ask Pattypan"}</Text>
        </TouchableOpacity>
        {(activeTopic.label === "Pests & Bugs" || activeTopic.label === "Diseases") ? (
          <TouchableOpacity accessibilityRole="button" style={styles.photoPrompt} onPress={onDiagnoseByPhoto}>
            <Ionicons name="camera" size={24} color={colors.leafDeep} />
            <Text style={styles.photoPromptText}>Diagnose by photo</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.promptGrid}>
          {activeTopic.prompts.map((prompt) => (
            <TouchableOpacity key={prompt} accessibilityRole="button" style={styles.promptChip} onPress={() => { setQuery(prompt); askPattypan(prompt); }}>
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeTopic.label === "Plant Care" || activeTopic.label === "Diseases" || activeTopic.label === "Growing From Seed" ? (
          <View style={styles.termGrid}>
            {getTopicTerms(activeTopic.label).map((term) => (
              <TouchableOpacity key={term} accessibilityRole="button" style={styles.termChip} onPress={() => showTermExplainer(term)}>
                <Ionicons name={term === "suckers" || term === "pinch back" || term === "deadhead" ? "cut-outline" : "information-circle-outline"} size={16} color={colors.leafDeep} />
                <Text style={styles.termChipText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        {answer ? <AnswerCard answer={answer} /> : null}
      </View>
    );
  }

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
        <TextInput value={query} onChangeText={setQuery} placeholder="Search plants, problems, topics..." placeholderTextColor={colors.textMuted} style={styles.searchInput} onSubmitEditing={() => askPattypan()} />
      </View>

      {filteredSpecies.length > 0 ? (
        <View style={styles.searchResults}>
          {filteredSpecies.map((item) => (
            <TouchableOpacity key={item.id} accessibilityRole="button" style={styles.resultRow} onPress={() => onOpenPlant(item.id)}>
              <Text style={styles.resultTitle}>{item.commonName}</Text>
              <Text style={styles.resultMeta}>{item.scientificName ?? item.family}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : termMatches.length > 0 ? (
        <View style={styles.searchResults}>
          {termMatches.map((term) => (
            <TouchableOpacity key={term} accessibilityRole="button" style={styles.resultRow} onPress={() => showTermExplainer(term)}>
              <Text style={styles.resultTitle}>{pruningTermExplainers[term].title}</Text>
              <Text style={styles.resultMeta}>{pruningTermExplainers[term].summary}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : query.trim().length >= 2 ? (
        <TouchableOpacity accessibilityRole="button" style={styles.askInline} onPress={() => askPattypan()}>
          <Ionicons name="sparkles-outline" size={19} color={colors.leafDeep} />
          <Text style={styles.addCustomText}>Ask Pattypan about "{query.trim()}"</Text>
        </TouchableOpacity>
      ) : null}

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
          <TouchableOpacity key={topic.label} accessibilityRole="button" style={styles.topicChip} onPress={() => { setActiveTopic(topic); setAnswer(null); }}>
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
        <TouchableOpacity accessibilityRole="button" style={styles.askButton} onPress={() => askPattypan(query.trim() || "What should I check in my garden today?")}>
          <Text style={styles.askButtonText}>{isAsking ? "Asking" : "Ask AI"}</Text>
        </TouchableOpacity>
      </View>
      {answer ? <AnswerCard answer={answer} /> : null}
    </View>
  );
}

function AnswerCard({ answer }: { answer: AiAssistantResponse }) {
  return (
    <View style={styles.answerCard}>
      <Text style={styles.matchLabel}>{answer.provider === "openai" ? "Pattypan AI" : "Local guidance"} - {answer.confidence} confidence</Text>
      <Text style={styles.answerText}>{answer.answer}</Text>
      {answer.actions.slice(0, 4).map((action) => (
        <Text key={action} style={styles.actionBullet}>- {action}</Text>
      ))}
    </View>
  );
}

function getTopicTerms(topicLabel: string): PruningTermKey[] {
  if (topicLabel === "Plant Care") {
    return ["suckers", "pinch back", "deadhead", "side shoot", "node"];
  }
  if (topicLabel === "Diseases") {
    return ["powdery mildew", "blossom end rot"];
  }
  if (topicLabel === "Growing From Seed") {
    return ["true leaves", "hardening off", "transplant shock"];
  }
  return [];
}

function showTermExplainer(term: PruningTermKey) {
  const explainer = pruningTermExplainers[term];
  Alert.alert(explainer.title, `${explainer.summary}\n\nWhere to look: ${explainer.where}\n\nSafe move: ${explainer.safeAction}`);
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
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  fullButton: {
    minHeight: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  fullButtonText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "900"
  },
  photoPrompt: {
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: "#eef6e9",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  photoPromptText: {
    color: colors.leafDeep,
    fontSize: typography.body,
    fontWeight: "900"
  },
  promptGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  termGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  promptChip: {
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  promptText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  termChip: {
    minHeight: 40,
    borderRadius: radii.pill,
    backgroundColor: "#eef6e9",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  termChipText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  searchResults: {
    gap: spacing.sm
  },
  resultRow: {
    minHeight: 58,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  resultTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  resultMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  askInline: {
    minHeight: 50,
    borderRadius: 20,
    backgroundColor: "#eef6e9",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  addCustomText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  answerCard: {
    borderRadius: 24,
    backgroundColor: "#eef6e9",
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  matchLabel: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  answerText: {
    color: colors.text,
    fontSize: typography.small,
    lineHeight: 21,
    fontWeight: "800"
  },
  actionBullet: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "800"
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
