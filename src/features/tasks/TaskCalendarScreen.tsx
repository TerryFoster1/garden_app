import { StyleSheet, Text, View } from "react-native";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { CareTask } from "../../domain";
import { colors, typography } from "../../theme/tokens";

type TaskCalendarScreenProps = {
  tasks: CareTask[];
  onBack: () => void;
};

export function TaskCalendarScreen({ tasks, onBack }: TaskCalendarScreenProps) {
  return (
    <View>
      <ScreenHeader onBack={onBack} eyebrow="Task list" title="Care calendar" subtitle="Validated tasks from rules, confirmed AI suggestions, weather events, and user-created reminders." />
      {tasks.map((task) => (
        <GardenCard key={task.id}>
          <Text style={styles.cardTitle}>{task.title}</Text>
          <Text style={styles.cardText}>{task.dueAt}</Text>
          <Text style={styles.cardText}>{task.reason}</Text>
        </GardenCard>
      ))}
      <PrimaryButton label="Back to today" onPress={onBack} />
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
    lineHeight: 20
  }
});

