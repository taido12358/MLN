# Cải thiện toàn diện app — UI kit dùng chung + 5 tính năng backlog

## Bối cảnh / yêu cầu

Người dùng yêu cầu "cải thiện lại toàn bộ trang web". Khi hỏi phạm vi, người dùng chọn cả
4 hướng: UI/UX, tính năng còn thiếu, chất lượng code/hiệu năng, và "tất cả". Plan chi
tiết: `C:\Users\ADMIN\.claude\plans\quiet-imagining-flask.md`.

2 agent khám phá song song đọc toàn bộ `apps/web/src`, `apps/api/src`,
`packages/shared/src`, `schema.prisma` trước khi lập plan — phát hiện: không có design
system (5 bản leaderboard-row trùng lặp, 3 bản "centered message"), trang duyệt AI-quiz
`/host/content` fetch sẵn `source`/`difficulty`/`sourceQuote`/`contentMarkdown`/
`suggestedAnswer` nhưng không hiển thị cái nào, và vài bug thật (field `running` bị đè
trong response batch-status, màu `global-error.tsx` lệch token, `timeLimitSec` chỉ clamp
HTML attribute không clamp state, `LessonUnitPanel.load()` thiếu try/catch).

## Đã làm

### 1. Nền tảng dùng chung (`apps/web/src`)
- `theme-tokens.ts` — nguồn màu duy nhất, `tailwind.config.ts` và `global-error.tsx` đều
  import từ đây (hết lệch màu).
- `components/ui/{Button,Input,Card,Badge,ProgressBar,CenteredMessage,Spinner,
  ConfirmDialog}.tsx` — bộ UI kit đầu tiên của app (trước đây không có `components/`).
- `components/{LeaderboardList,QuizOptionTile}.tsx` + `lib/quizOptions.ts` — thay ~5 bản
  leaderboard-row và 2 bản option-tile trùng lặp giữa `play`, `leaderboard`, `host/rooms`.
- `lib/storage.ts`, `hooks/useAdminToken.ts`, `lib/socket.ts` (`emitWithAck`) — gộp logic
  localStorage/redirect-guard/emit-ack từng copy-paste ở nhiều trang.
- `app/not-found.tsx` mới — trước đây route lạ rơi vào 404 mặc định của Next, không đồng
  bộ theme.
- Thêm dependency `clsx` + `lucide-react` (`apps/web/package.json`).

### 2. Backend (`apps/api`, `packages/shared`)
- Sửa bug field `running` bị đè ở `GET /generate-quiz/batch/status`
  (`rest/admin/generate.ts`) — response giờ tách rõ `pending/runningJobs/doneCount/
  failedCount/isRunning`.
- 3 event mới trong `packages/shared/src/events.ts`: `HOST_EXTEND_QUESTION_TIME`/
  `QUIZ_TIME_EXTENDED`, `HOST_GET_UNANSWERED` (request/ack, không broadcast để tránh lộ
  cho học viên), `HOST_DELETE_POST`/`DISCUSSION_POST_DELETED`.
- Handler mới: `socket/handlers/host.ts` (extend time — cộng dồn `timeLimitMs`, reschedule
  `closeTimer`, không tính lại điểm các câu đã nộp trước khi gia hạn; get-unanswered —
  diff `answeredParticipantIds` với participant đang connected), `socket/handlers/
  discussion.ts` (`host:deletePost`, cascade xoá `PostUpvote` qua schema có sẵn).
- Endpoint mới `GET /api/admin/rooms/:code/export.csv` (`rest/admin/rooms.ts`) — CSV viết
  tay (không thêm dependency), đọc thẳng Postgres (an toàn kể cả sau khi phòng đã kết
  thúc/roomState bị clear), gồm bảng điểm+badge, chi tiết câu trả lời, bài thảo luận.

### 3. Wiring từng trang (`apps/web/src/app`)
- `page.tsx`, `host/page.tsx`: dùng UI kit, sửa lệch validation mã phòng (giờ đúng 6 ký
  tự khớp `CODE_CHARS` bên backend), thêm toggle hiện/ẩn mật khẩu.
