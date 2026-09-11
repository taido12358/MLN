# 0003 — Câu hỏi AI sinh ra luôn ở trạng thái DRAFT, không tự động publish

**Ngày**: 2026-09-09 · **Khu vực**: api/web

## Quyết định

Quiz question do AI (Anthropic `claude-sonnet-5` qua tool-use) sinh ra luôn được lưu
với trạng thái `DRAFT`. Chỉ giáo viên mới có thể publish, thực hiện thủ công tại
`/host/content`.

## Lý do

Nội dung môn Lý luận chính trị nhạy cảm về mặt học thuật/chính trị — không thể để AI
tự động đưa câu hỏi (có thể sai hoặc lệch chuẩn) thẳng vào bài quiz sinh viên làm mà
không qua kiểm duyệt của con người.

## Hệ quả cho agent sau

- **Không** thêm đường tắt/flag nào cho phép auto-publish câu hỏi AI sinh ra, kể cả để
  tiện demo/test — nếu cần seed dữ liệu cho test, seed thẳng bằng script với trạng thái
  rõ ràng, không đi qua luồng AI-generate rồi auto-publish.
- Route/API sinh quiz phải luôn trả về object có field trạng thái `DRAFT`; UI
  `/host/content` là nơi duy nhất đổi trạng thái sang publish.
