import { HTMLAttributes } from "react";
import clsx from "clsx";

/** Shared panel/card primitive — replaces the `rounded-lg`/`rounded-xl`/`rounded-2xl bg-panel p-*`
 * variants that had drifted apart per-page with no shared spacing/radius scale. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-2xl border border-white/5 bg-panel p-5", className)} {...rest} />;
}
