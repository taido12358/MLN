/**
 * End-to-end smoke test for the Socket.io real-time layer: simulates one full classroom session
 * (host + 3 students) against a REAL running api process + Postgres. NOT part of `npm test` (that
 * stays mock-only, no external services) — this is a manual verification script, run like:
 *
 *   DATABASE_URL=... API_URL=http://localhost:3099 npx tsx apps/api/src/socket/__test__/live-session.test.ts
 *
 * with the api process already running against the same DATABASE_URL. Exits non-zero on any
 * assertion failure so it's usable as a pass/fail gate, not just eyeballed output.
 */
import { PrismaClient } from "@prisma/client";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import * as Events from "@mln/shared";

const API_URL = process.env.API_URL ?? "http://localhost:3099";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "devpass";

const prisma = new PrismaClient();

let failures = 0;
function assert(cond: unknown, message: string) {
  if (!cond) {
    failures += 1;
    console.error(`❌ ${message}`);
  } else {
    console.log(`✅ ${message}`);
  }
}

function waitFor<T>(socket: ClientSocket, event: string): Promise<T> {
  return new Promise((resolve) => socket.once(event, (payload: T) => resolve(payload)));
}

function emitAck<TReq, TRes>(socket: ClientSocket, event: string, payload: TReq): Promise<TRes> {
  return new Promise((resolve) => socket.emit(event, payload, (res: TRes) => resolve(res)));
}

