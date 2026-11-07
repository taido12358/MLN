# Minigame dễ đọc trên màn chiếu lớp học

## Yêu cầu

Người dùng trình chiếu cho lớp khoảng 70 sinh viên, cần chữ lớn và ưu tiên dễ nhìn.

## Thay đổi

- Thêm `projector.css` vào bước build HTML tự chứa. Trên máy tính, chữ câu hỏi 30–44px, đáp án 26–36px, tăng kích thước tên tỉnh, số điểm, nút bấm và nhãn.
- Tăng độ tương phản chữ, đường viền đáp án và trạng thái được chọn. Tiêu đề dùng màu chữ rõ, giảm độ đậm nền ánh sáng chuyển động.
- Hộp câu hỏi sử dụng gần toàn bộ màn hình. Nội dung đáp án có vùng cuộn riêng, câu hỏi và hàng nút kiểm tra, xem lời giải, quay lại luôn hiển thị. Khi hoàn thành, vùng đáp án chuyển sang lời giải.
- Tab điểm dành diện tích cho chín đội, tên đội và số điểm lớn. Giảm phần giới thiệu trùng lặp để bảng điểm nằm gọn trong màn chiếu.
- Bố cục bản đồ gọn hơn, thông tin tỉnh đang trỏ vào được phóng lớn. Giữ chức năng zoom để chọn các tỉnh nhỏ.
- Cập nhật hướng dẫn mở toàn màn hình và cách dùng vùng cuộn.

Nguồn chỉnh sửa tại `.codex-build/topic11-minigame/projector.css` và `build.mjs`. Đầu ra tại `Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html`.

## Kiểm chứng

- `qa-projector.mjs` đạt ở 1920×1080 và 1366×768. Kiểm tra chữ câu hỏi, vùng cuộn, nhập đáp án, chấm điểm, kết quả, đủ chín đội trên màn hình và bố cục mobile 390px.
- Bảng điểm chín đội kết thúc tại khoảng 972px trên màn 1080px và 750px trên màn 768px.
- `qa-projector-flows.mjs` chạy lại toàn bộ 34 dạng câu đố tại 1366×768, đạt tổng 340 điểm, lưu tiến độ, khóa câu, trả lời lại, file protocol và mobile.
- Xem ảnh câu hỏi tại hai kích thước, bảng điểm và toàn cảnh bản đồ. Không có lỗi JavaScript hoặc tràn ngang trong các bài kiểm tra.

## Hoàn thành

Đã cập nhật HTML và hướng dẫn cho màn chiếu lớp học.
