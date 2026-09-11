# 0004 — Đổi tên thư mục giáo trình sang ASCII (`giao-trinh-llct`)

**Ngày**: 2026-09-09/10 · **Khu vực**: content/infra

## Quyết định

Thư mục nguồn giáo trình gốc tên tiếng Việt có dấu (`Giáo trình LLCT`) được đổi tên
sang ASCII thuần: `giao-trinh-llct`.

## Lý do

Tên thư mục có dấu gây lỗi Unicode NFC/NFD **thật sự** (không phải lý thuyết) khi đi
qua Docker volume mount và nhiều tool khác nhau (macOS/Windows chuẩn hóa Unicode khác
nhau, filesystem trong container lại khác nữa) — dẫn đến path không khớp một cách khó
debug.

## Hệ quả cho agent sau

- **Không đổi tên thư mục này trở lại** tên có dấu, kể cả để "cho đẹp"/đúng chính tả.
- Nếu thêm thư mục nguồn nội dung mới có tên tiếng Việt có dấu, đặt tên ASCII ngay từ
  đầu để tránh lặp lại vấn đề này.
