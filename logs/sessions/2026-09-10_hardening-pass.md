# 2026-09-10 — Rà soát và vá lỗi sau bản build đầu

*(Log dựng lại từ bộ nhớ phiên trước. Xem [2026-09-09_build-classroom-app.md](2026-09-09_build-classroom-app.md)
để biết bối cảnh ứng dụng.)*

## Bối cảnh / yêu cầu

Người dùng yêu cầu "review carefully" (rà soát kỹ) bản build ban đầu. Việc rà soát phát
hiện các lỗi thật sự, không phải chỉnh sửa hình thức.

## Đã làm

- `packages/shared/src/normalize.ts` (`normalizeOptions`): thêm guard chống
  `QuizQuestion.options` bị malformed.
- `RoomStateSnapshot` (`events.ts`): thêm các field "resume" (câu hỏi hiện tại /
  discussion + posts / leaderboard) để khi client (re)join, họ thấy nội dung đang diễn
  ra thay vì màn hình trống.
- Thêm socket event `viewer:join` riêng cho trang chiếu chỉ-đọc
  `/leaderboard/[roomCode]` — event này chỉ `socket.join()`, **không** tạo
  `Participant`. Trước khi vá, trang này hoàn toàn không hoạt động.
- Thêm cascade delete vào `schema.prisma`.
- Gộp 7 instance `new PrismaClient()` riêng lẻ thành 1 Prisma client dùng chung.
- Thêm input validation + rate-limiting cho cả REST endpoints và socket handlers.

## Lưu ý cho phiên sau

- Sau khi sửa `packages/shared`, phải **rebuild cả 2 image `api` và `web`** —
  `packages/shared` không có build step riêng, được dùng trực tiếp qua `tsx` trong
  container api và qua webpack/Next trong web. Sửa xong mà không rebuild là bug im lặng.
