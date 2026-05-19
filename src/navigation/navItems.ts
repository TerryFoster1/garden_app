import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type GardenTabKey = "today" | "scan" | "garden" | "planner" | "knowledge";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export const navItems: Array<{ key: GardenTabKey; label: string; icon: IoniconName }> = [
  { key: "today", label: "Today", icon: "sunny-outline" },
  { key: "scan", label: "Scan", icon: "camera" },
  { key: "garden", label: "Garden", icon: "leaf-outline" },
  { key: "planner", label: "Planner", icon: "map-outline" },
  { key: "knowledge", label: "Knowledge", icon: "search-outline" }
];

