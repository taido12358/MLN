"use client";

import { create } from "zustand";
import type { Socket } from "socket.io-client";
import {
  ROOM_PARTICIPANT_JOINED,
  QUIZ_QUESTION_OPENED,
  QUIZ_ANSWER_COUNT,
  QUIZ_QUESTION_CLOSED,
  DISCUSSION_OPENED,
  DISCUSSION_CLOSED,
  DISCUSSION_NEW_POST,
  DISCUSSION_POST_UPDATED,
  ROOM_LESSON_UNIT_SELECTED,
  LEADERBOARD_UPDATE,
  ROOM_ENDED,
  type RoomStateValue,
  type QuizQuestionOpenedPayload,
  type QuizAnswerCountPayload,
  type QuizQuestionClosedPayload,
  type DiscussionOpenedPayload,
  type DiscussionNewPostPayload,
  type DiscussionPostUpdatedPayload,
  type LeaderboardRow,
  type RoomEndedPayload,
  type RoomStateSnapshot,
} from "@mln/shared";

interface RoomStore {
  roomCode: string | null;
  participantId: string | null;
  nickname: string | null;
  roomState: RoomStateValue | null;
  participantCount: number;
  currentLessonUnitTitle: string | null;

  currentQuestion: QuizQuestionOpenedPayload | null;
  answerCount: QuizAnswerCountPayload | null;
  questionClosed: QuizQuestionClosedPayload | null;
  myLastAnswer: { pointsAwarded: number; correct: boolean; correctIndex: number; streak: number } | null;
  myScore: number;

  discussionQuestion: DiscussionOpenedPayload | null;
  posts: DiscussionNewPostPayload[];

  leaderboard: LeaderboardRow[];
  ended: RoomEndedPayload | null;

  setIdentity: (roomCode: string, participantId: string, nickname: string) => void;
  addMyAnswerResult: (r: { pointsAwarded: number; correct: boolean; correctIndex: number; streak: number }) => void;
  /** Applied every time `participant:join`/`viewer:join` acks — including on socket.io's automatic
   * reconnect after a network blip, not just on first mount (see play/[roomCode]/page.tsx and
   * leaderboard/[roomCode]/page.tsx). The snapshot carries whatever "resume" content the server
   * could reconstruct for the room's current state (current question, open discussion + its posts
   * so far, or the leaderboard) — QUIZ_REVIEW/ENDED aren't reconstructed server-side, so a rejoin
   * during those two brief states still degrades to that view's own loading placeholder. */
  syncFromJoin: (snapshot: RoomStateSnapshot) => void;
  attach: (socket: Socket) => () => void;
  reset: () => void;
}

const initial = {
  roomCode: null,
  participantId: null,
  nickname: null,
  roomState: null as RoomStateValue | null,
  participantCount: 0,
  currentLessonUnitTitle: null,
  currentQuestion: null,
  answerCount: null,
  questionClosed: null,
  myLastAnswer: null,
  myScore: 0,
  discussionQuestion: null,
  posts: [],
  leaderboard: [],
  ended: null,
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  ...initial,

  setIdentity: (roomCode, participantId, nickname) => set({ roomCode, participantId, nickname }),

  addMyAnswerResult: (r) => set((s) => ({ myLastAnswer: r, myScore: s.myScore + r.pointsAwarded })),

  syncFromJoin: (snapshot) =>
    set({
      roomState: snapshot.state,
      participantCount: snapshot.participantCount,
      ...(snapshot.currentLessonUnitTitle !== undefined && { currentLessonUnitTitle: snapshot.currentLessonUnitTitle }),
      ...(snapshot.currentQuestion !== undefined && {
        currentQuestion: snapshot.currentQuestion,
        answerCount: null,
        questionClosed: null,
        myLastAnswer: null,
      }),
      ...(snapshot.discussionQuestion !== undefined && {
        discussionQuestion: snapshot.discussionQuestion,
        posts: snapshot.discussionPosts ?? [],
      }),
      ...(snapshot.leaderboard !== undefined && { leaderboard: snapshot.leaderboard }),
    }),

  attach: (socket) => {
    const onParticipantJoined = (p: { participantCount: number }) => set({ participantCount: p.participantCount });
    const onLessonUnitSelected = (p: { lessonUnitTitle: string }) =>
      set({ currentLessonUnitTitle: p.lessonUnitTitle, roomState: "PRESENTING" });
    const onQuestionOpened = (p: QuizQuestionOpenedPayload) =>
      set({
        currentQuestion: p,
        answerCount: null,
        questionClosed: null,
        myLastAnswer: null,
        roomState: "QUIZ_QUESTION",
      });
    const onAnswerCount = (p: QuizAnswerCountPayload) => set({ answerCount: p });
    const onQuestionClosed = (p: QuizQuestionClosedPayload) => set({ questionClosed: p, roomState: "QUIZ_REVIEW" });
    const onDiscussionOpened = (p: DiscussionOpenedPayload) =>
      set({ discussionQuestion: p, posts: [], roomState: "DISCUSSION_OPEN" });
    const onDiscussionClosed = () => set({ roomState: "DISCUSSION_CLOSED" });
    const onNewPost = (p: DiscussionNewPostPayload) => set((s) => ({ posts: [...s.posts, p] }));
    const onPostUpdated = (p: DiscussionPostUpdatedPayload) =>
      set((s) => ({ posts: s.posts.map((post) => (post.postId === p.postId ? { ...post, upvotes: p.upvotes } : post)) }));
    const onLeaderboardUpdate = (p: { topN: LeaderboardRow[] }) => set({ leaderboard: p.topN, roomState: "LEADERBOARD" });
    const onRoomEnded = (p: RoomEndedPayload) => set({ ended: p, leaderboard: p.finalLeaderboard, roomState: "ENDED" });

    socket.on(ROOM_PARTICIPANT_JOINED, onParticipantJoined);
    socket.on(ROOM_LESSON_UNIT_SELECTED, onLessonUnitSelected);
    socket.on(QUIZ_QUESTION_OPENED, onQuestionOpened);
    socket.on(QUIZ_ANSWER_COUNT, onAnswerCount);
    socket.on(QUIZ_QUESTION_CLOSED, onQuestionClosed);
    socket.on(DISCUSSION_OPENED, onDiscussionOpened);
    socket.on(DISCUSSION_CLOSED, onDiscussionClosed);
    socket.on(DISCUSSION_NEW_POST, onNewPost);
    socket.on(DISCUSSION_POST_UPDATED, onPostUpdated);
    socket.on(LEADERBOARD_UPDATE, onLeaderboardUpdate);
    socket.on(ROOM_ENDED, onRoomEnded);

    return () => {
      socket.off(ROOM_PARTICIPANT_JOINED, onParticipantJoined);
      socket.off(ROOM_LESSON_UNIT_SELECTED, onLessonUnitSelected);
      socket.off(QUIZ_QUESTION_OPENED, onQuestionOpened);
      socket.off(QUIZ_ANSWER_COUNT, onAnswerCount);
      socket.off(QUIZ_QUESTION_CLOSED, onQuestionClosed);
      socket.off(DISCUSSION_OPENED, onDiscussionOpened);
      socket.off(DISCUSSION_CLOSED, onDiscussionClosed);
      socket.off(DISCUSSION_NEW_POST, onNewPost);
      socket.off(DISCUSSION_POST_UPDATED, onPostUpdated);
      socket.off(LEADERBOARD_UPDATE, onLeaderboardUpdate);
      socket.off(ROOM_ENDED, onRoomEnded);
    };
  },

  reset: () => set(initial),
}));
