"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { OPTION_STYLES, OPTION_SHAPES } from "@/lib/quizOptions";

/** One Kahoot-style colored answer tile. Interactive (student play view — clickable, selectable,
 * disableable) or a plain display copy (host console's projector preview) via the same component,
 * previously two independently hand-written implementations that had drifted apart. */
export function QuizOptionTile({
  index,
  label,
  interactive,
  selected,
  disabled,
  size = "md",
  onClick,
}: {
  index: number;
  label: string;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  size?: "md" | "lg";
  onClick?: () => void;
}) {
  const classes = clsx(
    "flex flex-col items-center justify-center gap-2 rounded-2xl text-center font-bold text-white shadow-lg transition hover:brightness-110",
    OPTION_STYLES[index],
    size === "lg" ? "p-6 text-xl" : "min-h-[110px] p-3 text-sm",
    selected && "ring-4 ring-gold",
    disabled && !selected && "opacity-50"
  );

  const content = (
    <>
      <span className={size === "lg" ? "text-3xl" : "text-2xl"}>{OPTION_SHAPES[index]}</span>
      <span className="leading-tight">{label}</span>
    </>
  );

  if (!interactive) return <div className={classes}>{content}</div>;

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      aria-label={`Đáp án ${OPTION_SHAPES[index]}: ${label}`}
      aria-pressed={selected}
      className={clsx("tap-target", classes)}
    >
      {content}
    </motion.button>
  );
}
