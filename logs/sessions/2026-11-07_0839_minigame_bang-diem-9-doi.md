# Tab bảng điểm chín đội

Người dùng yêu cầu thêm tab điểm cho chín đội trong HTML và tự cộng điểm khi trả lời đúng.

Đã cập nhật minigame thành chín đội, thêm hai tab Trò chơi và Bảng điểm 9 đội. Tab điểm hiển thị thứ hạng, tổng điểm, số câu đúng và chi tiết đội trả lời từng câu. Có ô chọn đội trên đầu trang và nút chọn đội từ tab điểm, hỗ trợ đổi tên chín đội.

Giữ cách tính điểm 10/7/5 theo lần kiểm tra đáp án. Điểm lấy từ kết quả của từng câu để ngăn cộng lặp. Khi mở dữ liệu ván trước có 2–4 đội, bổ sung đội còn thiếu và giữ nguyên tên, điểm, tiến độ, bản nháp và số lần thử.

Đã kiểm tra bằng Playwright qua file HTML trực tiếp. Các kiểm tra gồm cộng đúng đội 9, quay lượt về đội 1, quy tắc 10/7/5, mở lời giải 0 điểm, giữ điểm sau tải lại, đổi tên, ngăn chấm trùng, chi tiết từng câu, chuyển dữ liệu cũ, hủy và xác nhận chơi lại, tab bàn phím và màn hình di động. Chạy lại đủ 34 luồng câu hỏi, tổng điểm 340, không phát sinh lỗi JavaScript.

Mã dựng riêng nằm trong `.codex-build/topic11-minigame/`. Đã cập nhật bản HTML bàn giao, hướng dẫn chơi và mục lục tài liệu. Phạm vi thay đổi chỉ liên quan minigame và nhật ký phiên.
