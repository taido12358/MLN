# Làm mới đồ họa và màu sắc minigame

## Yêu cầu

Cải thiện hiệu ứng, đồ họa giao diện và màu sắc, dùng nền trắng. Tiếp tục phục vụ màn chiếu lớp 70 sinh viên và tám nhóm gồm 1–7, 9.

## Thực hiện

- Thêm `theme.css` vào bước build, dùng nền trắng cho trang, bản đồ, bảng thông tin, hộp câu hỏi và bảng điểm. Bảng màu nhấn xanh dương, xanh ngọc và cam, chữ xanh đậm có tương phản rõ.
- Bản đồ phân biệt ba khu vực bằng màu, tỉnh đang chọn có viền sáng, tên tỉnh xuất hiện với chuyển động ngắn. Màu số tỉnh trong bảng thông tin thay đổi theo vùng.
- Tám ô điểm có màu nhấn riêng, xếp bốn cột và hai hàng trên máy tính. Nhóm đang trả lời có viền và bóng nhấn.
- Đổi màu đáp án đã chọn, nút, ô nhập, khung lời giải, pháo giấy và điểm bay. Nút có hiệu ứng ánh sáng lướt và phản hồi bấm.
- Dùng viền, bóng nhẹ và chuyển động ngắn. Giữ cỡ chữ lớn và thiết lập giảm chuyển động. Nền trang trắng, tắt các mảng sáng màu sau trang.
- Cập nhật hướng dẫn và màu thanh trình duyệt.

## Kiểm chứng

- `qa-white-theme.mjs` đạt nền trắng, chữ câu hỏi lớn, chấm điểm, khóa câu, đủ tám nhóm trên màn hình, không tràn ngang, giảm chuyển động và mobile tại 1920×1080, 1366×768, 390×844.
- Kiểm tra tên tỉnh chuyển động, viền sáng bản đồ, 80 mảnh pháo giấy và điểm thưởng đúng kết quả khi bật chuyển động.
- `qa-fixed-eight-groups.mjs` đạt danh sách tám nhóm và chuyển dữ liệu ván cũ.
- Xem ảnh bản đồ, hộp câu hỏi và bảng điểm. Phát hiện và sửa ưu tiên CSS hover làm nền đáp án đã chọn nhạt, bảo đảm chữ trắng luôn đi cùng nền xanh đậm. Kiểm tra tương tự cho chữ đã ghép và lưới tìm chữ.

## Hoàn thành

HTML tự chứa đã được dựng lại tại `Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html`.
