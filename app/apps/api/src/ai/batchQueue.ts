import pLimit from "p-limit";
import { prisma } from "../prismaClient.js";
import { generateQuizForLessonUnit } from "./generateQuiz.js";

const CONCURRENCY = 2;
const THROTTLE_MS = 700;
const MAX_RETRIES = 3;

// Single-process, single-flight guard: without this, an admin double-clicking "sinh hàng loạt" (or
// a retried request after a slow/timed-out first one) would enqueue the same lesson units twice —
// each gets generateQuizForLessonUnit called concurrently, producing duplicate draft quiz questions
// and doubling the Anthropic API calls for no reason. Only one batch may be in flight at a time.
let inFlight = 0;

export function isBatchRunning(): boolean {
  return inFlight > 0;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 429;
}

async function generateWithRetry(lessonUnitId: string, count: number) {
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      return await generateQuizForLessonUnit(lessonUnitId, count);
    } catch (err) {
      if (isRateLimitError(err) && attempt < MAX_RETRIES) {
        await sleep(2 ** attempt * 1000);
        continue;
      }
      throw err;
    }
  }
}

/** Fire-and-forget: kicks off generation for every given lessonUnitId, throttled to at most
 * CONCURRENCY parallel Anthropic calls with a small delay between each dispatch, tracked via
 * GenerationJob rows (see getBatchProgress). Does not block/await for the caller — the REST
 * handler that calls this returns 202 immediately and the client polls progress separately. */
export function enqueueBatchGeneration(lessonUnitIds: string[], count = 5): void {
  if (lessonUnitIds.length === 0) return;
  const limit = pLimit(CONCURRENCY);

  inFlight += lessonUnitIds.length;
  (async () => {
    for (const id of lessonUnitIds) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      limit(async () => {
        await sleep(THROTTLE_MS);
        try {
          await generateWithRetry(id, count);
        } catch (err) {
          console.error(`[batchQueue] lessonUnit ${id} thất bại:`, err);
        } finally {
          inFlight -= 1;
        }
      });
    }
  })();
}

export interface BatchProgress {
  pending: number;
  running: number;
  done: number;
  failed: number;
}

export async function getBatchProgress(): Promise<BatchProgress> {
  const [pending, running, done, failed] = await Promise.all([
    prisma.generationJob.count({ where: { status: "PENDING" } }),
    prisma.generationJob.count({ where: { status: "RUNNING" } }),
    prisma.generationJob.count({ where: { status: "DONE" } }),
    prisma.generationJob.count({ where: { status: "FAILED" } }),
  ]);
  return { pending, running, done, failed };
}