async function main() {
  // --- fixtures: one Presents lesson unit, 2 published quiz questions, use its 1st discussion question ---
  const lessonUnit = await prisma.lessonUnit.findFirst({
    where: { sourceType: "PRESENTATION" },
    include: { discussionQuestions: { orderBy: { orderIndex: "asc" }, take: 1 } },
  });
  if (!lessonUnit) throw new Error("Không có LessonUnit PRESENTATION nào — chạy seed trước.");
  const discussionQuestion = lessonUnit.discussionQuestions[0];
  if (!discussionQuestion) throw new Error("LessonUnit không có DiscussionQuestion.");

  const q1 = await prisma.quizQuestion.create({
    data: {
      lessonUnitId: lessonUnit.id,
      question: "[TEST] 2 + 2 = ?",
      options: ["3", "4", "5", "6"],
      correctIndex: 1,
      explanation: "2+2=4",
      sourceQuote: "test fixture",
      difficulty: "EASY",
      status: "PUBLISHED",
      source: "MANUAL",
    },
  });
  const q2 = await prisma.quizQuestion.create({
    data: {
      lessonUnitId: lessonUnit.id,
      question: "[TEST] Thủ đô Việt Nam là?",
      options: ["Hà Nội", "TP.HCM", "Đà Nẵng", "Huế"],
      correctIndex: 0,
      explanation: "Hà Nội",
      sourceQuote: "test fixture",
      difficulty: "EASY",
      status: "PUBLISHED",
      source: "MANUAL",
    },
  });

  // --- auth + room creation via REST ---
  const loginRes = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  const { token } = (await loginRes.json()) as { token: string };
  assert(!!token, "Đăng nhập admin lấy JWT thành công");

  const roomRes = await fetch(`${API_URL}/api/admin/rooms`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ lessonUnitIds: [lessonUnit.id] }),
  });
  const { code: roomCode, hostToken } = (await roomRes.json()) as { code: string; hostToken: string };
  assert(!!roomCode && !!hostToken, `Tạo phòng thành công: code=${roomCode}`);

  // --- connect sockets ---
  const host = ioClient(API_URL, { auth: { roomCode, hostToken } });
  await waitFor(host, "connect");

  const alice = ioClient(API_URL);
  const bob = ioClient(API_URL);
  const carol = ioClient(API_URL);
  await Promise.all([waitFor(alice, "connect"), waitFor(bob, "connect"), waitFor(carol, "connect")]);

  const aliceJoin = await emitAck<Events.ParticipantJoinPayload, Events.ParticipantJoinAck>(
    alice,
    Events.PARTICIPANT_JOIN,
    { roomCode, nickname: "Alice" },
  );
  const bobJoin = await emitAck<Events.ParticipantJoinPayload, Events.ParticipantJoinAck>(bob, Events.PARTICIPANT_JOIN, {
    roomCode,
    nickname: "Bob",
  });
  const carolJoin = await emitAck<Events.ParticipantJoinPayload, Events.ParticipantJoinAck>(
    carol,
    Events.PARTICIPANT_JOIN,
    { roomCode, nickname: "Carol" },
  );
  assert(!!aliceJoin.participantId && !!bobJoin.participantId && !!carolJoin.participantId, "3 học sinh join thành công");

  // --- Q1: Alice correct+fast, Bob correct+slow, Carol wrong ---
  const openedQ1 = waitFor<Events.QuizQuestionOpenedPayload>(alice, Events.QUIZ_QUESTION_OPENED);
  await emitAck(host, Events.HOST_OPEN_QUESTION, { roomCode, quizQuestionId: q1.id, timeLimitSec: 5 });
  await openedQ1;

  const aliceAns1 = await emitAck<Events.QuizSubmitAnswerPayload, Events.QuizSubmitAnswerAck>(
    alice,
    Events.QUIZ_SUBMIT_ANSWER,
    { roomCode, questionId: q1.id, selectedIndex: 1, clientTimestamp: Date.now() },
  );
  assert(aliceAns1.correct === true && aliceAns1.pointsAwarded >= 900, `Alice đúng nhanh: ${JSON.stringify(aliceAns1)}`);

  await new Promise((r) => setTimeout(r, 1500));
  const bobAns1 = await emitAck<Events.QuizSubmitAnswerPayload, Events.QuizSubmitAnswerAck>(
    bob,
    Events.QUIZ_SUBMIT_ANSWER,
    { roomCode, questionId: q1.id, selectedIndex: 1, clientTimestamp: Date.now() },
  );
  assert(
    bobAns1.correct === true && bobAns1.pointsAwarded < aliceAns1.pointsAwarded,
    `Bob đúng chậm hơn nên điểm thấp hơn Alice: ${JSON.stringify(bobAns1)}`,
  );

  const carolAns1 = await emitAck<Events.QuizSubmitAnswerPayload, Events.QuizSubmitAnswerAck>(
    carol,
    Events.QUIZ_SUBMIT_ANSWER,
    { roomCode, questionId: q1.id, selectedIndex: 2, clientTimestamp: Date.now() },
  );
  assert(carolAns1.correct === false && carolAns1.pointsAwarded === 0, `Carol sai, 0 điểm: ${JSON.stringify(carolAns1)}`);

  const closedQ1 = waitFor<Events.QuizQuestionClosedPayload>(alice, Events.QUIZ_QUESTION_CLOSED);
  await emitAck(host, Events.HOST_FORCE_CLOSE_QUESTION, { roomCode });
  const closedQ1Payload = await closedQ1;
  assert(
    closedQ1Payload.optionCounts[1] === 2 && closedQ1Payload.optionCounts[2] === 1 && closedQ1Payload.totalAnswered === 3,
    `optionCounts đúng sau khi đóng câu 1: ${JSON.stringify(closedQ1Payload.optionCounts)}`,
  );

  // --- Q2: Alice + Bob correct again (streak=2 for both -> +50 streak bonus), Carol correct too ---
  const openedQ2 = waitFor<Events.QuizQuestionOpenedPayload>(alice, Events.QUIZ_QUESTION_OPENED);
  await emitAck(host, Events.HOST_OPEN_QUESTION, { roomCode, quizQuestionId: q2.id, timeLimitSec: 5 });
  await openedQ2;

  const aliceAns2 = await emitAck<Events.QuizSubmitAnswerPayload, Events.QuizSubmitAnswerAck>(
    alice,
    Events.QUIZ_SUBMIT_ANSWER,
    { roomCode, questionId: q2.id, selectedIndex: 0, clientTimestamp: Date.now() },
  );
  assert(aliceAns2.streak === 2, `Alice streak lên 2 sau 2 câu đúng liên tiếp: streak=${aliceAns2.streak}`);
  await emitAck(host, Events.HOST_FORCE_CLOSE_QUESTION, { roomCode });

  // --- discussion phase ---
  const opened = waitFor<Events.DiscussionOpenedPayload>(alice, Events.DISCUSSION_OPENED);
  await emitAck(host, Events.HOST_OPEN_DISCUSSION, { roomCode, discussionQuestionId: discussionQuestion.id });
  await opened;

  const newPostSeenByBob = waitFor<Events.DiscussionNewPostPayload>(bob, Events.DISCUSSION_NEW_POST);
  const alicePost = await emitAck<Events.DiscussionSubmitPostPayload, { postId: string } | { error: string }>(
    alice,
    Events.DISCUSSION_SUBMIT_POST,
    { roomCode, discussionQuestionId: discussionQuestion.id, content: "Đây là câu trả lời thử của Alice." },
  );
  assert("postId" in alicePost, `Alice đăng bài thảo luận: ${JSON.stringify(alicePost)}`);
  await newPostSeenByBob;
  const postId = "postId" in alicePost ? alicePost.postId : "";

  const updateSeenByCarol = waitFor<Events.DiscussionPostUpdatedPayload>(carol, Events.DISCUSSION_POST_UPDATED);
  const bobUpvote = await emitAck<Events.DiscussionUpvotePayload, { ok: true } | { error: string }>(
    bob,
    Events.DISCUSSION_UPVOTE,
    { roomCode, postId },
  );
  assert("ok" in bobUpvote, `Bob upvote bài Alice thành công: ${JSON.stringify(bobUpvote)}`);
  const carolUpvote = await emitAck<Events.DiscussionUpvotePayload, { ok: true } | { error: string }>(
    carol,
    Events.DISCUSSION_UPVOTE,
    { roomCode, postId },
  );
  assert("ok" in carolUpvote, "Carol upvote bài Alice thành công");
  const selfUpvote = await emitAck<Events.DiscussionUpvotePayload, { ok: true } | { error: string }>(
    alice,
    Events.DISCUSSION_UPVOTE,
    { roomCode, postId },
  );
  assert("error" in selfUpvote, `Alice KHÔNG được tự upvote bài mình: ${JSON.stringify(selfUpvote)}`);
  const dupUpvote = await emitAck<Events.DiscussionUpvotePayload, { ok: true } | { error: string }>(
    bob,
    Events.DISCUSSION_UPVOTE,
    { roomCode, postId },
  );
  assert("error" in dupUpvote, `Bob KHÔNG được upvote 2 lần: ${JSON.stringify(dupUpvote)}`);
  await updateSeenByCarol;

  await emitAck(host, Events.HOST_CLOSE_DISCUSSION, { roomCode });

  // --- leaderboard ---
  const lbUpdate = waitFor<Events.LeaderboardUpdatePayload>(alice, Events.LEADERBOARD_UPDATE);
  await emitAck(host, Events.HOST_SHOW_LEADERBOARD, { roomCode });
  const lb = await lbUpdate;
  const aliceRow = lb.topN.find((r) => r.participantId === aliceJoin.participantId);
  const bobRow = lb.topN.find((r) => r.participantId === bobJoin.participantId);
  assert(
    !!aliceRow && !!bobRow && aliceRow.rank === 1 && aliceRow.score > bobRow.score,
    `Alice dẫn đầu bảng xếp hạng (điểm quiz nhanh hơn + upvote): ${JSON.stringify(lb.topN)}`,
  );

  const whereAmI = await emitAck<Events.LeaderboardWhereAmIPayload, Events.LeaderboardWhereAmIAck>(
    carol,
    Events.LEADERBOARD_WHERE_AM_I,
    { roomCode },
  );
  assert(whereAmI.rank === 3 && whereAmI.participantCount === 3, `Carol tự tra cứu thứ hạng đúng: ${JSON.stringify(whereAmI)}`);

  // --- reconnect: Bob disconnects and rejoins with his old participantId, must NOT create a new row ---
  bob.disconnect();
  await new Promise((r) => setTimeout(r, 300));
  const bob2 = ioClient(API_URL);
  await waitFor(bob2, "connect");
  const bobRejoin = await emitAck<Events.ParticipantJoinPayload, Events.ParticipantJoinAck>(bob2, Events.PARTICIPANT_JOIN, {
    roomCode,
    nickname: "Bob",
    participantId: bobJoin.participantId,
  });
  assert(bobRejoin.participantId === bobJoin.participantId, `Bob reconnect giữ nguyên participantId: ${bobRejoin.participantId}`);

  // --- endRoom + badges ---
  const ended = waitFor<Events.RoomEndedPayload>(alice, Events.ROOM_ENDED);
  await emitAck(host, Events.HOST_END_ROOM, { roomCode });
  const endPayload = await ended;
  console.log("Badges by participant:", JSON.stringify(endPayload.badgesByParticipant, null, 2));
  const aliceBadges = endPayload.badgesByParticipant[aliceJoin.participantId] ?? [];
  assert(aliceBadges.includes("bat-bai"), `Alice có badge 'bat-bai' (2/2 đúng): ${aliceBadges}`);
  assert(aliceBadges.includes("quan-quan"), `Alice có badge 'quan-quan' (hạng 1): ${aliceBadges}`);
  assert(aliceBadges.includes("ngoi-but-phan-bien"), `Alice có badge 'ngoi-but-phan-bien' (bài nhiều upvote nhất): ${aliceBadges}`);

  const roomAfter = await prisma.room.findUnique({ where: { code: roomCode } });
  assert(roomAfter?.state === "ENDED", `Room.state = ENDED sau host:endRoom (đọc từ DB): ${roomAfter?.state}`);
  const participantRowsFinal = await prisma.participant.count({ where: { roomId: roomAfter!.id } });
  assert(participantRowsFinal === 3, `Vẫn đúng 3 Participant sau reconnect (không tạo trùng): ${participantRowsFinal}`);

  for (const s of [host, alice, bob2, carol]) s.disconnect();

  console.log(`\n${failures === 0 ? "TẤT CẢ PASS" : `${failures} CHECK THẤT BẠI`}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
