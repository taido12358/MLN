# 2026-09-09 → 2026-09-10 — Xây dựng ứng dụng lớp học tương tác

*(Log dựng lại từ bộ nhớ phiên trước, vì thư mục `logs/` được tạo sau khi việc này đã xong.
Ngày tháng lấy theo thời gian sửa đổi file trong `app/`.)*

## Bối cảnh / yêu cầu

Người dùng cần một ứng dụng web kiểu Kahoot/Slido cho môn Lý luận chính trị (LLCT),
dùng cho lớp ~70 sinh viên. Yêu cầu rõ: "ấn tượng"/"sịn", tên miền riêng (không dùng
Claude Artifact), có Docker, có gamification (điểm số + leaderboard real-time + huy
hiệu). Người dùng chủ động chọn tự động sinh câu hỏi quiz từ **toàn bộ giáo trình**
(không chỉ 10 chủ đề thuyết trình đã soạn sẵn), dù việc này tăng quy mô dữ liệu đáng kể.

## Đã làm

- Tạo app tại `app/`, dockerized, **không dùng Redis** — 1 instance API duy nhất giữ
  room state trong bộ nhớ + Postgres cho dữ liệu bền vững.
- **Stack**: Next.js 14 (`apps/web`) + Express/Socket.io (`apps/api`) + Postgres/Prisma
  (`packages/db`) + hợp đồng event/scoring dùng chung (`packages/shared`).
- **Nguồn nội dung** (chỉ đọc, nằm ngoài `app/`):
  - `Presents/01..10-*/` — 10 chủ đề thuyết trình, mỗi chủ đề có `slides.md` +
    `cau-hoi-phan-bien.md`.
  - `giao-trinh-llct/md/*.md` — 5 giáo trình đầy đủ. Thư mục gốc tiếng Việt có dấu
    (`Giáo trình LLCT`) gây lỗi Unicode NFC/NFD thật sự khi qua Docker/nhiều tool khác
    nhau → đã đổi tên sang ASCII. **Không đổi lại tên thư mục này.**
- Ingest thành **425 `LessonUnit`** (10 từ thuyết trình + ~415 chunk giáo trình, tách
  theo heading `Chương N` — **không** theo `##`/`###` vì các heading đó chỉ là artifact
  ngắt trang PDF trong 3/5 file giáo trình).
- Sinh quiz bằng AI gọi Anthropic (`claude-sonnet-5`) qua tool-use, kết quả luôn ở trạng
  thái `DRAFT` — giáo viên phải duyệt/publish thủ công tại `/host/content`, **không bao
  giờ tự động publish**.
- Đăng nhập giáo viên bằng mật khẩu trong `app/.env` (`ADMIN_PASSWORD`, giá trị demo
  `giaovien123`). Chưa có `ANTHROPIC_API_KEY` lúc build — tính năng AI-generate trả lỗi
  in-app một cách graceful cho tới khi set key.

## Quyết định & lý do

- Không dùng Redis vì quy mô 70 người dùng đồng thời không cần scale-out nhiều
  instance — giữ đơn giản.
- Tách chunk giáo trình theo `Chương N` thay vì markdown heading vì heading trong PDF
  export không phản ánh cấu trúc thật.

## Việc tiếp theo (tại thời điểm đó)

- Cần set `ANTHROPIC_API_KEY` thật để tính năng AI-generate quiz hoạt động.
- Kiến trúc đầy đủ, data model, socket event contract, công thức tính điểm nằm ở
  `C:\Users\ADMIN\.claude\plans\radiant-whistling-rabbit.md` — đọc file này trước khi
  sửa sâu vào app.

## Lưu ý cho phiên sau

- Chạy: `docker compose up -d` từ `app/`, sau đó `docker compose exec api npm run seed`
  một lần. Truy cập `http://localhost:8080`.
