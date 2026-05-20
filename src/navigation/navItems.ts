import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export type GardenTabKey = "home" | "garden" | "library" | "profile";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export const navItems: Array<{ key: GardenTabKey; label: string; icon: IoniconName }> = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "garden", label: "My Garden", icon: "leaf-outline" },
  { key: "library", label: "Library", icon: "book-outline" },
  { key: "profile", label: "Profile", icon: "person-outline" }
];
