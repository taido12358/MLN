# 0001 — Không dùng Redis, giữ 1 instance API duy nhất

**Ngày**: 2026-09-09 · **Khu vực**: infra/api

## Quyết định

Room state (phòng đang mở, người tham gia, câu hỏi hiện tại) giữ trong bộ nhớ của
1 instance API duy nhất, không dùng Redis/pub-sub để scale-out nhiều instance.

## Lý do

Quy mô thực tế là ~70 sinh viên đồng thời trong 1 lớp học — không cần scale ngang.
Thêm Redis chỉ tăng độ phức tạp vận hành (thêm service trong `docker-compose.yml`,
thêm điểm lỗi) mà không giải quyết vấn đề thật nào ở quy mô này.

## Hệ quả cho agent sau

- **Không** deploy nhiều hơn 1 instance của service `api` — làm vậy sẽ làm vỡ room
  state (mỗi instance có state riêng, client join instance khác nhau sẽ thấy trạng
  thái khác nhau).
- Nếu tương lai cần scale (nhiều lớp học cùng lúc, nhiều instance), đây là quyết định
  cần xét lại đầu tiên — thêm Redis pub/sub cho socket.io hoặc chuyển room state sang
  Postgres/cache ngoài tiến trình.
