import fs from 'node:fs/promises';
import {questions,source,policySource} from './questions.mjs';
const root='C:/Users/ADMIN/Downloads/MLN';
const build=root+'/.codex-build/topic11-minigame/';
const output=root+'/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/minigame/';
if(questions.length!==34||new Set(questions.map(q=>q.id)).size!==34||new Set(questions.map(q=>q.kind)).size!==34)throw new Error('Require 34 unique provinces and challenge formats.');
let template=await fs.readFile(build+'template.html','utf8');
const engine=await fs.readFile(build+'engine.js','utf8');
const mapRegions=JSON.parse(await fs.readFile(build+'map-regions.json','utf8'));
const mapStyle=await fs.readFile(build+'map.css','utf8');
const projectorStyle=await fs.readFile(build+'projector.css','utf8');
const themeStyle=await fs.readFile(build+'theme.css','utf8');
template=template.replace('</head>',`<style>${mapStyle}</style><style>${projectorStyle}</style><style>${themeStyle}</style></head>`);
if(mapRegions.length!==34||questions.some(q=>!mapRegions.some(region=>region.id===q.id)))throw new Error('Province geometry must match all 34 questions.');
template=template.replace('__MAP_REGIONS__',JSON.stringify(mapRegions)).replace('__QUESTIONS__',JSON.stringify(questions,null,2)).replace('__ENGINE__',engine).replaceAll('__SOURCE__',source).replaceAll('__POLICY_SOURCE__',policySource);
await fs.mkdir(output,{recursive:true});
await fs.writeFile(output+'index.html',template,'utf8');
const guide=`# Minigame 34 tỉnh, thành

## Mở và tổ chức chơi

Mở index.html bằng Chrome hoặc Edge. Người điều khiển dùng một máy để chiếu lên màn hình lớp. Trò chơi có đúng tám nhóm theo thứ tự Nhóm 1, Nhóm 2, Nhóm 3, Nhóm 4, Nhóm 5, Nhóm 6, Nhóm 7 và Nhóm 9. Chọn nhóm đang trả lời bằng ô chọn phía trên bản đồ. Nút “Nhóm & luật chơi” hiển thị danh sách và luật tính điểm.

Giao diện mặc định ưu tiên màn chiếu cho lớp khoảng 70 sinh viên. Trên máy tính, chữ câu hỏi khoảng 30–44px, đáp án khoảng 26–36px, tên địa phương và bảng điểm được phóng lớn theo màn hình. Bấm “Toàn màn hình” để tận dụng diện tích máy chiếu. Với câu dài, cuộn vùng đáp án trong khi câu hỏi và hàng nút điều khiển luôn hiển thị. Khi hoàn thành, vùng đáp án chuyển sang phần lời giải để cả lớp theo dõi. Bảng điểm dành phần lớn diện tích cho tám nhóm.

Rê chuột lên bản đồ để làm sáng tỉnh, thành và xem tên cùng dạng câu đố. Bấm trực tiếp vào địa phương để mở câu hỏi. Trên điện thoại, chạm để mở. Dùng các nút +, − để phóng to, thanh cuộn để di chuyển bản đồ và “Toàn cảnh” để thu lại. Tab đến từng địa phương rồi Enter hoặc phím cách cũng mở được câu hỏi. Các số trên bản đồ tương ứng thứ tự trong danh sách 34 thử thách bên dưới. Hoàng Sa và Trường Sa được hiển thị trong khung phụ có ghi tên.

Dùng ô tìm kiếm và bộ lọc để làm nổi các địa phương phù hợp. Ô chọn nhanh bên cạnh bản đồ hỗ trợ các tỉnh nhỏ. Có thể dùng “Chọn ngẫu nhiên” để mở câu đố. Với ghép chữ, bấm các mảnh theo thứ tự và bấm mảnh đã ghép để bỏ. Với xếp thứ tự, dùng nút lên và xuống. Với chuyển thẻ, chọn nhóm đích trước rồi bấm từng thẻ. Với ba câu liên tiếp, chọn đáp án rồi bấm mở bước tiếp theo.

Mỗi địa phương chỉ tính điểm một lần. Đúng ở lần kiểm tra đầu được 10 điểm, lần hai được 7 điểm, từ lần ba được 5 điểm. Xem lời giải được 0 điểm. Các câu trả lời thiếu dữ liệu sẽ được nhắc bổ sung. Sau một lượt hoàn thành, đội tiếp theo nhận lượt mặc định.

Giao diện dùng nền trắng và các màu nhấn xanh dương, xanh ngọc, cam. Rê chuột để làm sáng đường viền địa phương và hiện tên tỉnh theo nhịp, bấm nút để hiện sóng lan. Bảng điểm có màu riêng cho từng nhóm, tám nhóm xếp thành hai hàng trên máy tính. Câu hỏi bật mở, đáp án được chọn đổi sang xanh dương, trả lời đúng có pháo giấy nhiều màu và điểm thưởng bay lên. Màn kết có hiệu ứng chúc mừng. Các hiệu ứng tuân theo cài đặt giảm chuyển động của thiết bị.

Khi hoàn thành và trở về bản đồ, vùng tương ứng chuyển mờ, xám và bị khóa. Trạng thái khóa được giữ sau khi tải lại trang. Xem kết quả trong tab bảng điểm. Bắt đầu ván mới để mở lại các địa phương. Trò chơi hỗ trợ thiết lập giảm chuyển động của thiết bị.

Khi đóng một câu chưa xong, trò chơi giữ bản nháp và nhóm đã mở câu. Với ván cũ có chín đội, dữ liệu nhóm 1–7 và nhóm 9 được chuyển đúng về danh sách tám nhóm. Kết quả đã hoàn thành của nhóm 8 cũ được giữ trong lịch sử, câu tương ứng vẫn khóa và điểm đó được tách khỏi tổng điểm tám nhóm hiện tại. Với ván cũ có tám đội, vị trí cuối được đổi tên thành Nhóm 9. Tiến độ lưu trên cùng trình duyệt và máy đang dùng. Có xác nhận trước khi xóa điểm để chơi lại.

## Tab bảng điểm nhóm thi

Bấm tab “Bảng điểm 8 nhóm” để xem điểm tổng, số câu đúng và thứ hạng. Các nhóm bằng điểm có cùng thứ hạng. Bảng chi tiết liệt kê nhóm trả lời và điểm của từng câu đã hoàn thành. Chọn nhóm trên tab này để trở về trò chơi và giao lượt cho nhóm đó. Điểm tự cập nhật khi trả lời đúng theo quy tắc 10, 7 hoặc 5 điểm. Sau Nhóm 9, lượt mặc định quay về Nhóm 1.

## Hai phần của buổi trình bày

Phần 1 là trò chơi này. Chọn số lượt phù hợp thời gian của nhóm. Nút “Kết thúc & dẫn vào bài” hoạt động cả khi chưa chơi hết 34 ô.

Màn kết hiển thị điểm và lời dẫn nối sang phần 2. Nút mở PowerPoint trỏ tới ../Slide-Chu-de-11-Sau-minigame.pptx. Trình duyệt có thể tải hoặc mở tệp theo thiết lập của máy. Có thể mở sẵn PPTX và chuyển cửa sổ sau khi công bố kết quả.

Phần 2 gồm 15 slide. Slide 2 có câu mở đầu và ghi chú lời nói khoảng 40–50 giây. Nhạc đã nhúng và phát khi bấm dòng “Nghe nhạc”. Video mở qua liên kết nguồn và cần Internet. Các liên kết nguồn tham khảo trong trò chơi cũng cần Internet, còn câu hỏi và chấm điểm chạy ngay trong HTML.

## Câu hỏi nối với bản slide đã cập nhật

Tám câu hỏi được biên tập lại theo nội dung slide. Hà Nội kiểm tra quan hệ kinh tế và chính trị trong giáo trình. Hà Tĩnh chọn nguồn khảo sát PCI. Đắk Lắk phân biệt thời hạn thủ tục được công bố với phân tích tác động kinh tế. Quảng Ninh kiểm tra số liệu C/O và yêu cầu đánh giá năng suất. TP.HCM dùng bài toán nguồn lực giả định và kinh nghiệm Quận 3. Đồng Tháp đánh giá mức giảm chi thường xuyên. Cà Mau kiểm tra số liệu cơ cấu. Nghệ An phân loại chỉ số cơ cấu và kết quả phục vụ.

Khi xem lời giải, nguồn riêng và số slide liên quan xuất hiện cùng bài học. Câu đã hoàn thành tiếp tục giữ điểm và trạng thái khóa của ván đang lưu. Với câu đã sửa nội dung nhưng chưa hoàn thành, trò chơi làm mới bản nháp và số lần thử của câu đó để phù hợp phiên bản mới.

## Danh sách 34 thử thách

| Số | Địa phương | Dạng thử thách | Slide liên hệ |
|---|---|---|---|
${questions.map((q,i)=>`| ${String(i+1).padStart(2,'0')} | ${q.name} | ${q.type} | ${q.slide||'Địa giới và quản trị'} |`).join('\n')}

## Căn cứ nội dung

Các câu hỏi địa giới bám đợt sắp xếp năm 2025 theo Nghị quyết 202/2025/QH15. Những tình huống phân bổ nguồn lực và xử lý công việc có nhãn giả định. Các nhận định về cơ hội và điều kiện phát triển là phần vận dụng để dẫn vào chủ đề thuyết trình.

- [Phương án sắp xếp cấp tỉnh](${source})
- [Dữ liệu ranh giới bản đồ Free GIS Data](https://github.com/nguyenduy1133/Free-GIS-Data). Ranh giới được giản lược để hiển thị trong trò chơi, hai quần đảo nằm trong khung phụ. Thuộc tính tên bị lặp ở đối tượng mã 31 của nguồn đã được đối chiếu và gán đúng Đồng Tháp.
- [Tư liệu về phân cấp, phân quyền và thực thi](${policySource})
- [Tư liệu VTV ngày 23/08/2025 dùng trong câu dòng thời gian](https://vtv.vn/video/can-day-manh-phan-cap-cho-can-bo-108674902.htm)
- [Nguồn dẫn chứng trong bản slide](../tai-lieu-tham-khao.md). Từng câu số liệu dùng liên kết nguồn riêng trong lời giải.
`;
await fs.writeFile(output+'README.md',guide,'utf8');
console.log('Built standalone HTML with 34 provinces and 34 challenge formats.');
