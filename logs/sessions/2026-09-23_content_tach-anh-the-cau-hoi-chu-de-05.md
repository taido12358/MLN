# Tách ảnh thẻ câu hỏi chủ đề 05 thành từng câu riêng

**Ngày**: 2026-09-23

## Việc đã làm

Tách 3 ảnh trang `the-cau-hoi-trang-{1,2,3}.png` (đã render sẵn từ
`the-cau-hoi-de-in.html`, 6 thẻ/trang, trang 3 chỉ 3 thẻ) thành 15 ảnh PNG riêng từng
câu, lưu vào thư mục mới `Presents/05-vai-tro-thuc-tien-doi-voi-nhan-thuc-chan-ly/the-cau-hoi-anh/cau-01.png` .. `cau-15.png`.

## Cách làm

Không có ImageMagick/Python/Pillow/Puppeteer sẵn trên máy này, nên viết một PNG
decoder/encoder thuần Node.js (dùng `zlib.inflateSync`/`deflateSync` có sẵn, tự
unfilter/filter scanline cho PNG colorType 2 — RGB 8-bit, không interlace, đúng định
dạng Chrome headless xuất ra).

Xác định biên lưới thẻ **bằng cách đọc trực tiếp pixel** thay vì tính tay từ CSS (vì
chiều cao header/footer phụ thuộc font-rendering, sai số vài px giữa các trang):
- Quét cột `x=91` (mép trái vùng lưới, = 12mm×scale) tìm các hàng có màu viền nét đứt
  (`#c7ccc2`, dò trong ngưỡng ±25 mỗi kênh) → hàng đầu/cuối = biên trên/dưới lưới thẻ.
  Biên trái/phải lưới lấy từ đường kẻ ngang liền nét dưới header (đo được đúng
  `x=91..1496`, khớp `12mm×(1588/210px)`).
- Mỗi trang có `gridTop`/`gridBottom` lệch nhau 1–2px (trang 1: 218–2110, trang 2:
  216–2109, trang 3: 218–2110) — không dùng chung 1 giá trị cho cả 3 trang.
- Chia đều lưới đã đo được thành ô: trang 1–2 là 3 hàng × 2 cột, trang 3 (class
  `count-3`, chỉ 3 thẻ) là 2 hàng × 2 cột nhưng ô (1,1) trống (không có thẻ) — thẻ 15
  vì vậy không có viền phải trong ảnh cắt ra (khớp đúng ảnh gốc, không phải lỗi).
- Crop bằng đúng biên giữa 2 ô liền kề (không chừa thêm) — viền nét đứt dùng chung giữa
  2 thẻ bị chia đôi, mỗi thẻ giữ nửa viền, chấp nhận được vì mục đích gốc là in-cắt.

Script tạm: `png-lib.js` + `extract-cards.js` trong scratchpad (không phải phần của
repo, không commit).

## Lưu ý nếu làm lại / mở rộng cho chủ đề khác

- Nếu re-render `the-cau-hoi-de-in.html` với nội dung khác, biên lưới có thể lệch vài
  px — nên đo lại bằng cách quét pixel như trên, đừng copy cứng toạ độ.
- Máy này thiếu ImageMagick/Python/Puppeteer — nếu cần thao tác ảnh phức tạp hơn, hoặc
  cài 1 trong các tool trên, hoặc tiếp tục hướng PNG decoder thuần Node (đã có sẵn
  `png-lib.js` làm nền, chỉ hỗ trợ 8-bit non-interlaced colorType 2/6).
