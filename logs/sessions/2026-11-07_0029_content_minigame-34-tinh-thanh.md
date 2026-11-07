# Minigame 34 tỉnh, thành và lời dẫn vào bài thuyết trình

## Yêu cầu

Người dùng chia buổi trình bày thành phần 1 minigame HTML và phần 2 slide, video, âm thanh. Yêu cầu 34 tỉnh, thành có câu đố riêng về sắp xếp, Bắc Ninh ghép chữ và Phú Thọ trắc nghiệm đúng hai đáp án, rồi bổ sung lời dẫn nối sang slide.

## Bàn giao

- `Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html`, HTML tự chứa câu hỏi, CSS và JavaScript, chạy bằng cách mở file trực tiếp.
- `minigame/README.md` hướng dẫn điều khiển, điểm số, lưu tiến độ, chuyển phần và bảng 34 dạng thử thách.
- `Slide-Chu-de-11-Sau-minigame.pptx` gồm 15 slide, chỉnh trang bìa thành phần 2 và slide 2 thành lời dẫn sau trò chơi. Ghi chú có đoạn nói khoảng 40–50 giây.
- Đồng bộ `slides.md`, `hook.md`, `ke-hoach-video-am-thanh.md` và README của chủ đề.

## Thiết kế và nội dung

Chọn bảng 34 ô địa phương, tìm kiếm và lọc khu vực, dùng một máy điều khiển để chiếu lớp. Mặc định hai đội và có thể đặt từ hai đến bốn đội. Mỗi câu chỉ ghi điểm một lần, đúng lần đầu 10 điểm, lần hai 7 điểm, từ lần ba 5 điểm, xem lời giải 0 điểm. Dữ liệu và bản nháp lưu trên trình duyệt. Có xác nhận trước khi xóa ván.

Đủ 34 địa phương và 34 mã dạng thử thách khác nhau. Hình thức có ghép chữ, chọn hai, nối cặp, sửa bản tin, ô chữ giao nhau, bảng đúng sai, lật thẻ, tìm chữ, xếp bước, phân loại, khóa số, phân bổ nguồn lực giả định và ghép lập luận. Các dạng dùng chung thành phần nhập liệu khi phù hợp để hỗ trợ bàn phím và di động.

Đã đối chiếu danh sách và phương án địa giới với nguồn chính thức về Nghị quyết 202/2025/QH15. Phân biệt địa phương giữ nguyên cấp tỉnh với nơi hợp nhất, ghi rõ tình huống giả định và phân tích vận dụng. Có liên kết nguồn phân cấp và tư liệu VTV khi liên quan.

## Kiểm tra

- Playwright chạy đủ 34 luồng trả lời đúng qua giao diện, tổng điểm 340.
- Kiểm tra tải lại giữ tiến độ, bản nháp và lần trả lời sai, không chấm lại câu hoàn thành, câu chưa đủ dữ liệu không bị trừ lượt, lần đúng thứ hai được 7 điểm.
- Kiểm tra chế độ file://, màn tổng kết, giao diện di động 390 px và không có lỗi JavaScript.
- Xem ảnh giao diện bảng chọn, câu Phú Thọ, màn kết và câu ô chữ trên di động.
- PPTX sửa qua Artifact Session, render kiểm tra slide 1 và 2. Chuyển phần text và notes đã chỉnh vào bản gốc để giữ nguyên mọi phần khác.
- Chỉ bốn XML part của slide 1, 2 và notes tương ứng thay đổi. Toàn bộ phần media, audio và slide 3–15 giữ nguyên từng byte.
- PPTX đạt finalizer về package integrity, geometry, Arial, hai native table và import qua Artifact Tool.
- Kiểm tra hướng dẫn đủ 34 dòng, liên kết nội bộ tồn tại và liên kết tải PPTX từ minigame trả HTTP 200.

## Giới hạn liên quan

Video trong PPTX mở qua liên kết VTV và cần Internet. Ba đoạn nhạc nhúng vẫn dùng thao tác bấm dòng Nghe nhạc. Chưa kiểm thử phát nhạc trong Microsoft PowerPoint vì máy không có ứng dụng đó.

Mã nguồn xây dựng và kết quả QA nằm riêng trong `.codex-build/topic11-minigame/`. Máy chủ HTTP chỉ phục vụ kiểm tra cục bộ, sản phẩm HTML có thể mở trực tiếp.
