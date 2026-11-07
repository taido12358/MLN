# Đồng bộ PPTX, minigame và nghe nhìn chủ đề 11

## Yêu cầu

Cập nhật PowerPoint theo Markdown đã biên tập, điều chỉnh câu hỏi minigame để nối với bài và viết lại kế hoạch video âm thanh. Người dùng bổ sung yêu cầu đọc giáo trình trong `giao-trinh-llct/md` để bài đúng chủ đề.

## Đối chiếu giáo trình

Đã đọc phần quan hệ cơ sở hạ tầng và kiến trúc thượng tầng, đặc biệt mục ý nghĩa trong đời sống xã hội trong giáo trình Triết học Mác–Lênin. Đối chiếu phần tổng kết 10 năm đổi mới tại trang in 286–287 của giáo trình Lịch sử Đảng. Bổ sung rõ đổi mới kinh tế là trọng tâm, đổi mới chính trị từng bước phù hợp. Sáp nhập và tinh gọn được đặt trong phạm vi đổi mới tổ chức, cùng với phương thức lãnh đạo, pháp quyền, trách nhiệm và thực thi.

## Đã cập nhật

- Dựng 15 slide 16:9 với Artifact Tool. Bốn biểu đồ tại slide 5, 8 và 9 là biểu đồ PowerPoint có workbook dữ liệu nhúng. Ba bảng ở slide 4, 6 và 14 chỉnh sửa được. Ghi chú từng slide theo nội dung Markdown và có nguồn.
- Nhúng ba đoạn WAV 8, 15 và 12 giây tại slide 1, 7 và 15, phát bằng thao tác bấm chữ. Video VTV mở trực tuyến tại slide 7, 9, 10 và 11.
- Chép ba đoạn MP3 vào thư mục `am-thanh` để nghe và điều phối riêng.
- Viết lại toàn bộ `ke-hoach-video-am-thanh.md` cho 15 slide, tổng lịch 19 phút 30 giây. Có nguồn video, chức năng từng đoạn, lời dẫn, thời lượng phát và hướng dẫn nhạc. Điểm cắt IN/OUT theo file nguồn vẫn cần chốt khi tập dượt trực tiếp.
- Sửa nội dung tám câu Hà Nội, Quảng Ninh, Hà Tĩnh, Nghệ An, Đắk Lắk, TP.HCM, Đồng Tháp và Cà Mau. Bổ sung liên hệ bài học cho Phú Thọ, Điện Biên và An Giang. Giữ 34 địa phương và 34 dạng câu đố.
- Lời giải hiển thị nguồn riêng và slide liên quan. Bản nháp chưa xong của câu đã đổi nội dung được làm mới theo revision. Điểm và khóa câu đã hoàn thành được bảo toàn, bản nháp câu giữ nguyên tiếp tục dùng.
- Đồng bộ lời nối minigame, `hook.md`, README và tài liệu tham khảo.

## Tệp giao

`Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/Slide-Chu-de-11-Sau-minigame.pptx` là bản chính. Tệp tên cũ `Slide-Chu-de-11.pptx` được thay bằng bản cập nhật giống hệt để các liên kết cũ dùng đúng nội dung mới. Một lệnh gồm cả sao chép và xóa tệp cũ bị công cụ thực thi chặn bởi chính sách. Đã hoàn tất theo phương án người dùng cho phép là cập nhật hai tên tệp, dùng các lệnh sao chép riêng, không xóa tệp.

Mã dựng riêng tại `.codex-build/topic11-pptx-v2`. Bộ câu hỏi và engine tại `.codex-build/topic11-minigame`, đầu ra HTML tự chứa tại thư mục minigame của chủ đề.

## Kiểm chứng

- Finalizer đạt kiểm tra cấu trúc, kích thước, font Arial, ba bảng và bốn biểu đồ. Dữ liệu workbook của bốn biểu đồ đã được kiểm tra với cache.
- Xem từng trang của 15 slide. Render lại PPTX đã hoàn tất, cả 15 ảnh giống ảnh bản dựng theo so sánh pixel.
- Kiểm tra gói PPTX có 15 trang, 15 ghi chú, bốn biểu đồ và ba WAV đúng 8/15/12 giây tại slide 1/7/15. Liên kết video đúng bốn vị trí.
- Hash SHA-256 tệp giao trùng bản đã xác thực. Hai tên tệp công khai cùng hash `34c958ba79b05c6380c78bf73da61fcc2acf9f6e5b2eed4f592396c0ef96296e`.
- `qa-map-flows.mjs` đạt 34 luồng câu hỏi, tổng 340 điểm, lưu tiến độ, khóa câu, điểm trả lời lại, file mode và mobile.
- `qa-map-teams.mjs` đạt chọn 8–9 đội, đổi tên, chuyển lượt, lưu điểm và bảo vệ dữ liệu đội 9.
- `qa-revised-questions.mjs` đạt giữ điểm câu đã xong, làm mới bản nháp câu đã sửa, giữ bản nháp không đổi và hiển thị đúng nguồn cùng liên hệ slide.
- Kiểm tra lịch nghe nhìn đủ 15 hàng, tổng 1.170 giây, ba MP3 tồn tại và liên kết nội bộ hợp lệ.

Chưa chạy trình chiếu trực tiếp trong ứng dụng PowerPoint và chưa chốt đoạn IN/OUT video bằng nghe xem liên tục. Các liên kết phát trang nguồn đầy đủ. Nội dung này được nêu trong kế hoạch nghe nhìn.

## Hoàn thành

Đã hoàn tất đồng bộ nội dung, PowerPoint, câu hỏi và lịch nghe nhìn.
