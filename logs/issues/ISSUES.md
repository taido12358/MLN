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

## Đã giải quyết

- **2026-09-10** (giải quyết cùng ngày phát hiện) — Trang chiếu chỉ-đọc
  `/leaderboard/[roomCode]` hoàn toàn không hoạt động vì thiếu socket event join riêng
  cho viewer (join sẽ tạo nhầm thành `Participant`). Đã thêm event `viewer:join`. Xem
  [`../sessions/2026-09-10_hardening-pass.md`](../sessions/2026-09-10_hardening-pass.md).
- **2026-09-10** — 7 instance `new PrismaClient()` riêng lẻ rải rác trong code có thể
  gây rò rỉ connection pool. Đã gộp thành 1 client dùng chung. Xem log hardening pass.
