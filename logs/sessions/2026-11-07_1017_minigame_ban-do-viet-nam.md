# Bản đồ Việt Nam chọn câu hỏi

## Yêu cầu

Thay bảng ô địa phương bằng bản đồ Việt Nam, rê chuột theo từng tỉnh để chọn câu hỏi.

## Đã làm

- Đổi giao diện chọn câu hỏi thành SVG 34 tỉnh, thành theo đợt sắp xếp năm 2025. Rê chuột hoặc focus làm nổi địa phương và hiện tên, dạng câu đố, trạng thái trong bảng bên cạnh. Bấm, Enter hoặc phím cách mở đúng câu hỏi. Điện thoại hỗ trợ chạm.
- Thêm phóng to 100–300%, thanh cuộn, nút toàn cảnh, chọn nhanh và bộ lọc làm mờ các vùng không khớp.
- Câu hoàn thành được làm mờ và khóa. Lưu tiến độ và bảng điểm 8–9 đội tiếp tục dùng cùng dữ liệu cũ.
- Giữ các hiệu ứng nền, mở hộp thoại, pháo giấy, điểm bay và tab bảng điểm. Vùng bản đồ xuất hiện theo nhịp, tô sáng khi rê chuột, hiệu ứng mờ khi kết thúc.
- HTML tự chứa dữ liệu hình học, chạy trực tiếp bằng file, không tải bản đồ từ mạng. Cập nhật hướng dẫn và ghi nguồn bản đồ trong HTML.

## Dữ liệu bản đồ

Nguồn `nguyenduy1133/Free-GIS-Data`, tệp `Vietnam Administrative Divisions (Post-2025) - Đơn vị hành chính Việt Nam (Từ 2025)/Provinces.geojson`. Đã cache tại `.codex-build/topic11-minigame/provinces-2025.geojson`. Dùng Shapely giản lược ranh giới thành SVG để hiển thị. Hai quần đảo Hoàng Sa và Trường Sa nằm trong khung phụ phóng đại có ghi nhãn.

Nguồn bị lặp tên Lạng Sơn ở đối tượng mã 31. Dựa vào mã, vị trí hình học và danh sách địa phương, gán đối tượng đó thành Đồng Tháp. Không dùng trường STT bị lặp để ghép câu hỏi. Build kiểm tra đủ 34 ID duy nhất khớp bộ câu hỏi.

Mã nguồn triển khai tại `.codex-build/topic11-minigame/prepare-map.py`, `map-regions.json`, `map.css`, `template.html`, `engine.js` và `build.mjs`. File giao người dùng tại `Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/index.html`.

## Kiểm chứng

- `qa-map.mjs` đạt rê chuột và click bằng con trỏ thật vào điểm bên trong cả 34 vùng, mở đúng câu hỏi, bàn phím, chấm điểm, khóa, tải lại, tìm kiếm, chọn nhanh, zoom và màn hình 390px.
- `qa-map-flows.mjs` đạt toàn bộ 34 dạng câu đố, tổng 340 điểm, lưu tiến độ, khóa đủ 34 tỉnh, trả lời lại được 7 điểm, file offline, màn kết và bố cục mobile. Mở câu hỏi qua focus + Enter.
- `qa-map-teams.mjs` đạt thay đổi 8–9 đội, sửa tên, chuyển lượt, lưu điểm, thêm đội và bảo vệ lượt đội 9 khi giảm số đội.
- Kiểm tra ảnh desktop/mobile. Không có lỗi JavaScript trong các bài kiểm tra.

## Hoàn thành

Không còn phần việc của yêu cầu này.
