# Animation và khóa ô địa phương đã hoàn thành

Người dùng yêu cầu thêm animation cho 34 tỉnh, thành, làm mờ và khóa địa phương sau khi hoàn thành câu hỏi.

Đã thêm CSS keyframes cho các ô xuất hiện lần lượt, chuyển động khi rê và bấm chuột, hiệu ứng chuyển mờ sau khi đóng lời giải. Giữ vị trí ô trên bảng với độ mờ 38 phần trăm, chuyển xám và nút disabled. Câu đã trả lời đúng hoặc đã mở lời giải đều kết thúc lượt và bị khóa. Câu trả lời sai hoặc chưa hoàn thành tiếp tục mở được.

Thêm kiểm tra trạng thái tại đầu hàm mở câu, giữ khóa sau tải lại từ kết quả đã lưu, bỏ qua câu hoàn thành khi chọn ngẫu nhiên và chuyển focus tới ô còn chơi được. Chơi lại từ đầu mở khóa toàn bộ. Thiết bị bật giảm chuyển động áp dụng trạng thái mờ ngay.

Đã kiểm tra animation thực chạy, trạng thái cuối, chặn cả click và sự kiện kích hoạt trực tiếp, giữ điểm, tải lại, chọn ngẫu nhiên, reset và giảm chuyển động. Chạy lại đủ 34 luồng câu hỏi với tổng điểm 340 và xác nhận cả 34 ô khóa sau hoàn thành. Đã xem ảnh bảng có ô hoàn thành chuyển mờ. Hướng dẫn và bản HTML tự chứa đã cập nhật.
