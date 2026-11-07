# Xuất PowerPoint chủ đề 11

## Yêu cầu và bàn giao

Người dùng yêu cầu dựng slide và xuất PPTX từ nội dung chủ đề 11 đã biên soạn, tiếp nối kế hoạch video và nhạc nền.

Tệp bàn giao nằm tại `Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/Slide-Chu-de-11.pptx`, gồm 15 slide tỷ lệ 16:9. Lựa chọn thiết kế là nền kem, điểm nhấn đỏ trầm, phông Arial và ảnh tư liệu. Chữ và hai bảng so sánh giữ dạng chỉnh sửa được. Lời dẫn và nguồn nằm trong ghi chú từng slide.

## Nghe nhìn

- Nhúng ba đoạn WAV dài 8, 15 và 12 giây, cắt từ “A Kind Of Hope” của Scott Buckley, có chỉnh âm lượng và fade. Ghi công CC BY 4.0 trong ghi chú và dòng cuối bài.
- Gắn âm thanh với thao tác bấm dòng “Nghe nhạc” ở slide 1, 5, 15 bằng sound action chuẩn DrawingML.
- Máy chủ video VTV trả HTTP 400 khi tải file, kể cả sau kiểm tra lại yêu cầu. Đã dùng ảnh xem trước và liên kết nguồn ở slide 5, 8, 9, 10, 11. Video cần Internet và phát tại trang nguồn.
- Ảnh bổ sung gồm TP.HCM của Báo Người Lao Động và cảng Cái Mép của SGGP. Nguồn ảnh được ghi trong notes.

## Kiểm tra và giới hạn

- Dựng, sửa và render qua Artifact Session. Đã xem riêng đủ 15 slide và sửa chỗ chồng dòng ở slide 2. Bổ sung rõ vai trò quyết định của kinh tế và tính độc lập tương đối của chính trị trên slide 7.
- Xuất từ Artifact Session, thêm audio bằng xử lý gói Open XML, chạy finalizer trên đúng tệp có audio.
- Đạt kiểm tra package integrity, geometry, font policy Arial, 15 slide, hai native table ở slide 4 và 12, và import qua Artifact Tool. Báo cáo lưu riêng trong `.codex-build/topic11-pptx/validation.json`.
- Kiểm tra ba đoạn WAV nhúng, action âm thanh và liên kết VTV. Tệp bàn giao giữ nguyên SHA-256 của bản đã xác thực.
- Máy không có Microsoft PowerPoint để kiểm thử phát âm thanh trong ứng dụng đích. Ghi nhận đây là giới hạn khi bàn giao.
- Tài nguyên xây dựng và ảnh xem thử nằm riêng trong `.codex-build/topic11-pptx/`.
