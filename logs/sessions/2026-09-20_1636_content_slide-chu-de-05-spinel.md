# Slide chủ đề 05 theo phong cách template Spinel

**Khu vực**: content (`Presents/05-vai-tro-thuc-tien-doi-voi-nhan-thuc-chan-ly/`) — không đụng `app/`.

## Việc đã làm
- Dựng bộ slide mới `Slide-Chu-de-05-Spinel.pptx` (16 slide) từ template
  `Spinel+Product+Strategy+Report+Presentation+Gray+variant.pptx` (tải về ở `Downloads/`),
  điền nội dung từ `slides.md` (ví dụ đời sống) + `tom-tat-ly-thuyet.md`.
- **Không ghi đè** `Slide-Chu-de-05.pptx` (bản cũ, 13 slide, phong cách khác) — giữ song song.
- Bố cục: bìa → mở đầu → khái niệm → tổng quan → cơ sở → động lực → mục đích →
  tiêu chuẩn chân lý → 3 đặc tính → chân lý đúng/sai → vòng khâu → liên hệ VN →
  bảng tóm tắt → kết luận → hỏi & đáp → cảm ơn.
- Bỏ các slide template không hợp nội dung (pricing matrix, kênh phân phối, marketing,
  contact, credits).

## Cách làm (để lần sau sửa được)
- Máy không có Python thật / LibreOffice → sửa trực tiếp XML slide bằng script Node
  (thay text theo thứ tự shape, giữ nguyên định dạng), tự ghi zip. Script nằm ở scratchpad
  của phiên, không lưu trong repo.
- Kiểm tra bằng bản xem trước HTML tự dựng (Chrome headless, font thay thế) — chỉ để soi
  tràn chữ/chồng lấn, **chưa xem bằng PowerPoint thật**.

## Lưu ý còn lại
- Template dùng font **Rowdies** (tiêu đề) + **Questrial** (nội dung). Máy này chưa cài;
  Questrial không có glyph tiếng Việt nên PowerPoint sẽ thay font khi hiển thị dấu.
  Muốn đồng nhất: cài 2 font (Google Fonts) hoặc đổi sang font có tiếng Việt.
- Ảnh nền trong template là ảnh trừu tượng (giữ nguyên), chưa thay bằng ảnh theo chủ đề.
