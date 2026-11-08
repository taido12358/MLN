import fs from 'node:fs/promises';
import {Presentation,PresentationFile} from 'file:///C:/Users/ADMIN/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs';
import {applyPresentationChartFont} from 'file:///C:/Users/ADMIN/.codex/plugins/cache/openai-primary-runtime/presentations/26.1105.12137/skills/presentations/container_tools/artifact_tool_utils.mjs';

const root='C:/Users/ADMIN/Downloads/MLN';
const build=root+'/.codex-build/topic11-design-v3';
const old=root+'/.codex-build/topic11-pptx/assets';
const assets=build+'/assets';
const topic=root+'/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may';
const chunks=(await fs.readFile(topic+'/slides.md','utf8')).replace(/\r\n/g,'\n').split(/(?=^## Slide \d+)/m).filter(s=>/^## Slide \d+/.test(s));
const mapping=[1,3,4,5,6,7,8,9,10,11,12,13,14,15];
const sourced=JSON.parse(await fs.readFile(assets+'/sources.json','utf8'));
const C={paper:'#FFFFFF',ink:'#123744',teal:'#007E87',dark:'#103D49',muted:'#536E79',line:'#DCE7E9',pale:'#F0F6F7',before:'#B5C5CC',gold:'#F3B95E',white:'#FFFFFF'};
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
function text(s,value,x,y,w,h,size=30,color=C.ink,bold=false,name){
 const shape=s.shapes.add({geometry:'textbox',name:name||`text-${++serial}`,position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
 shape.text=value;shape.text.style={fontSize:size,typeface:'Arial',color,bold,insets:0,wrap:'square',autoFit:'none',verticalAlignment:'top'};
 return shape;
}
function slide(n,title,dark=false){
 const s=presentation.slides.add();s.background.fill=dark?C.dark:C.paper;
 if(title)text(s,title,60,42,1160,115,44,dark?C.white:C.ink,true,'slide-title');
 text(s,String(n).padStart(2,'0'),1180,674,50,27,20,dark?C.gold:C.muted,false,'page-number');
 const chunk=chunks[mapping[n-1]-1];
 const speech=chunk.match(/### (?:Lời thuyết trình|Lời kết)\n([\s\S]*?)(?=\n### )/)[1].trim();
 const notes=chunk.match(/### (?:Căn cứ và nghe nhìn|Nghe nhìn)\n([\s\S]*)/)[1].replace(/\n---[\s\S]*/,'').trim();
 s.speakerNotes.text=speech+'\n\nCăn cứ nội dung:\n'+notes;
 return s;
}
function note(s,value){s.speakerNotes.append('\n\n'+value);}
function foot(s,label,url,y=672,size=17){
 const t=text(s,label,60,y,1090,30,size,C.muted);
 if(url){t.hyperlink={uri:url,isExternal:true};note(s,'Nguồn: '+url);}
 return t;
}
async function photo(s,file,x,y,w,h,alt,{fit='cover',rounded=false,source}={}){
 const image=s.images.add({blob:new Uint8Array(await fs.readFile(file)),contentType:file.endsWith('.png')?'image/png':'image/jpeg',alt,fit,geometry:rounded?'roundRect':'rect',...(rounded?{borderRadius:16}:{}),position:{left:x,top:y,width:w,height:h}});
 const record=sourced.find(a=>file.endsWith('/'+a.file));
 if(record)note(s,`Ảnh: ${record.credit}\n${record.page}\n${record.url}\nPhạm vi: ${record.use}`);
 if(source)note(s,source);
 return image;
}
function table(s,values,{x=60,y=178,w=1160,h=405,widths=[570,590],font=28}={}){
 const t=s.tables.add({rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,columnWidths:widths,values});
 t.borders.assign({fill:C.line,width:.7,style:'solid'});
 for(let r=0;r<values.length;r++)for(let c=0;c<values[r].length;c++){
  const cell=t.getCell(r,c);cell.fill=r===0?C.dark:(r%2?C.paper:C.pale);
  cell.text.style={fontSize:font,typeface:'Arial',bold:r===0,color:r===0?C.white:C.ink,insets:17,verticalAlignment:'middle',autoFit:'none'};
 }
 return t;
}
function chart(s,{x=60,y=260,w=760,h=340,categories,series,max,step,format='0',legend=false,labelSize=29}){
 const ch=s.charts.add('bar',{
  position:{left:x,top:y,width:w,height:h},categories,series,hasLegend:legend,
  legend:{position:'top',overlay:false,textStyle:{fontSize:24,fill:C.ink}},
  barOptions:{direction:'column',grouping:'clustered',gapWidth:110},
  chartFill:C.paper,plotAreaFill:C.paper,chartLine:{fill:'none',width:0},
  xAxis:{textStyle:{fontSize:24,fill:C.muted},line:{fill:C.line,width:1}},
  yAxis:{min:0,max,majorUnit:step,numberFormatCode:format,textStyle:{fontSize:22,fill:C.muted},line:{fill:'none',width:0},majorGridlines:{fill:C.line,width:.65}},
  dataLabels:{showValue:true,position:'outEnd',numberFormatCode:format,textStyle:{fontSize:labelSize,bold:true,fill:C.ink}},
 });
 applyPresentationChartFont(ch,{fontFamily:'Arial'});return ch;
}
const beforeAfter=[{idx:0,fill:C.before},{idx:1,fill:C.teal}];

{
 const s=slide(1,'');
 await photo(s,old+'/city.jpg',730,0,550,720,'Cảnh quan TP.HCM bên sông Sài Gòn',{source:'Ảnh Hoàng Triều / Báo Người Lao Động. https://nld.com.vn/ngay-mai-29-4-khoi-cong-tuyen-metro-ben-thanh-thu-thiem-tang-toc-ket-noi-san-bay-long-thanh-196260428164348959.htm'});
 text(s,'CHỦ ĐỀ 11 · PHẦN 2',60,62,630,42,25,C.teal,true);
 text(s,'Đổi mới kinh tế\nđi cùng\nđổi mới chính trị',60,165,650,274,62,C.dark,true,'slide-title');
 text(s,'Bài học từ sáp nhập và tinh gọn\nbộ máy ở Việt Nam',64,512,620,96,30,C.muted);
}
{
 const s=slide(2,'Cơ sở lý luận của quan hệ kinh tế và chính trị');
 text(s,'CƠ SỞ HẠ TẦNG',60,198,555,46,29,C.teal,true);
 text(s,'Tổng thể quan hệ sản xuất\ncủa xã hội.',60,260,545,87,33);
 text(s,'Kinh tế quyết định chính trị\nxét đến cùng.',60,367,545,90,34,C.ink,true);
 text(s,'KIẾN TRÚC THƯỢNG TẦNG',680,198,540,46,29,C.teal,true);
 text(s,'Quan điểm, tư tưởng và\ncác thiết chế tương ứng.',680,260,540,87,33);
 text(s,'Chính trị có tính độc lập tương đối,\ntác động trở lại kinh tế.',680,367,540,96,31,C.ink,true);
 text(s,'Lấy đổi mới kinh tế làm trọng tâm.\nĐổi mới chính trị từng bước, thận trọng và phù hợp.',60,527,1150,101,34,C.teal,true);
 foot(s,'Giáo trình Triết học Mác – Lênin, Chương III. Giáo trình Lịch sử Đảng, tr. 286–287.');
}
{
 const s=slide(3,'Nội dung của hai quá trình đổi mới');
 table(s,[['Đổi mới kinh tế','Đổi mới chính trị'],['Hoàn thiện thể chế kinh tế,\nphát huy động lực sản xuất','Hoàn thiện tổ chức và\nphương thức lãnh đạo, quản trị'],['Phân bổ vốn, đất đai\nvà lao động hiệu quả','Phân định thẩm quyền,\ntrách nhiệm và phối hợp'],['Mở rộng hoạt động\nđầu tư và kinh doanh','Phát huy dân chủ, pháp quyền,\nminh bạch và giải trình']],{h:408,font:29});
 text(s,'Sáp nhập và cải cách thủ tục cùng góp phần\nthay đổi năng lực quản trị.',60,610,1140,75,29,C.teal,true);
}
{
 const s=slide(4,'Chi phí tuân thủ đặt ra yêu cầu cải cách');
 text(s,'Tỷ lệ doanh nghiệp dành trên 10% thời gian\nđể tìm hiểu và thực hiện quy định pháp luật',60,171,754,78,27,C.muted);
 chart(s,{x:50,y:285,w:730,h:310,categories:['2023','2024'],series:[{name:'Tỷ lệ doanh nghiệp',values:[.2,.24],fill:C.teal,points:beforeAfter}],max:.3,step:.1,format:'0%',labelSize:31});
 text(s,'Gần 24%',840,179,380,85,60,C.teal,true);
 text(s,'Doanh nghiệp dành nhiều\nthời gian cho việc tuân thủ.',840,274,380,94,29);
 await photo(s,assets+'/factory.jpg',840,392,380,224,'Ảnh minh họa hoạt động sản xuất tại nhà máy',{rounded:true});
 text(s,'Ảnh minh họa sản xuất / Vietnam News',840,626,380,25,16,C.muted);
 text(s,'Trước sắp xếp 2025. Tỷ lệ được nguồn làm tròn.',60,622,745,35,23,C.muted);
 foot(s,'Nguồn  VCCI, Báo cáo PCI 2024, trang 20.',U.pci);
}
{
 const s=slide(5,'Đổi mới chính trị tạo điều kiện gì cho kinh tế?');
 table(s,[['Thay đổi trong quản trị','Điều kiện cho hoạt động kinh tế'],['Quy định rõ và thực hiện nhất quán','Dự tính được nghĩa vụ, rủi ro đầu tư'],['Giao đúng thẩm quyền, rõ thời hạn','Giảm thời gian chờ và phối hợp'],['Dữ liệu liên thông, tiếp nhận một cửa','Giảm khai lại thông tin và đi lại'],['Điều phối quy hoạch và nguồn lực','Kết nối sản xuất, hạ tầng, thị trường']],{h:418,widths:[555,605],font:27});
 text(s,'Cơ chế tác động được kiểm tra bằng những trường hợp cụ thể.',60,625,1150,43,28,C.teal,true);
}
{
 const s=slide(6,'Nhu cầu kinh tế thúc đẩy thay đổi cách quản lý');
 await photo(s,old+'/port.jpg',60,188,722,428,'Hoạt động cảng Cái Mép',{rounded:true,source:'Ảnh cảng Cái Mép / SGGP. https://en.sggp.org.vn/ho-chi-minh-city-targets-10-percent-growth-in-2026-with-10-strategic-solutions-post123038.html'});
 text(s,'Chuỗi sản xuất\nkết nối nhiều\nđịa bàn',835,201,390,161,39,C.teal,true);
 text(s,'Quy hoạch, thủ tục và\nnguồn lực cần được\nphối hợp phù hợp.',835,422,390,153,31);
 foot(s,'Ảnh cảng Cái Mép / SGGP');
}
{
 const s=slide(7,'Đắk Lắk rút ngắn thời hạn đăng ký doanh nghiệp');
 text(s,'Thời hạn địa phương công bố năm 2024\nĐơn vị: ngày làm việc',60,164,820,79,26,C.muted);
 chart(s,{x:48,y:262,w:832,h:302,categories:['Thành lập mới','Một số thay đổi đăng ký'],series:[{name:'Trước điều chỉnh',values:[3,3],fill:C.before},{name:'Sau điều chỉnh',values:[2,1],fill:C.teal}],max:4,step:1,legend:true,labelSize:31});
 await photo(s,assets+'/service.jpg',925,178,295,379,'Ảnh minh họa phục vụ hành chính công tại Hóc Môn',{rounded:true});
 text(s,'Ảnh minh họa: Hóc Môn\nThanh Niên, 2025',925,568,295,52,17,C.muted);
 text(s,'Giảm 1 ngày\n33,3%',106,586,360,76,30,C.teal,true);
 text(s,'Giảm 2 ngày\n66,7%',535,586,360,76,30,C.teal,true);
 foot(s,'Nguồn  Cổng TTĐT Đắk Lắk, 21/03/2024. Tỷ lệ giảm do nhóm tính.',U.daklak);
}
{
 const s=slide(8,'Quy mô sắp xếp đơn vị hành chính năm 2025');
 text(s,'CẤP TỈNH',60,172,530,43,29,C.teal,true);
 text(s,'CẤP XÃ',680,172,540,43,29,C.teal,true);
 chart(s,{x:42,y:240,w:548,h:306,categories:['Trước','Sau'],series:[{name:'Số đơn vị cấp tỉnh',values:[63,34],points:beforeAfter,fill:C.teal}],max:80,step:20,labelSize:31});
 chart(s,{x:669,y:240,w:548,h:306,categories:['Trước','Sau'],series:[{name:'Số đơn vị cấp xã',values:[10035,3321],points:beforeAfter,fill:C.teal}],max:12000,step:3000,format:'#,##0',labelSize:31});
 text(s,'Giảm 29 đơn vị · 46,0%',80,561,530,45,29,C.teal,true);
 text(s,'Giảm 6.714 đơn vị · 66,9%',700,561,530,45,29,C.teal,true);
 text(s,'Vận hành hai cấp từ 01/7/2025. Kết thúc hoạt động cấp huyện.',60,621,1160,39,26,C.ink,true);
 foot(s,'Nguồn  Nghị quyết 202/2025/QH15 và Bộ Tài chính. Tỷ lệ giảm do nhóm tính.',U.communes);
 note(s,U.reform);
}
{
 const s=slide(9,'TP.HCM phối hợp đô thị, công nghiệp và cảng biển');
 await photo(s,assets+'/tpthuan.jpg',60,186,716,422,'Ảnh tư liệu cảng và kết nối logistics tại TP.HCM',{rounded:true});
 text(s,'Ba địa phương\ntrong một phạm vi\nquản trị mới',824,198,396,164,38,C.teal,true);
 text(s,'Quy hoạch, dữ liệu\nvà trách nhiệm\ncần thống nhất.',824,425,396,145,32);
 text(s,'Ảnh tư liệu logistics TP.HCM / MarketTimes, 2023',60,621,716,29,18,C.muted);
 foot(s,'Nguồn  Nghị quyết 202/2025/QH15.',U.reform);
 note(s,'Ba địa phương trước hợp nhất: TP.HCM, Bình Dương và Bà Rịa – Vũng Tàu.');
}
{
 const s=slide(10,'Quảng Ninh phân cấp và xử lý C/O trực tuyến');
 text(s,'15 / 21',60,181,337,104,76,C.teal,true);
 text(s,'Loại C/O thực hiện\nhoàn toàn trực tuyến',60,303,340,86,28);
 text(s,'1–2 giờ',435,181,345,104,76,C.teal,true);
 text(s,'Thời gian xử lý được báo cáo\nsau phân cấp từ 01/10/2025',435,303,390,92,26);
 await photo(s,assets+'/ecosys.jpg',835,185,385,298,'Ảnh minh họa giao diện hệ thống C/O điện tử eCoSys',{fit:'contain'});
 text(s,'Minh họa hệ thống eCoSys',835,497,385,28,18,C.muted);
 text(s,'Hồ sơ trung bình mỗi tháng được báo cáo\ntăng từ khoảng 1.500 lên 3.900.',60,459,725,101,32);
 text(s,'Hỗ trợ doanh nghiệp chủ động kế hoạch giao hàng.',60,599,1150,46,29,C.teal,true);
 foot(s,'Nguồn  Cổng TTĐT Quảng Ninh. Đối chiếu báo Quảng Ninh ngày 03/12/2025.',U.quangninh);
}
{
 const s=slide(11,'Kinh nghiệm đăng ký hộ kinh doanh tại Quận 3');
 text(s,'5 ngày',60,200,280,104,65,C.muted,true);
 text(s,'Mốc thời gian\ntrước cải tiến\nđược nguồn nêu',60,319,265,116,27);
 text(s,'4 giờ',355,200,245,104,65,C.teal,true);
 text(s,'Quy trình địa phương\ntriển khai, tư liệu\nnăm 2018 ghi nhận',355,319,267,116,27);
 await photo(s,assets+'/q3.jpg',650,186,570,356,'Ảnh tư liệu kiểm tra công tác cải cách hành chính Quận 3 năm 2018',{fit:'contain',rounded:true});
 text(s,'Ảnh tư liệu / Trang tin Thành ủy TP.HCM, 2018',650,548,570,27,17,C.muted);
 text(s,'955 giấy đăng ký cấp mới trong nhóm hồ sơ\ntheo quy trình 4 giờ, kỳ 01/01–31/10/2017.',60,583,1150,76,30,C.ink,true);
 foot(s,'Nguồn  Pháp Luật TP.HCM, 04/09/2018. Dẫn chứng trước sắp xếp năm 2025.',U.q3);
}
{
 const s=slide(12,'Tinh gọn tạo dư địa ngân sách cho phát triển');
 text(s,'39',60,157,470,183,151,C.teal,true);
 text(s,'nghìn tỷ đồng/năm',66,351,584,66,43,C.teal,true);
 text(s,'Mức giảm chi thường xuyên\nđược báo cáo ngày 12/10/2025',66,447,564,94,30);
 await photo(s,assets+'/bridge.jpg',678,172,542,295,'Ảnh minh họa công trình hạ tầng: cầu Bình Khánh',{rounded:true});
 text(s,'Ảnh minh họa hạ tầng / Báo Nhân Dân',678,479,542,28,18,C.muted);
 text(s,'Đánh giá lợi ích cần tính chi phí chuyển đổi\nvà theo dõi cách sử dụng nguồn lực.',60,581,1160,76,31,C.ink,true);
 foot(s,'Nguồn  Báo Điện tử Chính phủ, tổng kết tinh gọn bộ máy ngày 12/10/2025.',U.budget);
}
{
 const s=slide(13,'Đo hiệu quả bằng kết quả phục vụ');
 table(s,[['Câu hỏi đánh giá','Dữ liệu cần theo dõi'],['Hồ sơ có nhanh hơn?','Ngày nộp đầu, ngày nhận kết quả,\nthời gian xử lý hồ sơ hợp lệ'],['Người dân có ít tốn công hơn?','Số lượt đi lại, lần bổ sung, khoản chi'],['Nguồn lực có hiệu quả hơn?','Chi vận hành, chi chuyển đổi,\nkhối lượng công việc trên nhân lực'],['Kinh doanh có thuận lợi hơn?','Trải nghiệm doanh nghiệp,\ntiến độ đầu tư, chi phí phối hợp']],{h:420,widths:[475,685],font:27});
 text(s,'So sánh cùng thủ tục, cách tính thời gian\nvà nhóm hồ sơ tương đồng.',60,618,1150,75,29,C.teal,true);
}
{
 const s=slide(14,'',true);
 await photo(s,assets+'/closing.jpg',827,0,453,720,'Ảnh minh họa cán bộ hỗ trợ người dân tại điểm phục vụ hành chính công');
 text(s,'Chính trị mở đường\ncho kinh tế phát triển',60,65,733,132,48,C.white,true,'slide-title');
 text(s,'Đổi mới kinh tế là trọng tâm.\nĐổi mới chính trị có bước đi\nphù hợp.',60,277,720,147,36,C.white);
 text(s,'Thể chế phù hợp và thực thi tốt\ngiúp tháo gỡ vướng mắc\ncho kinh tế.',60,470,710,138,36,C.white);
 text(s,'Cảm ơn cả lớp',60,653,720,45,30,C.gold,true);
}

await fs.mkdir(build+'/previews',{recursive:true});
await (await PresentationFile.exportPptx(presentation)).save(build+'/draft.pptx');
console.log('Exported draft:',presentation.slides.items.length,'slides');
for(const [i,s] of presentation.slides.items.entries()){
 const png=await presentation.export({slide:s,format:'png',scale:1});
 await fs.writeFile(`${build}/previews/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await png.arrayBuffer()));
 console.log('Rendered',i+1);
}
