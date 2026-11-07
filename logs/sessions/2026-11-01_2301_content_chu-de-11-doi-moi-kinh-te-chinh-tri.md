# Bổ sung tài liệu chủ đề 11 — Đổi mới kinh tế và chính trị

## Bối cảnh / yêu cầu

Người dùng yêu cầu đọc cấu trúc dự án rồi thêm nội dung chi tiết chủ đề 11 theo thư mục chủ đề 05; liên hệ sáp nhập, tinh gọn bộ máy ở Việt Nam hiện nay. Yêu cầu bổ sung này cho phép tạo nội dung trong `Presents/` dù mô tả cũ trong `CLAUDE.md` gọi đây là nguồn chỉ đọc.

## Đã làm

- Đọc cấu trúc `Presents/`, giáo trình Markdown, app, log và mẫu chủ đề 05. `MLN111_FE/` hiện có hai file văn bản; `source-recap/` chứa tư liệu ảnh/video.
- Tạo `Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/` với 8 file Markdown: README, lý thuyết chi tiết, tóm tắt, slides, hook, câu hỏi phản biện, trắc nghiệm và tài liệu tham khảo.
- Bản lý thuyết có 12 phần: khái niệm, hai chiều quan hệ, yêu cầu kết hợp, bài học Đổi mới, mốc sắp xếp, ví dụ TP.HCM, chính quyền 2 cấp, điều kiện/rủi ro, giải pháp và chỉ số đánh giá.
- Dùng nguồn giáo trình tại chỗ và nguồn chính thức, gắn số liệu tổ chức với đợt sắp xếp năm 2025; bổ sung thông tin Kết luận 76-KL/TW ngày 28/7/2026. Phân biệt sự kiện, phân tích cơ chế, lợi ích kỳ vọng và tình huống giả định.
- Giữ định dạng câu phản biện phù hợp parser hiện hữu: `N. **câu hỏi**` và dòng `*Gợi ý:*` kế tiếp.
- Cập nhật danh mục `Presents/README.md`, mô tả thư mục trong `CLAUDE.md` và dòng trạng thái của phiên.

## Kiểm tra

- Kiểm tra bằng Python: đủ 8 file, không có ký tự thay thế lỗi; mọi đường dẫn file nội bộ tồn tại.
- Đủ 15 slide đánh số liên tục, 12 câu phản biện có gợi ý, 15 câu trắc nghiệm có 60 lựa chọn và 15 dòng đáp án giải thích.
- `git diff --check` cho danh mục và trạng thái không có lỗi whitespace; Git chỉ cảnh báo chuyển LF sang CRLF. Lần kiểm tra nội dung đầu gặp khác biệt encoding của Python stdin trên PowerShell; chạy lại với biểu thức Unicode escape và đã đạt.

## Còn thiếu / lưu ý cho phiên sau

- Không còn việc bắt buộc trong phạm vi biên soạn. Đây là tài liệu Markdown, chưa tạo PPTX hay ingest vào database; người dùng chưa yêu cầu hai việc đó.
- Không chạy seed vì tác động database không cần thiết cho yêu cầu tài liệu. Số lượng LessonUnit ghi ở mô tả app không được suy ra là đã tăng.
- Working tree đã có nhiều thay đổi từ trước, bao gồm chủ đề 05 và giao diện app; không sửa các phần đó.
- Mô tả cũ về repo chưa có Git trong một số tài liệu đã lạc hậu; thực tế có `.git`. Dùng cấu hình `safe.directory` theo từng lệnh để đọc diff, không sửa cấu hình Git toàn cục.
