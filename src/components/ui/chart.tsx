import * as React from "react";
import { View, Text, StyleSheet, Dimensions, ViewStyle, TextStyle } from "react-native";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

const ChartContainer = ({ 
  config, 
  children, 
  style 
}: { 
  config: ChartConfig, 
  children: React.ReactNode, 
  style?: ViewStyle 
}) => {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipLabel}>{label}</Text>
      {payload.map((item: any, i: number) => (
        <Text key={i} style={{ color: item.color || "#0F172A" }}>
          {item.name}: {item.value}
        </Text>
      ))}
    </View>
  );
};

const ChartTooltipContent = () => <View />;// Placeholder

const ChartLegend = ({ config }: { config: ChartConfig }) => {
  return (
    <View style={styles.legend}>
      {Object.entries(config).map(([key, item]) => (
        <View key={key} style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label as string}</Text>
        </View>
      ))}
    </View>
  );
};

const ChartLegendContent = () => <View />;// Placeholder
const ChartStyle = () => null;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  tooltip: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipLabel: {
    fontWeight: "700",
    marginBottom: 4,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#64748B",
  },
});

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
