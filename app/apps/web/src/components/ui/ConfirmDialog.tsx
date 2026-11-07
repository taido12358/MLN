"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./Button";

/** Shared confirmation modal — replaces raw `window.confirm()` calls (inconsistent — used for
 * "Kết thúc phòng học?" but not for deleting a quiz question) with one consistent dialog reused
 * for: delete quiz question, delete discussion post, end room. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-gold/70 bg-panel shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            {/* red-envelope band */}
            <div className="h-2 bg-red-envelope" />
            <div className="p-6">
              <h2 className="text-lg font-bold text-ink">{title}</h2>
              {description && <p className="mt-2 text-sm text-muted">{description}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  Huỷ
                </Button>
                <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm}>
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
