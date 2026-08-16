// src/components/chat-list-item.tsx
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { formatRelativeTime } from "@/utils/formatters";

export interface ChatListItemProps {
  title: string;
  subtitle?: string | null;
  timestamp: number;
  onPress: () => void;
}

export function ChatListItem({
  title,
  subtitle,
  timestamp,
  onPress,
}: ChatListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView type="backgroundElement" style={styles.container}>
        <View style={styles.textContainer}>
          <ThemedText type="default" numberOfLines={1}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              numberOfLines={1}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {formatRelativeTime(timestamp)}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.half,
  },
});
