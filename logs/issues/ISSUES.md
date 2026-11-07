# Việc còn thiếu / lỗi đã biết / giới hạn hiện tại

Quy ước: thêm dòng mới ở cuối mục phù hợp kèm ngày. Khi giải quyết xong, **chuyển**
dòng đó sang "Đã giải quyết" kèm ngày giải quyết + link tới `sessions/` hoặc
`decisions/` liên quan — đừng xóa hẳn.

## Đang mở

- **2026-09-09** — `ANTHROPIC_API_KEY` chưa được set trong `app/.env` (đã kiểm tra lại
  2026-09-11: vẫn trống). Tính năng AI-generate quiz trả lỗi in-app graceful cho tới
  khi có key thật. *(infra)*
- **2026-09-09** — Repo `C:\Users\ADMIN\Downloads\MLN` không phải git repository →
  không có version control thật, không thể revert/diff qua git. Cân nhắc `git init`
  khi có nhiều agent cùng sửa code để tránh mất việc do ghi đè file. *(infra)*

- **2026-09-11** — Backlog đề xuất nâng cấp chức năng: 2 mục còn lại chưa triển khai —
  kéo-thả sắp xếp lại playlist trước khi tạo phòng, chế độ tự luyện tập sau giờ học
  (không tính điểm). Cả 2 bị gạt khỏi phiên 2026-09-15 vì là tính năng sản phẩm lớn hơn
  hẳn phần còn lại của backlog. Chi tiết gốc:
  [`../sessions/2026-09-11_1201_misc_de-xuat-nang-cap.md`](../sessions/2026-09-11_1201_misc_de-xuat-nang-cap.md).
  *(web, api)*
- **2026-09-23** — Volume Postgres mới (trống) chưa có bảng: `npm run seed` lỗi `P2021` cho tới
  khi chạy `docker compose exec api npx prisma db push --schema /repo/packages/db/prisma/schema.prisma`
  trước. `CLAUDE.md` chỉ ghi bước seed — nên bổ sung bước push, hoặc thêm `prisma db push` vào
  entrypoint của image `api`. *(infra)*

## Đã giải quyết

- **2026-09-11** (giải quyết 2026-09-15) — 6 mục backlog: nút "sinh hàng loạt" quiz AI
  trong UI `/host/content`, danh sách "ai chưa trả lời" cho host, xoá bài thảo luận không
  phù hợp, export CSV kết quả buổi học, "+10 giây" khi câu hỏi đang mở, hiện
  `suggestedAnswer` cho host lúc mở thảo luận. Cùng phiên còn dựng UI kit dùng chung và
  sửa loạt bug nhỏ (field `running` bị đè ở batch-status, màu `global-error.tsx` lệch
  token, `timeLimitSec` không clamp state thật, `LessonUnitPanel.load()` thiếu
  try/catch). Xem
  [`../sessions/2026-09-15_1027_misc_cai-thien-toan-dien.md`](../sessions/2026-09-15_1027_misc_cai-thien-toan-dien.md).

- **2026-09-10** (giải quyết cùng ngày phát hiện) — Trang chiếu chỉ-đọc
  `/leaderboard/[roomCode]` hoàn toàn không hoạt động vì thiếu socket event join riêng
  cho viewer (join sẽ tạo nhầm thành `Participant`). Đã thêm event `viewer:join`. Xem
  [`../sessions/2026-09-10_hardening-pass.md`](../sessions/2026-09-10_hardening-pass.md).
- **2026-09-10** — 7 instance `new PrismaClient()` riêng lẻ rải rác trong code có thể
  gây rò rỉ connection pool. Đã gộp thành 1 client dùng chung. Xem log hardening pass.
