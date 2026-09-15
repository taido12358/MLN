# Đề xuất nâng cấp chức năng — phiên phân tích (chưa code)

## Bối cảnh / yêu cầu

Người dùng yêu cầu đọc toàn bộ app (`app/apps/web`, `app/apps/api`, `app/packages/shared`,
`app/packages/db/prisma/schema.prisma`) và gợi ý hướng nâng cấp chức năng. Đây là phiên
**phân tích, chưa sửa code** — người dùng yêu cầu lưu lại danh sách để một phiên sau tiếp
tục triển khai.

Các file đã đọc để lấy căn cứ: `schema.prisma`, `packages/shared/src/{events.ts,scoring.ts}`,
`apps/api/src/socket/handlers/{host.ts,participant.ts}`, `apps/api/src/rest/admin/{generate.ts,rooms.ts}`,
`apps/web/src/app/{host/rooms/[roomCode],host/content,play/[roomCode]}/page.tsx`.

## Đề xuất — Ưu tiên cao (vá lỗ hổng vận hành, ít công sức)

1. **Thêm nút "sinh hàng loạt" vào UI `/host/content`.** Backend đã có sẵn
   `POST /api/admin/generate-quiz/batch` + `GET /generate-quiz/batch/status`
   (`apps/api/src/rest/admin/generate.ts:29-55`), nhưng `host/content/page.tsx` (dòng
   161-172) chỉ gọi generate từng `LessonUnit` một. Với ~425 `LessonUnit`, giáo viên phải
   bấm tay từng cái. Cần: nút "Sinh câu hỏi cho toàn bộ nội dung chưa có" + poll
   `batch/status` hiện thanh tiến độ.
2. **Danh sách "ai chưa trả lời" cho host.** Hiện chỉ có đếm số qua `quiz:answerCount`
   (`packages/shared/src/events.ts:175-180`). Server đã giữ `answeredParticipantIds`
   trong `roomState.ts` — chỉ cần broadcast thêm danh sách nickname chưa trả lời để host
   nhắc trực tiếp.
3. **Xoá bài đăng thảo luận không phù hợp.** `socket/handlers/discussion.ts` chưa có
   `host:deletePost` — với nội dung LLCT nhạy cảm, giáo viên cần gỡ 1 bài lệch chuẩn ngay,
   không chỉ đóng cả vòng thảo luận.
4. **Export CSV kết quả buổi học.** Sau `HOST_END_ROOM` (`socket/handlers/host.ts:269-360`),
   dữ liệu (điểm, câu trả lời từng SV, bài thảo luận, badge) chỉ nằm trong Postgres — không
   có endpoint export. Việc nhỏ (1 REST endpoint + `csv-stringify`), giá trị cao cho giáo
   viên chấm điểm chuyên cần/thái độ.

## Đề xuất — Ưu tiên trung bình

5. **"+10 giây" khi câu hỏi đang mở** — hiện chỉ có đóng sớm
   (`HOST_FORCE_CLOSE_QUESTION`), không có cách kéo dài thời gian.
6. **Kéo-thả sắp xếp lại giỏ hàng trước khi tạo phòng** — `host/content/page.tsx:41-43`
   chỉ thêm/bớt theo thứ tự click, `orderIndex` của `RoomPlaylistItem` cố định theo đó.
7. **"Chế độ tự luyện tập" sau giờ học** (không tính điểm/leaderboard) — tận dụng gần như
   100% dữ liệu `LessonUnit`/`QuizQuestion` đã publish sẵn, cho sinh viên tự ôn sau buổi
   học thay vì chỉ dùng được lúc real-time.
8. **Hiện `DiscussionQuestion.suggestedAnswer` cho giáo viên khi chiếu thảo luận** —
   trường này đã có trong schema (`schema.prisma:82`) nhưng không thấy hiển thị ở
   `HostRoomPage` — giáo viên không có "phao" để dẫn dắt thảo luận.

## Đề xuất — Ưu tiên thấp (mở rộng phạm vi, cân nhắc lại so với "Ngoài phạm vi MVP" trong
kiến trúc gốc `radiant-whistling-rabbit.md`)

9. Xuất báo cáo PDF đẹp thay vì CSV thô.
10. Điểm tích luỹ nhiều buổi cho cùng 1 sinh viên (hiện điểm reset theo từng `Room`).
11. Chặn 1 nickname đăng nhập đồng thời từ 2 thiết bị (hiện `participant:join` cho phép
    reconnect nhưng không phát hiện 2 socket cùng `participantId` active song song).

## Còn thiếu / việc tiếp theo

Chưa triển khai bất kỳ mục nào ở trên. Người dùng đồng ý hướng ưu tiên mục 1 + 4 trước
(sinh hàng loạt trong UI, export CSV) — tận dụng hạ tầng có sẵn, rủi ro thấp. Phiên sau
nên bắt đầu từ đây nếu người dùng xác nhận lại thứ tự này.

## Lưu ý cho phiên sau

- Đây thuần là backlog/đề xuất — chưa có quyết định kỹ thuật nào bị khoá, chưa cần file
  trong `decisions/`.
- Trước khi code, đọc lại `STATUS.md` để tránh trùng với agent khác đang đụng
  `apps/web/host` hoặc `apps/api/rest/admin`.
