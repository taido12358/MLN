# 0002 — Tách nội dung giáo trình theo heading "Chương N", không theo `##`/`###`

**Ngày**: 2026-09-09 · **Khu vực**: content/db

## Quyết định

Khi ingest `giao-trinh-llct/md/*.md` thành các `LessonUnit`, script chia nhỏ (chunk)
theo pattern heading `Chương N`, bỏ qua markdown heading level (`##`, `###`).

## Lý do

3/5 file giáo trình có `##`/`###` là artifact của việc export PDF sang markdown (đánh
dấu ngắt trang), **không phản ánh cấu trúc nội dung thật**. Heading `Chương N` mới là
ranh giới nội dung đáng tin cậy trong cả 5 file.

## Hệ quả cho agent sau

- Nếu sửa lại script ingest, **đừng** đổi logic chunk sang dùng markdown heading level
  mà không kiểm tra lại cả 5 file — sẽ tạo ra chunk sai (cắt giữa đoạn văn tại điểm
  ngắt trang PDF).
- Nếu thêm giáo trình mới, kiểm tra file đó có heading `Chương N` nhất quán không
  trước khi ingest bằng logic hiện tại.
