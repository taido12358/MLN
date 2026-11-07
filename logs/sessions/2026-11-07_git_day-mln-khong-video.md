# Đưa thư mục MLN lên Git

## Yêu cầu

Đưa dự án tại thư mục gốc MLN lên Git, loại toàn bộ `source-recap` và các tệp video.

## Kho đích

Remote `origin` trỏ đến `https://github.com/taido12358/MLN.git`, nhánh `master`.

## Chuẩn bị lịch sử và quy tắc loại trừ

Kho có một commit cục bộ chưa công bố `b4e499d` chứa cả video và source-recap. Tạo nhánh sao lưu cục bộ `codex/local-before-publish-b4e499d`, sau đó dựng lại phần thay đổi trên `origin/master` để các tệp bị loại không xuất hiện trong commit sắp gửi. Giữ nguyên các tệp trên đĩa.

Thêm `/source-recap/` và các mẫu phần mở rộng video không phân biệt hoa thường vào `.gitignore`. Loại 15 đường dẫn khỏi index, gồm toàn bộ 10 tệp trong source-recap và 5 tệp MOV, WEBM, MP4 bên ngoài thư mục đó. Giữ các tệp TypeScript `.ts`, đồng thời kiểm tra nội dung để phát hiện video transport stream có cùng đuôi.

## Kiểm tra trước khi gửi

- `origin/master` hiện có không chứa những đường dẫn bị loại.
- Index còn 342 tệp trước khi thêm nhật ký phiên, không có source-recap hoặc tệp video.
- Các tệp bị loại vẫn giữ nguyên kích thước trên máy.
- Các gói PPTX, ZIP được kiểm tra và không chứa tệp video nhúng.
- Không có tệp lớn hơn 100 MB trong phần sẽ gửi.
- Không có tệp môi trường bí mật được theo dõi. Kiểm tra mẫu khóa riêng và token trong các tệp văn bản thay đổi không có phát hiện.

Lệnh push chỉ nhắm `HEAD:refs/heads/master`. Nhánh sao lưu cục bộ không nằm trong phạm vi push.
