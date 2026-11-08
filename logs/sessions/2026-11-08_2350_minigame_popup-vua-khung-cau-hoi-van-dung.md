# Bản đồ dài hơn, popup vừa khung và câu hỏi vận dụng

## Đã làm

- Thêm `fit.css` vào quy trình build HTML tự chứa. Vùng bản đồ trên máy tính cao tối thiểu 820px, tăng theo màn hình; trên màn hình nhỏ tối thiểu 760px.
- Câu hỏi, phương án và nút điều khiển dùng bố cục gọn hơn. Popup tự đo nội dung và điều chỉnh mức hiển thị khi mở, đổi bước, hiện phản hồi, hiện lời giải hoặc thay kích thước màn hình. Không cần cuộn bên trong popup; ngăn trang nền cuộn khi popup mở. Ô tìm chữ dùng hai cột trên máy tính để giữ chữ lớn.
- Nâng độ khó 17 câu, giữ đủ 34 tỉnh và 34 dạng chơi. Thêm tình huống phân quyền, đối soát dữ liệu, đánh giá bằng chứng, chi phí chuyển đổi, tỷ lệ có trọng số, điểm phần trăm và suy luận nhân quả. Các số liệu mô phỏng có nhãn GIẢ ĐỊNH.
- Giữ đúng tám nhóm Nhóm 1–7 và Nhóm 9, cơ chế 10/7/5 điểm, lưu tiến độ, làm mờ và khóa tỉnh đã hoàn thành. Tăng revision cho câu đã sửa để làm mới bản nháp chưa hoàn thành, giữ kết quả đã chấm.
- Đồng bộ liên hệ về bản PPTX mới 14 trang. Màn kết và hướng dẫn nối từ phần slide, qua minigame, đến recap theo bố cục chương trình hiện tại.

## Kiểm tra

- Build thành công, kiểm tra cú pháp engine; xác nhận đủ 34 ID và 34 dạng độc nhất, lưới chữ 7×7, đủ mảnh ghép, số slide hợp lệ. Đối chiếu độc lập các bài tính Ninh Bình, Điện Biên, Lai Châu.
- Kiểm tra giao diện bằng trình duyệt trên các origin localhost riêng, không sửa điểm của file người dùng đang sử dụng.
- Hai câu được giải đúng lần đầu nhận 10 điểm; Điện Biên thử sai rồi đúng nhận 7 điểm. Các tỉnh tiếp tục khóa sau tải lại, bảng điểm giữ đúng nhóm và số điểm.
- Kiểm tra popup của 32 câu còn mở ở 1366×768 và 1024×600; các câu đã hoàn thành được kiểm tra riêng. Kiểm tra lời giải của 31 câu còn lại; không có nội dung tràn hoặc cuộn dọc popup.
- Kiểm tra Huế khi mở cả ba bước. Sau tối ưu ô tìm chữ, Lạng Sơn tại 1024×600 hiển thị ở tỷ lệ 1 và không tràn.
- Kiểm tra thêm 28 câu còn mở tại 1920×1080: tỷ lệ hiển thị 1, không tràn. Sáu dạng dài tại 390×844 đều vừa khung ở cả câu hỏi và lời giải.
- Lưu ảnh `popup-fit-1366.png`, `map-tall-1366.png` và số đo `qa-popup-fit.json` trong thư mục build minigame. Kiểm tra diff không có lỗi khoảng trắng.
- Công cụ trình duyệt không cho mở lại URL file cục bộ; người dùng cần tải lại hoặc mở lại HTML đã cập nhật. Các lượt kiểm tra dùng cùng HTML qua máy chủ thử riêng.

## Phạm vi

Không sửa PPTX, Vmix hoặc các video. Chưa commit/push trong lượt này.