- `host/content/page.tsx`: nút "Sinh câu hỏi cho nội dung chưa có" + poll progress bar
  (dùng response đã sửa ở mục 2); `QuizQuestionRow` hiện badge AI/thủ công + độ khó +
  trích dẫn nguồn thu gọn + banner cảnh báo khi sửa câu đã publish + confirm dialog trước
  xoá; `LessonUnitPanel` hiện nội dung gốc (collapsible) + gợi ý trả lời thảo luận + có
  try/catch/retry khi load lỗi.
- `host/rooms/[roomCode]/page.tsx`: mọi lệnh host qua `emitWithAck` (giờ có phản hồi lỗi
  thật thay vì im lặng); panel "Chưa trả lời" (poll 3s); nút "+10 giây"; nút xoá trên mỗi
  bài thảo luận ở projector preview; hiện gợi ý dẫn dắt thảo luận; nút "Tải CSV kết quả";
  `activeUnit` tự đồng bộ khi lessonUnit đổi từ nguồn khác (nextStep, tab host khác);
  clamp `timeLimitSec` thật trong state.
- `play/[roomCode]/page.tsx`, `leaderboard/[roomCode]/page.tsx`: dùng
  `LeaderboardList`/`QuizOptionTile` dùng chung; `leaderboard` thêm chỉ báo mất kết nối +
  làm nổi bật mã phòng; sửa `participantId` unused, thêm `aria-label` upvote,
  `maxLength=500` ô thảo luận.
- `store/useRoomStore.ts`: thêm listener `quiz:timeExtended`/`discussion:postDeleted`.

### Quyết định: bỏ qua 2 mục backlog
Kéo-thả sắp xếp playlist và "chế độ tự luyện tập" — cả 2 lớn hơn hẳn phần còn lại (tính
năng sản phẩm mới, không phải vá UI/1 event), để lại `logs/issues/ISSUES.md`.

## Kiểm thử

`docker compose up -d --build` — cả `api`+`web` build sạch (Next.js type-check pass khi
build), 4 container healthy. Test qua Chrome thật (không chỉ đọc code): đăng nhập host,
mở `/host/content` xác nhận badge/trích dẫn/nội dung gốc/gợi ý hiển thị đúng, confirm
dialog xoá câu hỏi; tạo phòng RLFF97, vào host console: mở câu hỏi → chấm điểm đúng công
thức (715đ, streak +844/50), bấm "+10 giây" xác nhận đồng hồ học viên nhảy 13s→23s ngay
lập tức, panel "Chưa trả lời" đúng tên khi 1/2 người chưa trả lời, mở thảo luận → đăng bài
→ xoá từ host → bài biến mất real-time ở tab học viên, bảng xếp hạng đúng, kết thúc phòng
→ badge tính đúng (Bất bại + Quán quân) hiện cả 2 phía, tải CSV → nội dung đúng (bảng
điểm/câu trả lời chi tiết/thảo luận). `/leaderboard/RLFF97` độc lập hiện đúng mã phòng nổi
bật. Route lạ → trang 404 mới thay vì mặc định Next.

## Lưu ý cho phiên sau

- Tool `computer` (click theo toạ độ) của Claude-in-Chrome khá chập chờn trong phiên này
  (nhiều lần click sai/screenshot timeout) — chuyển sang click bằng `ref` hoặc
  `javascript_tool` + `document.querySelector(...).click()` đáng tin cậy hơn nhiều.
- Phòng test `RLFF97` với 2 participant giả ("SV Test", "SV Cham Tay") còn nằm trong DB —
  không có endpoint xoá room, để nguyên (dữ liệu test vô hại, không lẫn với dữ liệu thật).
- 2 mục bị gạt ra (kéo-thả playlist, tự luyện tập) vẫn còn nguyên trong ISSUES.md, ưu tiên
  thấp hơn phần đã làm.
