# Thẻ câu hỏi in-cắt cho Chủ đề 5

**Ngày**: 2026-09-22

## Việc đã làm

Tách bộ 1 (15 câu, mức dễ→khó) trong
`Presents/05-vai-tro-thuc-tien-doi-voi-nhan-thuc-chan-ly/cau-hoi-tu-de-den-kho.md`
thành file HTML in được: `the-cau-hoi-de-in.html` trong cùng thư mục.

- 3 trang khổ A4, 6 thẻ câu hỏi/trang (trang 3 chỉ có 3 thẻ vì hết câu), mỗi thẻ có
  viền nét đứt để cắt tay sau khi in.
- Trang cuối là bảng đáp án riêng (không nằm trong lưới thẻ), đánh dấu rõ "dành cho
  giáo viên — không cắt".
- Nhãn màu mức độ (dễ/vừa/khó) trên mỗi thẻ.
- Đã publish artifact để xem/in trực tiếp trên trình duyệt (Ctrl+P → khổ A4).

Bộ 2 (backup, 15 câu khác) trong cùng file nguồn **chưa** được tách — có thể làm thêm
nếu cần.

## Cập nhật: thêm bản Word + xuất ảnh A4

- Xuất 3 trang thành ảnh PNG khổ A4 (Chrome headless, mỗi ảnh = 1 trang, đúng
  `--window-size=794,1123 --force-device-scale-factor=2`) → `the-cau-hoi-trang-{1,2,3}.png`.
- Tạo thêm bản Word `the-cau-hoi-chu-de-5.docx` (docx-js) với layout tương tự (bảng
  2 cột × 3 hàng, viền nét đứt để cắt).
  - **Bug gặp phải**: đặt `TableRow.height` theo công thức chia đều
    `(USABLE_H - buffer) / 3` bị Word tách hàng thứ 3 sang trang mới dù tính toán lý
    thuyết vẫn còn dư ~1000 twips — không rõ nguyên nhân chính xác (có thể do Word
    tính toán khác LibreOffice). Fix bằng cách **hard-code** `ROW_H = 4000` (twips)
    thay vì tính theo công thức — an toàn hơn, để dư nhiều khoảng trống thay vì tràn
    trang.
  - **Bug khác**: ô trống (cell thứ 4 ở trang 3, chỉ có 3/4 câu) hiện viền đen do dùng
    `BorderStyle.NONE` — Word không tôn trọng giá trị `w:val="none"` khi ẩn border kế
    thừa từ `tblBorders` mặc định của bảng. Phải dùng **`BorderStyle.NIL`**
    (`w:val="nil"`) mới thực sự ẩn được border. Đồng thời set `borders` ở cấp `Table`
    (không chỉ cấp `TableCell`) về NIL để tránh viền solid mặc định của docx-js rò ra.
  - Verify bằng cách export PDF qua Word COM automation (PowerShell,
    `Documents.Open` → `SaveAs wdFormatPDF`) rồi `pdftoppm` ra JPEG để xem trực tiếp
    (máy này không có LibreOffice/Python nên không dùng được script chuẩn của skill
    `docx`).

## Lưu ý kỹ thuật (nếu sửa lại file)

`.page` dùng `display:grid; grid-template-rows:auto 1fr auto` (header/lưới thẻ/footer)
với `height:297mm` cố định — **không** dùng `display:flex` + `min-height`, vì flex
child với `flex:1` không giãn đúng khi container chỉ có `min-height` (đã gặp bug này,
gây khoảng trắng lớn dưới mỗi trang khi test trên artifact preview).
