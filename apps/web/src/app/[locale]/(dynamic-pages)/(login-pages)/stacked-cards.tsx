"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";

const CARD_COLORS = ["#266678", "#cb7c7a", "#36a18b", "#cda35f", "#747474"];
const CARD_OFFSET = 5;
const SCALE_FACTOR = 0.06;

interface CardStackProps {
  images: string[];
  interval?: number;
}

function withSequentialKey(
  imageUrl: string,
  index: number,
  totalImages: number
) {
  return `${imageUrl}?id=${index * totalImages}`;
}

export const StackedCards: React.FC<CardStackProps> = ({
  images,
  interval = 6000,
}) => {
  const [cards, setCards] = useState<string[]>(() =>
    images.map((url, index) => withSequentialKey(url, index, images.length))
  );

  const moveToEnd = () => {
    setCards((prevCards) => {
      const [firstCard, ...rest] = prevCards;
      return [...rest, firstCard];
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      moveToEnd();
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className="relative flex items-center justify-center">
      <AspectRatio className="relative w-full" ratio={16 / 10}>
        <ul className="relative h-full w-full">
          <AnimatePresence initial={false}>
            {cards.map((imageUrl, index) => {
              const canDrag = index === 0;
              const color = CARD_COLORS[index % CARD_COLORS.length];

              return (
                <motion.li
                  animate={{
                    opacity: 1,
                    scale: 1 - index * SCALE_FACTOR,
                    top: index * -CARD_OFFSET,
                    zIndex: cards.length - index,
                  }}
                  className="pointer-events-none absolute inset-0 origin-top-center select-none list-none rounded-lg border-2 border-foreground"
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: { duration: 0.2 },
                  }}
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  key={imageUrl}
                  style={{
                    backgroundColor: color,
                    cursor: canDrag ? "grab" : "auto",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full w-full bg-transparent">
                    <Image
                      alt={`Card ${index + 1}`}
                      className="rounded-md object-cover"
                      fill
                      loader={({ src }) => src}
                      src={imageUrl}
                    />
                  </Card>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </AspectRatio>
    </div>
  );
};
