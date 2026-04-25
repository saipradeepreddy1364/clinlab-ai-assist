import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from "date-fns";

export type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date) => void;
  style?: ViewStyle;
};

function Calendar({ selected, onSelect, style }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <ChevronLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{format(currentMonth, "MMMM yyyy")}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <ChevronRight size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>
      <View style={styles.weekDays}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <Text key={d} style={styles.weekDayText}>{d}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {days.map((day, i) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <TouchableOpacity
              key={i}
              onPress={() => onSelect?.(day)}
              style={[
                styles.dayCell,
                isSelected && styles.selectedDay,
                !isCurrentMonth && styles.outsideDay
              ]}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.selectedDayText,
                isToday && !isSelected && styles.todayText,
                !isCurrentMonth && styles.outsideDayText
              ]}>
                {format(day, "d")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  weekDays: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: "#0F172A",
  },
  selectedDay: {
    backgroundColor: "#0EA5E9",
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  todayText: {
    color: "#0EA5E9",
    fontWeight: "700",
  },
  outsideDay: {
    opacity: 0.3,
  },
  outsideDayText: {
    color: "#64748B",
  },
});

export { Calendar };
