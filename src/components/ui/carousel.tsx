import * as React from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ViewStyle } from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { Button } from "./button";

type CarouselProps = {
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
  style?: ViewStyle;
};

type CarouselContextProps = {
  scrollRef: React.RefObject<ScrollView>;
  orientation: "horizontal" | "vertical";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within a <Carousel />");
  return context;
}

const Carousel = ({ orientation = "horizontal", children, style }: CarouselProps) => {
  const scrollRef = React.useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [contentSize, setContentSize] = React.useState(0);
  const [layoutSize, setLayoutSize] = React.useState(0);

  const scrollPrev = () => {
    const nextIndex = Math.max(0, currentIndex - 1);
    scrollRef.current?.scrollTo({
      [orientation === "horizontal" ? "x" : "y"]: nextIndex * layoutSize,
      animated: true,
    });
  };

  const scrollNext = () => {
    scrollRef.current?.scrollTo({
      [orientation === "horizontal" ? "x" : "y"]: (currentIndex + 1) * layoutSize,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset[orientation === "horizontal" ? "x" : "y"];
    setCurrentIndex(Math.round(offset / layoutSize));
  };

  return (
    <CarouselContext.Provider value={{
      scrollRef,
      orientation,
      scrollPrev,
      scrollNext,
      canScrollPrev: currentIndex > 0,
      canScrollNext: (currentIndex + 1) * layoutSize < contentSize,
    }}>
      <View 
        style={[styles.container, style]}
        onLayout={(e) => setLayoutSize(e.nativeEvent.layout[orientation === "horizontal" ? "width" : "height"])}
      >
        {children}
      </View>
    </CarouselContext.Provider>
  );
};

const CarouselContent = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  const { scrollRef, orientation } = useCarousel();
  return (
    <ScrollView
      ref={scrollRef}
      horizontal={orientation === "horizontal"}
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      style={[styles.content, style]}
      onContentSizeChange={(w, h) => setContentSize(orientation === "horizontal" ? w : h)}
    >
      {children}
    </ScrollView>
  );
};

const CarouselItem = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => {
  const { orientation } = useCarousel();
  const { width, height } = Dimensions.get("window");
  return (
    <View style={[
      orientation === "horizontal" ? { width } : { height: 200 },
      styles.item,
      style
    ]}>
      {children}
    </View>
  );
};

const CarouselPrevious = ({ style }: { style?: ViewStyle }) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <TouchableOpacity 
      onPress={scrollPrev} 
      disabled={!canScrollPrev}
      style={[styles.navButton, styles.prevButton, style, !canScrollPrev && styles.disabled]}
    >
      <ArrowLeft size={16} color="#0F172A" />
    </TouchableOpacity>
  );
};

const CarouselNext = ({ style }: { style?: ViewStyle }) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <TouchableOpacity 
      onPress={scrollNext} 
      disabled={!canScrollNext}
      style={[styles.navButton, styles.nextButton, style, !canScrollNext && styles.disabled]}
    >
      <ArrowRight size={16} color="#0F172A" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  content: {
    flexGrow: 0,
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
  },
  navButton: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  prevButton: {
    left: 8,
    top: "50%",
    marginTop: -16,
  },
  nextButton: {
    right: 8,
    top: "50%",
    marginTop: -16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
