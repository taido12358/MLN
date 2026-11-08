import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
import {applyPresentationChartFont} from 'file:///C:/Users/ADMIN/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations/container_tools/artifact_tool_utils.mjs';

const root='C:/Users/ADMIN/Downloads/MLN';
const build=root+'/.codex-build/topic11-pptx-manual-media';
const assets=root+'/.codex-build/topic11-pptx/assets';
const topic=root+'/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may';
const markdown=await fs.readFile(topic+'/slides.md','utf8');
const chunks=markdown.split(/(?=^## Slide \d+)/m).filter(s=>/^## Slide \d+/.test(s));
const C={paper:'#F5F0E7',ink:'#242522',red:'#8B2937',muted:'#6C6860',pale:'#DAD1C3',white:'#FFFCF5',gold:'#DDBB7D',green:'#397D64',before:'#B5ADA0'};
const U={
  reform:'https://baochinhphu.vn/nghi-quyet-cua-quoc-hoi-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-102250612191145158.htm',
  pci:'https://pcivietnam.vn/uploads/VN-Bao-cao-dai-PCI/Layout-PCI-2024_VN.pdf#page=20',
  daklak:'https://daklak.gov.vn/thong-tin-tuyen-truyen/-/asset_publisher/eTFgYrRjRQin/content/rut-ngan-thoi-gian-giai-quyet-mot-so-thu-tuc-hanh-chinh-thuoc-linh-vuc-ang-ky-doanh-nghiep',
  communes:'https://www.mof.gov.vn/bo-tai-chinh/dua-nghi-quyet-cua-dang-vao-cuoc-song/qua-trinh-hoan-thien-the-che-chinh-sach-ve-chinh-quyen-dia-phuong-2-cap-duoc-trien-khai-dong-bo-toan-dien',
  quangninh:'https://www.quangninh.gov.vn/Trang/ChiTietTinTuc.aspx?nid=160925',
  q3:'https://plo.vn/4-gio-xong-thu-tuc-dang-ky-kinh-doanh-post495617.html',
  budget:'https://baochinhphu.vn/thu-tuong-doi-moi-dot-pha-manh-me-hon-nua-nhat-la-trong-huy-dong-nguon-luc-phat-trien-102251012161852286.htm',
};
const presentation=Presentation.create({slideSize:{width:1280,height:720}});
presentation.theme.defaultFont='Arial';
let serial=0;
function text(s,value,x,y,w,h,size=28,color=C.ink,bold=false,name){
  const shape=s.shapes.add({geometry:'textbox',name:name||`text-${++serial}`,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  shape.text=value;
  shape.text.style={fontSize:size,typeface:'Arial',color,bold,insets:0,wrap:'square',autoFit:'none',verticalAlignment:'top'};
  return shape;
}
function slide(n,title,dark=false){
  const s=presentation.slides.add();s.background.fill=dark?C.red:C.paper;
  if(title)text(s,title,64,42,1150,116,42,dark?C.white:C.ink,true,'slide-title');
  text(s,String(n).padStart(2,'0'),1170,664,48,24,18,dark?C.gold:C.muted,false,'page-number');
  s.speakerNotes.text=chunks[n-1].replace(/^## Slide[^\n]+\n/,'').trim();
  return s;
}
function link(s,label,url,x=64,y=652,w=1080,size=17,color=C.muted,name){
  const box=text(s,label,x,y,w,32,size,color,false,name);
  box.hyperlink={uri:url,isExternal:true};box.text.get(label).link={uri:url,isExternal:true};
  return box;
}
function note(s,value){s.speakerNotes.append('\n\n'+value);}
async function photo(s,file,x,y,w,h,alt,url){
  const image=s.images.add({blob:new Uint8Array(await fs.readFile(file)),contentType:file.endsWith('.jpg')?'image/jpeg':'image/png',alt,fit:'contain',position:{left:x,top:y,width:w,height:h}});
  if(url)image.hyperlink={uri:url,isExternal:true};
  return image;
}
function table(s,values,y=190,height=370,widths=[565,565],fontSize=26){
  const t=s.tables.add({rows:values.length,columns:values[0].length,left:64,top:y,width:1130,height,columnWidths:widths,values});
  t.borders.assign({fill:C.pale,width:1,style:'solid'});
  for(let r=0;r<values.length;r++)for(let c=0;c<values[r].length;c++){
    const cell=t.getCell(r,c);cell.fill=r===0?C.red:C.paper;
    cell.text.style={fontSize:r===0?fontSize+1:fontSize,typeface:'Arial',bold:r===0,color:r===0?C.white:C.ink,insets:15,verticalAlignment:'middle',autoFit:'none'};
  }
  return t;
}
function chart(s,{x=64,y=210,w=750,h=360,categories,series,max,step,format='0',legend=false,axisTitle}){
  const ch=s.charts.add('bar',{
    position:{left:x,top:y,width:w,height:h},categories,series,hasLegend:legend,
    legend:{position:'top',overlay:false,textStyle:{fontSize:21,fill:C.ink}},
    barOptions:{direction:'column',grouping:'clustered',gapWidth:90},
    chartFill:C.paper,plotAreaFill:C.paper,chartLine:{fill:'none',width:0},
    xAxis:{textStyle:{fontSize:21,fill:C.muted},line:{fill:C.pale,width:1}},
    yAxis:{min:0,max,majorUnit:step,numberFormatCode:format,title:axisTitle?{text:axisTitle,textStyle:{fontSize:20,fill:C.muted}}:undefined,textStyle:{fontSize:19,fill:C.muted},line:{fill:'none',width:0},majorGridlines:{fill:C.pale,width:.7}},
    dataLabels:{showValue:true,position:'outEnd',numberFormatCode:format,textStyle:{fontSize:27,bold:true,fill:C.ink}},
  });
  applyPresentationChartFont(ch,{fontFamily:'Arial'});
  return ch;
}
const twoColors=[{idx:0,fill:C.before},{idx:1,fill:C.green}];

{
  const s=slide(1,'',true);
  const image=s.images.add({blob:new Uint8Array(await fs.readFile(assets+'/city.jpg')),contentType:'image/jpeg',fit:'cover',alt:'Cảnh quan TP.HCM bên sông Sài Gòn',position:{left:790,top:0,width:490,height:720}});
  text(s,'CHỦ ĐỀ 11 · PHẦN 2',64,68,650,40,23,C.gold,true);
  text(s,'Đổi mới kinh tế\nđi cùng\nđổi mới chính trị',64,172,704,280,65,C.white,true,'slide-title');
  text(s,'Bài học từ sáp nhập và tinh gọn\nbộ máy ở Việt Nam',68,493,675,90,28,C.white);
  note(s,'Ảnh Hoàng Triều / Báo Người Lao Động. https://nld.com.vn/ngay-mai-29-4-khoi-cong-tuyen-metro-ben-thanh-thu-thiem-tang-toc-ket-noi-san-bay-long-thanh-196260428164348959.htm');
}
{
  const s=slide(2,'Sau minigame, điều gì cần được giải thích?');
  await photo(s,build+'/minigame-map.png',64,175,470,438,'Bản đồ chọn câu hỏi trong minigame của nhóm');
  text(s,'Thời hạn một thủ tục\ntừ 3 ngày còn 1 ngày',590,205,625,150,43,C.red,true);
  text(s,'Doanh nghiệp được lợi gì\ntừ hai ngày chờ rút ngắn?',590,383,600,112,32);
  text(s,'Cùng kiểm tra bằng chứng và cơ chế tác động.',590,540,600,68,24,C.muted);
  text(s,'Ví dụ Đắk Lắk được phân tích ở slide 8.',64,651,1080,30,18,C.muted);
}
{
  const s=slide(3,'Cơ sở lý luận của quan hệ kinh tế và chính trị');
  text(s,'CƠ SỞ HẠ TẦNG',64,181,540,43,28,C.red,true);
  text(s,'Tổng thể quan hệ sản xuất\ncủa xã hội.\nKinh tế quyết định chính trị\nxét đến cùng.',64,247,540,190,29);
  text(s,'KIẾN TRÚC THƯỢNG TẦNG',690,181,530,43,28,C.red,true);
  text(s,'Quan điểm, tư tưởng và\ncác thiết chế tương ứng.\nChính trị có tính độc lập tương đối,\ntác động trở lại kinh tế.',690,247,530,190,29);
  text(s,'Lấy đổi mới kinh tế làm trọng tâm.\nĐổi mới chính trị từng bước, thận trọng và phù hợp.',64,487,1120,115,32,C.ink,true);
  text(s,'Nguồn  Giáo trình Triết học Mác – Lênin, Chương III. Giáo trình Lịch sử Đảng, tr. 286–287.',64,653,1100,30,17,C.muted);
}
{
  const s=slide(4,'Nội dung của hai quá trình đổi mới');
  table(s,[['Đổi mới kinh tế','Đổi mới chính trị'],['Hoàn thiện thể chế kinh tế,\nphát huy động lực sản xuất','Hoàn thiện tổ chức và\nphương thức lãnh đạo, quản trị'],['Phân bổ vốn, đất đai\nvà lao động hiệu quả','Phân định thẩm quyền,\ntrách nhiệm và phối hợp'],['Mở rộng hoạt động\nđầu tư và kinh doanh','Phát huy dân chủ, pháp quyền,\nminh bạch và giải trình']],178,404,[565,565],26);
  text(s,'Sáp nhập và cải cách thủ tục cùng góp phần thay đổi năng lực quản trị.',64,611,1120,50,25,C.muted);
}
{
  const s=slide(5,'Chi phí tuân thủ đặt ra yêu cầu cải cách');
  text(s,'Tỷ lệ doanh nghiệp dành trên 10% thời gian\nđể tìm hiểu và thực hiện quy định pháp luật',64,167,760,76,25,C.muted);
  chart(s,{y:255,w:760,h:320,categories:['2023','2024'],series:[{name:'Tỷ lệ doanh nghiệp',values:[.20,.24],fill:C.red,points:[{idx:0,fill:C.before},{idx:1,fill:C.red}]}],max:.3,step:.1,format:'0%'});
  text(s,'Gần 24%',875,226,335,90,52,C.red,true);
  text(s,'Doanh nghiệp dành\nnhiều thời gian cho\nviệc tuân thủ.',875,340,330,150,29);
  text(s,'Số liệu trước sắp xếp 2025. Tỷ lệ được nguồn làm tròn.',64,602,1130,36,22,C.muted);
  link(s,'Nguồn  VCCI, Báo cáo PCI 2024, trang 20.',U.pci);
}
{
  const s=slide(6,'Đổi mới chính trị tạo điều kiện gì cho kinh tế?');
  table(s,[['Thay đổi trong quản trị','Điều kiện cho hoạt động kinh tế'],['Quy định rõ và thực hiện nhất quán','Dự tính được nghĩa vụ, rủi ro đầu tư'],['Giao đúng thẩm quyền, rõ thời hạn','Giảm thời gian chờ và phối hợp'],['Dữ liệu liên thông, tiếp nhận một cửa','Giảm khai lại thông tin và đi lại'],['Điều phối quy hoạch và nguồn lực','Kết nối sản xuất, hạ tầng, thị trường']],180,406,[550,580],25);
  text(s,'Cơ chế tác động được kiểm tra bằng những trường hợp cụ thể.',64,614,1130,42,25,C.muted);
}
{
  const s=slide(7,'Nhu cầu kinh tế thúc đẩy thay đổi cách quản lý');
  await photo(s,assets+'/port.jpg',64,182,700,390,'Hoạt động cảng Cái Mép');
  text(s,'Chuỗi sản xuất\nkết nối nhiều địa bàn',810,202,402,115,34,C.red,true);
  text(s,'Quy hoạch, thủ tục và\nnguồn lực cần được\nphối hợp phù hợp.',810,365,400,150,29);
  text(s,'Ảnh cảng Cái Mép / SGGP',64,653,1080,30,17,C.muted);
  note(s,'Ảnh cảng Cái Mép / SGGP. https://en.sggp.org.vn/ho-chi-minh-city-targets-10-percent-growth-in-2026-with-10-strategic-solutions-post123038.html');
}
{
  const s=slide(8,'Đắk Lắk rút ngắn thời hạn đăng ký doanh nghiệp');
  text(s,'Thời hạn địa phương công bố năm 2024 · Đơn vị ngày làm việc',64,165,1140,40,25,C.muted);
  chart(s,{x:90,y:217,w:1090,h:338,categories:['Thành lập mới','Một số thay đổi đăng ký'],series:[{name:'Trước điều chỉnh',values:[3,3],fill:C.before},{name:'Sau điều chỉnh',values:[2,1],fill:C.green}],max:4,step:1,legend:true});
  text(s,'Giảm 1 ngày · 33,3%',128,581,485,43,28,C.red,true);
  text(s,'Giảm 2 ngày · 66,7%',702,581,485,43,28,C.red,true);
  link(s,'Nguồn  Cổng TTĐT Đắk Lắk, 21/03/2024. Tỷ lệ giảm do nhóm tính.',U.daklak);
}
{
  const s=slide(9,'Quy mô sắp xếp đơn vị hành chính năm 2025');
  text(s,'CẤP TỈNH',64,166,530,40,26,C.red,true);
  text(s,'CẤP XÃ',690,166,530,40,26,C.red,true);
  chart(s,{x:55,y:222,w:545,h:304,categories:['Trước','Sau'],series:[{name:'Số đơn vị cấp tỉnh',values:[63,34],points:twoColors,fill:C.green}],max:80,step:20});
  chart(s,{x:681,y:222,w:545,h:304,categories:['Trước','Sau'],series:[{name:'Số đơn vị cấp xã',values:[10035,3321],points:twoColors,fill:C.green}],max:12000,step:3000,format:'#,##0'});
  text(s,'Giảm 29 đơn vị · 46,0%',80,551,540,40,27,C.red,true);
  text(s,'Giảm 6.714 đơn vị · 66,9%',705,551,520,40,27,C.red,true);
  text(s,'Vận hành hai cấp từ 01/7/2025. Kết thúc hoạt động cấp huyện.',64,602,1110,38,24,C.red,true);
  link(s,'Nguồn  Nghị quyết 202/2025/QH15 và Bộ Tài chính. Tỷ lệ giảm do nhóm tính.',U.communes);
  note(s,U.reform+'\nHai cấp địa phương vận hành từ 01/7/2025, kết thúc hoạt động cấp huyện.');
}
{
  const s=slide(10,'TP.HCM phối hợp đô thị, công nghiệp và cảng biển');
  await photo(s,assets+'/logistics.jpg',64,182,690,375,'Ảnh minh họa bản tin VTV về liên kết logistics TP.HCM');
  text(s,'Ba địa phương\ntrong một phạm vi\nquản trị mới',806,194,407,165,36,C.red,true);
  text(s,'Quy hoạch, dữ liệu\nvà trách nhiệm\ncần thống nhất.',806,404,400,142,29);
  link(s,'Nguồn  Nghị quyết 202/2025/QH15. Ảnh minh họa bản tin VTV ngày 24/06/2025.',U.reform);
  note(s,'Ba địa phương trước hợp nhất gồm TP.HCM, Bình Dương và Bà Rịa – Vũng Tàu. Ảnh đại diện từ trang nguồn VTV.');
}
{
  const s=slide(11,'Quảng Ninh phân cấp và xử lý C/O trực tuyến');
  text(s,'15 / 21',64,200,530,103,72,C.red,true);
  text(s,'Loại C/O được thực hiện\nhoàn toàn trực tuyến',64,327,540,90,30);
  text(s,'1–2 giờ',690,200,530,103,72,C.red,true);
  text(s,'Thời gian xử lý được báo cáo\nsau phân cấp từ 01/10/2025',690,327,530,90,30);
  text(s,'Hồ sơ trung bình mỗi tháng được báo cáo\ntăng từ khoảng 1.500 lên 3.900.',64,460,1125,90,32);
  text(s,'Hỗ trợ doanh nghiệp chủ động kế hoạch giao hàng.',64,588,1120,42,27,C.red,true);
  link(s,'Nguồn  Cổng TTĐT Quảng Ninh. Đối chiếu báo Quảng Ninh ngày 03/12/2025.',U.quangninh);
}
{
  const s=slide(12,'Kinh nghiệm đăng ký hộ kinh doanh tại Quận 3');
  text(s,'5 ngày',64,199,530,115,76,C.muted,true);
  text(s,'Mốc thời gian trước cải tiến\nđược nguồn nêu',64,337,530,95,29);
  text(s,'4 giờ',690,199,530,115,76,C.red,true);
  text(s,'Quy trình địa phương triển khai\nđược tư liệu năm 2018 ghi nhận',690,337,525,95,29);
  text(s,'955 giấy đăng ký cấp mới trong nhóm hồ sơ\ntheo quy trình 4 giờ, kỳ 01/01–31/10/2017.',64,493,1125,98,31,C.ink,true);
  link(s,'Nguồn  Pháp Luật TP.HCM, 04/09/2018. Dẫn chứng trước sắp xếp năm 2025.',U.q3);
}
{
  const s=slide(13,'Tinh gọn tạo dư địa ngân sách cho phát triển');
  text(s,'39',64,179,420,204,145,C.red,true);
  text(s,'nghìn tỷ đồng/năm',68,397,670,66,42,C.red,true);
  text(s,'Mức giảm chi thường xuyên\nđược báo cáo ngày 12/10/2025',69,491,670,92,29);
  text(s,'Đánh giá lợi ích cần\ntính chi phí chuyển đổi\nvà theo dõi cách\nsử dụng nguồn lực.',820,225,391,246,32);
  link(s,'Nguồn  Báo Điện tử Chính phủ, báo cáo tổng kết tinh gọn bộ máy ngày 12/10/2025.',U.budget);
}
{
  const s=slide(14,'Đo hiệu quả bằng kết quả phục vụ');
  table(s,[['Câu hỏi đánh giá','Dữ liệu cần theo dõi'],['Hồ sơ có nhanh hơn?','Ngày nộp đầu, ngày nhận kết quả,\nthời gian xử lý hồ sơ hợp lệ'],['Người dân có ít tốn công hơn?','Số lượt đi lại, lần bổ sung, khoản chi'],['Nguồn lực có hiệu quả hơn?','Chi vận hành, chi chuyển đổi,\nkhối lượng công việc trên nhân lực'],['Kinh doanh có thuận lợi hơn?','Trải nghiệm doanh nghiệp,\ntiến độ đầu tư, chi phí phối hợp']],178,415,[500,630],25);
  text(s,'So sánh cùng thủ tục, cách tính thời gian và nhóm hồ sơ tương đồng.',64,616,1130,40,25,C.muted);
}
{
  const s=slide(15,'Chính trị mở đường cho kinh tế phát triển',true);
  text(s,'Đổi mới kinh tế là trọng tâm.\nĐổi mới chính trị có bước đi phù hợp.',64,183,1120,119,40,C.white);
  text(s,'Thể chế phù hợp và thực thi tốt\ngiúp tháo gỡ vướng mắc cho kinh tế.',64,350,1120,125,42,C.white);
  text(s,'Trở lại bản đồ minigame\nBạn chọn chỉ số nào để kiểm tra cải cách tại một tỉnh?',64,525,1120,92,28,C.gold,true);
  text(s,'Cảm ơn cả lớp',64,651,800,40,24,C.gold,true);
}

await fs.mkdir(build+'/previews',{recursive:true});
await (await PresentationFile.exportPptx(presentation)).save(build+'/draft.pptx');
console.log('Exported editable 15-slide draft.');
for(const [i,s] of presentation.slides.items.entries()){
  const png=await presentation.export({slide:s,format:'png',scale:1});
  await fs.writeFile(`${build}/previews/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await png.arrayBuffer()));
  console.log('Rendered',i+1);
}
