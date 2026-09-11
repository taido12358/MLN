# Dự án: MLN — ứng dụng lớp học tương tác (LLCT)

Đây là bức tranh **hiện trạng** của dự án. Dự án này có thể được **nhiều agent làm việc
song song** — trước khi động vào code, đọc theo thứ tự:

1. [`logs/README.md`](logs/README.md) — quy ước điều phối nhiều agent (đặt tên file
   log tránh trùng, cách cập nhật bảng trạng thái mà không ghi đè agent khác).
2. [`logs/STATUS.md`](logs/STATUS.md) — ai đang làm gì ngay lúc này, để tránh 2 agent
   cùng sửa 1 khu vực.
3. [`logs/decisions/`](logs/decisions/) — các quyết định kỹ thuật đã chốt kèm lý do.
4. [`logs/issues/ISSUES.md`](logs/issues/ISSUES.md) — việc còn thiếu / lỗi đã biết.
5. [`logs/sessions/`](logs/sessions/) — lịch sử chi tiết theo thời gian.

Khi bắt đầu việc mới đáng kể: thêm dòng vào `STATUS.md`, làm việc, rồi thêm 1 file
trong `logs/sessions/` (không sửa file log của agent khác) và chuyển dòng của mình
trong `STATUS.md` sang "Gần đây đã xong". Đừng chỉ sửa file `CLAUDE.md` này thay cho
việc ghi log.

Repo này **không phải git repository** — không có `git log`/`git blame` để tra cứu
lịch sử, nên `logs/` là nguồn duy nhất. Nếu nhiều agent sửa code song song, cân nhắc đề
xuất người dùng chạy `git init` để có version control thật (xem `logs/issues/ISSUES.md`).

## Cấu trúc thư mục

- `app/` — ứng dụng web (xem chi tiết bên dưới). Đây là phần code chính.
- `Presents/` — 10 chủ đề thuyết trình gốc (`01..10-*/slides.md` +
  `cau-hoi-phan-bien.md`). Chỉ đọc, dùng làm nguồn nội dung để ingest vào app.
- `giao-trinh-llct/md/` — 5 giáo trình LLCT đầy đủ dạng markdown. Chỉ đọc. Tên thư mục
  đã được đổi từ tiếng Việt có dấu sang ASCII để tránh lỗi Unicode NFC/NFD qua
  Docker/tool khác nhau — **không đổi lại**.
- `logs/` — nhật ký các phiên làm việc (xem trên).

## Ứng dụng (`app/`)

Web app kiểu Kahoot/Slido cho lớp Lý luận chính trị (~70 sinh viên): điểm số,
leaderboard real-time, huy hiệu.

**Stack**: Next.js 14 (`app/apps/web`) + Express/Socket.io (`app/apps/api`) +
Postgres/Prisma (`app/packages/db`) + hợp đồng event/scoring dùng chung
(`app/packages/shared`). Không dùng Redis — 1 instance API giữ room state trong bộ
nhớ + Postgres cho dữ liệu bền vững.

Nội dung được ingest thành 425 `LessonUnit` (10 từ `Presents/` + ~415 chunk từ
`giao-trinh-llct/`, tách theo heading `Chương N`). AI sinh câu hỏi quiz gọi Anthropic
(`claude-sonnet-5`) qua tool-use, luôn ở trạng thái `DRAFT` — giáo viên duyệt/publish
thủ công tại `/host/content`, không bao giờ tự động publish.

**Chạy app**:
```
cd app
docker compose up -d
docker compose exec api npm run seed   # chỉ chạy 1 lần
```
Truy cập `http://localhost:8080`. Mật khẩu giáo viên nằm trong `app/.env`
(`ADMIN_PASSWORD`). Cần set `ANTHROPIC_API_KEY` trong `app/.env` để tính năng
AI-generate quiz hoạt động (nếu chưa set, tính năng trả lỗi in-app một cách graceful).

**Kiến trúc chi tiết** (data model, socket event contract, công thức tính điểm):
`C:\Users\ADMIN\.claude\plans\radiant-whistling-rabbit.md` — đọc trước khi sửa sâu.

**Lưu ý quan trọng**: sau khi sửa `app/packages/shared`, phải rebuild cả 2 image `api`
và `web` (`docker compose up -d --build`) — package này không có build step riêng.
