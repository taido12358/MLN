# Bảng trạng thái — ai đang làm gì

Đọc [`README.md`](README.md) trước để hiểu quy tắc chỉnh sửa file này (chỉ thêm/sửa
dòng của chính mình).

**Cách dùng**: trước khi bắt đầu một việc đáng kể, đọc bảng "Đang làm" bên dưới — nếu
khu vực/file mình sắp sửa trùng với dòng nào đó, cân nhắc đổi hướng hoặc đợi. Sau đó
thêm 1 dòng mới cho việc của mình. Khi xong, chuyển dòng đó xuống "Gần đây đã xong" kèm
ngày hoàn thành, và (nếu đáng kể) link tới file trong `sessions/`.

## Đang làm

| Khu vực | Việc | Bắt đầu | Ghi chú |
|---|---|---|---|
| _(chưa có agent nào đang làm việc)_ | | | |

## Gần đây đã xong

| Khu vực | Việc | Hoàn thành | Log |
|---|---|---|---|
| web, api, shared | Cải thiện toàn diện: UI kit dùng chung, sửa gap trang duyệt AI-quiz, 5 tính năng backlog (sinh hàng loạt UI, CSV export, chưa-trả-lời, xoá bài thảo luận, +10s) | 2026-09-15 | [sessions/2026-09-15_1027_misc_cai-thien-toan-dien.md](sessions/2026-09-15_1027_misc_cai-thien-toan-dien.md) |
| infra/logs | Thiết lập `logs/`, `CLAUDE.md`, quy ước điều phối nhiều agent | 2026-09-11 | [logs/README.md](README.md) |
| infra | Build ứng dụng lớp học ban đầu (Next.js + Express/Socket.io + Postgres, Docker) | 2026-09-09/10 | [sessions/2026-09-09_build-classroom-app.md](sessions/2026-09-09_build-classroom-app.md) |
| api, shared, db | Hardening pass: resume state, validation, rate-limit, cascade delete, gộp Prisma client | 2026-09-10 | [sessions/2026-09-10_hardening-pass.md](sessions/2026-09-10_hardening-pass.md) |
