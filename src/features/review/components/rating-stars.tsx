import { Star } from "lucide-react";

import { MAX_RATING } from "../types";

interface RatingStarsProps {
  /** 1..5. */
  value: number;
}

/**
 * A rating drawn as stars.
 *
 * The stars are decorative and the number is announced instead: five separate
 * icons would otherwise be read out one by one, and "bintang bintang bintang"
 * tells a screen reader user nothing.
 */
export function RatingStars({ value }: RatingStarsProps) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: MAX_RATING }).map((_star, index) => (
        <Star
          key={index}
          className={
            index < value
              ? "size-4 fill-amber-400 text-amber-400"
              : "text-muted-foreground/40 size-4"
          }
          aria-hidden
        />
      ))}
      <span className="sr-only">{`${value} dari ${MAX_RATING} bintang`}</span>
    </span>
  );
}
