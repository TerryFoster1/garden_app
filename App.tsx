import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";

import { GardenApp } from "./src/application/GardenApp";
import { colors } from "./src/theme/tokens";

export default function App() {
  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="dark" />
      <GardenApp />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background
  }
});
