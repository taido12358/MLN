import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'C:/Users/ADMIN/Downloads/MLN';
const BUILD = path.join(ROOT, '.codex-build/topic11-pptx');
const ASSETS = path.join(BUILD, 'assets');
const TOPIC = path.join(ROOT, 'Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may');
const C = { paper:'#F5F0E7', ink:'#242522', red:'#8B2937', muted:'#6C6860', pale:'#E6DDCF', white:'#FFFCF5', gold:'#DDBB7D' };
const V = {
  logistics:'https://vtv.vn/video/tp-ho-chi-minh-co-hoi-xay-dung-chuoi-logistics-sau-sap-nhap-108669006.htm',
  history:'https://vtv.vn/mua-xuan-truoc-doi-moi-tu-bao-cap-den-nhung-trai-ngot-dau-tien-100260218205311452.htm',
  launch:'https://vtv.vn/video/san-sang-cho-thoi-khac-lich-su-108669585.htm',
  capacity:'https://vtv.vn/video/can-day-manh-phan-cap-cho-can-bo-108674902.htm',
};
const SOURCES = {
  theory:'Giáo trình Triết học Mác – Lênin, Chương III, phần Biện chứng giữa cơ sở hạ tầng và kiến trúc thượng tầng. Tệp nguồn trong dự án giao-trinh-llct/md/Giao_trinh_Triet_hoc_ML.md.',
  reform:'https://baochinhphu.vn/nghi-quyet-cua-quoc-hoi-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-102250612191145158.htm',
  delegation:'https://xaydungchinhsach.chinhphu.vn/cong-bo-cac-nghi-dinh-ve-phan-cap-phan-quyen-phan-dinh-tham-quyen-119250612134828114.htm',
  update:'https://quochoi.vn/vanphongquochoi/cocautochuc/Pages/trang-chu.aspx?ItemID=100638',
  music:'A Kind Of Hope by Scott Buckley, released under CC BY 4.0. https://www.scottbuckley.com.au/library/a-kind-of-hope/ . Edited excerpts with fades. https://www.scottbuckley.com.au/library/using-this-music/',
  city:'Ảnh TP.HCM, Hoàng Triều / Báo Người Lao Động. https://nld.com.vn/ngay-mai-29-4-khoi-cong-tuyen-metro-ben-thanh-thu-thiem-tang-toc-ket-noi-san-bay-long-thanh-196260428164348959.htm',
  port:'Ảnh cảng Cái Mép / SGGP. https://en.sggp.org.vn/ho-chi-minh-city-targets-10-percent-growth-in-2026-with-10-strategic-solutions-post123038.html',
};

export async function buildTopic11(artifactSession, write) {
  const markdown = await fs.readFile(path.join(TOPIC, 'slides.md'), 'utf8');
  const chunks = markdown.split(/(?=^## Slide \d+)/m).filter(s => /^## Slide \d+/.test(s));
  await artifactSession.run(async ({presentation,session}) => {
    if (presentation.slides.items.length) throw new Error('Presentation must be empty before the first build.');
    presentation.theme.defaultFont = 'Arial';
    let serial = 0;
    function text(slide, value, x, y, w, h, size=28, color=C.ink, bold=false, name) {
      const box = slide.shapes.add({
        name:name ?? `text-${++serial}`,
        geometry:'textbox',
        position:{left:x,top:y,width:w,height:h},
        fill:'none',
        line:{fill:'none',width:0},
      });
      box.text=value;
      box.text.style={fontSize:size,typeface:'Arial',color,bold,insets:0,wrap:'square',autoFit:'none',verticalAlignment:'top'};
      return box;
    }
    function slide(number,title,dark=false) {
      const s=presentation.slides.add();
      s.setViewportSize(1280,720);
      s.background.fill=dark?C.red:C.paper;
      if(title) text(s,title,64,46,1150,110,44,dark?C.white:C.ink,true,'slide-title');
      text(s,String(number).padStart(2,'0'),1170,660,48,26,18,dark?C.gold:C.muted,false,'page-number');
      s.speakerNotes.text=chunks[number-1].replace(/^## Slide[^\n]+\n/,'').replace(/\*\*/g,'').trim()+'\n\n'+SOURCES.theory;
      return s;
    }
    function label(s,value,x,y,w=500,color=C.red,size=26) {return text(s,value,x,y,w,65,size,color,true);}
    function para(s,value,x,y,w=500,h=125,size=28,color=C.ink) {return text(s,value,x,y,w,h,size,color);}
    async function photo(s,file,x,y,w,h,alt,uri) {
      const blob=new Uint8Array(await fs.readFile(path.join(ASSETS,file)));
      const image=s.images.add({blob,contentType:file==='V2.jpg'?'image/png':'image/jpeg',alt,fit:'cover',position:{left:x,top:y,width:w,height:h}});
      if(uri) image.hyperlink={uri,isExternal:true};
      return image;
    }
    function link(s,value,url,x,y,w=650,color=C.red) {
      const item=text(s,value,x,y,w,35,21,color,true);
      item.hyperlink={uri:url,isExternal:true};
      item.text.get(value).link={uri:url,isExternal:true};
      return item;
    }
    function note(s,value) {s.speakerNotes.append('\n\n'+value);}
    function table(s,values,y=190,height=365,widths=[565,565]) {
      const t=s.tables.add({rows:values.length,columns:values[0].length,left:64,top:y,width:1130,height,columnWidths:widths,values});
      t.borders.assign({fill:C.pale,width:1,style:'solid'});
      for(let r=0;r<values.length;r++) {
        for(let c=0;c<values[r].length;c++) {
          const cell=t.getCell(r,c);
          cell.fill=r===0?C.red:C.paper;
          cell.text.style={fontSize:r===0?29:27,typeface:'Arial',bold:r===0,color:r===0?C.white:C.ink,insets:16,verticalAlignment:'middle',autoFit:'none'};
        }
      }
      return t;
    }

    // 1. A restrained cover with editable type and a sourced city photograph.
    {
      const s=slide(1,'',true);
      await photo(s,'city.jpg',780,0,500,720,'Cảnh quan TP.HCM bên sông Sài Gòn');
      text(s,'CHỦ ĐỀ 11',64,74,600,40,23,C.gold,true);
      text(s,'Đổi mới kinh tế\nđi cùng\nđổi mới chính trị',64,180,690,286,67,C.white,true,'slide-title');
      para(s,'Bài học từ sáp nhập và tinh gọn\nbộ máy ở Việt Nam',68,490,640,100,29,C.white);
      text(s,'Nghe nhạc mở đầu',68,642,420,32,19,C.gold,false,'music-intro');
      note(s,SOURCES.city+'\n'+SOURCES.music+'\nNhạc mở đầu dài 8 giây, phát bằng thao tác bấm dòng Nghe nhạc mở đầu.');
    }
    // 2. The hypothetical case introduces the administrative question.
    {
      const s=slide(2,'Một tình huống giải quyết hồ sơ');
      text(s,'Bộ máy gọn hơn,\ncông việc đã\nthuận tiện hơn?',64,196,640,290,55,C.red,true);
      const rows=[['01','Người dân nộp hồ sơ','Cần biết nơi tiếp nhận và thời hạn.'],['02','Cơ quan đã hợp nhất','Dữ liệu và quy trình cần thống nhất.'],['03','Người xử lý cần thẩm quyền','Mỗi việc cần người chịu trách nhiệm.']];
      rows.forEach((r,i)=>{const y=195+i*133;text(s,r[0],765,y,65,45,31,C.red,true);label(s,r[1],845,y,370,C.ink,28);para(s,r[2],845,y+48,350,70,24,C.muted);});
      text(s,'Tình huống giả định dùng để thảo luận',64,604,900,38,22,C.muted);
    }
    // 3. Plain editorial columns keep the two concepts distinct.
    {
      const s=slide(3,'Cơ sở hạ tầng và kiến trúc thượng tầng');
      label(s,'CƠ SỞ HẠ TẦNG',64,200,540,C.red,29);
      para(s,'Toàn bộ quan hệ sản xuất\nhợp thành cơ cấu kinh tế\nhiện thực của xã hội.',64,276,530,175,32);
      label(s,'KIẾN TRÚC THƯỢNG TẦNG',690,200,530,C.red,29);
      para(s,'Quan điểm, tư tưởng xã hội\nvà các thiết chế tương ứng,\ntrong đó có nhà nước và pháp luật.',690,276,525,190,31);
      text(s,'Quan hệ kinh tế và chính trị thể hiện tập trung mối quan hệ này.',64,546,1115,82,29,C.ink,true);
    }
    // 4. Native table retains the comparison as editable content.
    {
      const s=slide(4,'Nội dung của hai quá trình đổi mới');
      table(s,[['Đổi mới kinh tế','Đổi mới chính trị'],['Hoàn thiện cơ chế và thể chế kinh tế','Hoàn thiện tổ chức và thực hiện quyền lực'],['Phát huy động lực sản xuất','Đổi mới phương thức lãnh đạo, quản trị'],['Phân bổ nguồn lực hiệu quả','Phát huy dân chủ, giám sát và giải trình']],183,372);
      para(s,'Sắp xếp tổ chức là một nội dung của quá trình đổi mới chính trị.',64,589,1115,54,26,C.muted);
    }
    // 5. A contextual port photograph links to the selected source report.
    {
      const s=slide(5,'Kinh tế đặt ra yêu cầu đổi mới quản lý');
      await photo(s,'port.jpg',64,184,695,390,'Hoạt động cảng Cái Mép và vận tải container',V.logistics);
      label(s,'Sản xuất liên kết rộng hơn',810,196,405,C.red,31);
      para(s,'Hoạt động kinh tế vượt\nranh giới từng địa phương.',810,263,400,95,28);
      label(s,'Nhu cầu điều phối tăng',810,383,400,C.red,31);
      para(s,'Thể chế và bộ máy cần\nthích ứng với yêu cầu mới.',810,450,400,100,28);
      link(s,'Xem tư liệu VTV về logistics',V.logistics,64,594,675);
      text(s,'Nghe nhạc minh họa',810,597,390,32,20,C.muted,false,'music-bed');
      note(s,SOURCES.port+'\n'+V.logistics+'\n'+SOURCES.music+'\nĐoạn hình dự kiến 15 giây. Ảnh và liên kết mở phóng sự trực tuyến. Nhạc minh họa dài 15 giây, bấm dòng Nghe nhạc minh họa.');
    }
    // 6. Two spacious text columns explain the reverse mechanism.
    {
      const s=slide(6,'Chính trị tác động trở lại kinh tế');
      label(s,'Pháp luật xác định khuôn khổ',64,200,535,C.red,31);
      para(s,'Quyền và trách nhiệm rõ giúp\ncác chủ thể dự tính chi phí.',64,271,530,115,29);
      label(s,'Bộ máy tổ chức thực hiện',690,200,530,C.red,31);
      para(s,'Quy trình và phối hợp tốt giúp\ngiải quyết công việc nhất quán.',690,271,525,115,29);
      text(s,'Tác động kinh tế đi qua chất lượng thể chế\nvà năng lực thực thi.',64,472,1115,125,38,C.ink,true);
    }
    // 7. A dark pause slide states the two-way relationship.
    {
      const s=slide(7,'Sự gắn bó giữa hai quá trình',true);
      label(s,'KINH TẾ',64,207,500,C.gold,28);
      para(s,'Đặt ra yêu cầu và cung cấp\nđiều kiện vật chất cho đổi mới.',64,276,1110,110,39,C.white);
      label(s,'CHÍNH TRỊ',64,426,500,C.gold,28);
      para(s,'Tạo khuôn khổ và tổ chức thực hiện\nđể hoạt động kinh tế phát triển.',64,494,1110,110,39,C.white);
    }
    // 8. Source context stays visible next to the historical illustration.
    {
      const s=slide(8,'Bài học từ Đổi mới năm 1986');
      await photo(s,'V2.jpg',64,184,700,367,'Sổ đăng ký mua lương thực trong phóng sự VTV',V.history);
      text(s,'1986',817,181,390,112,86,C.red,true);
      label(s,'Yêu cầu từ thực tiễn',817,333,390,C.ink,29);
      para(s,'Đổi mới tư duy kinh tế\nvà cơ chế quản lý.',817,396,390,104,28);
      link(s,'Xem phóng sự về bối cảnh Đổi mới',V.history,64,579,725);
      text(s,'Tư liệu VTV phát ngày 18/02/2026',64,622,900,28,19,C.muted);
      note(s,V.history+'\nCảnh hiện vật được trình bày trong phóng sự về bối cảnh lịch sử. Đoạn dự kiến 30 giây, chọn phần liên hệ yêu cầu đời sống với thay đổi cơ chế.');
    }
    // 9. Date labels are editorial text, with the preparation footage below.
    {
      const s=slide(9,'Các mốc sắp xếp và hoàn thiện bộ máy');
      const years=[['2017','Nghị quyết 18-NQ/TW\nSắp xếp tổ chức bộ máy'],['2025','Sắp xếp đơn vị hành chính\nVận hành chính quyền hai cấp'],['2026','Kết luận 76-KL/TW\nTiếp tục hoàn thiện mô hình']];
      years.forEach((r,i)=>{const x=64+i*395;text(s,r[0],x,178,350,90,65,C.red,true);para(s,r[1],x,271,360,95,25);});
      await photo(s,'V3.jpg',64,390,500,263,'Tư liệu VTV về chuẩn bị vận hành mô hình mới',V.launch);
      label(s,'Chuẩn bị để vận hành liên tục',616,407,585,C.ink,31);
      para(s,'Con người và công cụ cần sẵn sàng\nkhi mô hình tổ chức thay đổi.',616,478,580,105,28);
      link(s,'Xem tư liệu VTV ngày 29/06/2025',V.launch,616,600,585);
      note(s,V.launch+'\n'+SOURCES.reform+'\n'+SOURCES.update+'\nNghị quyết 18-NQ/TW ngày 25/10/2017. Kết luận 76-KL/TW ngày 28/7/2026 theo thông tin nguồn đã dẫn trong tài liệu chủ đề. Đoạn video dự kiến 25 giây.');
    }
    // 10. Full source frame preserves the report's original context.
    {
      const s=slide(10,'TP.HCM và cơ hội liên kết kinh tế');
      await photo(s,'logistics.jpg',64,184,720,405,'Ảnh xem trước phóng sự VTV về cơ hội logistics',V.logistics);
      label(s,'Không gian liên kết',835,194,380,C.red,29);
      para(s,'Đô thị, công nghiệp\nvà hệ thống cảng biển.',835,256,370,111,28);
      label(s,'Điều kiện thực hiện',835,395,380,C.red,29);
      para(s,'Quy hoạch, dữ liệu\nvà trách nhiệm điều phối\ncần thống nhất.',835,457,370,139,28);
      link(s,'Xem phóng sự VTV',V.logistics,64,610,590);
      text(s,'Cơ hội và kỳ vọng, tư liệu 24/06/2025',674,617,540,28,18,C.muted);
      note(s,V.logistics+'\n'+SOURCES.reform+'\nTP.HCM mới hình thành từ TP.HCM, Bình Dương và Bà Rịa – Vũng Tàu theo Nghị quyết 202/2025/QH15. Phóng sự phát trước mốc vận hành tháng 7/2025. Đoạn dự kiến 30 giây.');
    }
    // 11. The selected report is paired with the four execution conditions.
    {
      const s=slide(11,'Phân cấp và năng lực thực thi');
      await photo(s,'V4.jpg',64,184,720,378,'Ảnh xem trước phóng sự VTV về phân cấp cho cán bộ',V.capacity);
      const items=[['Nhiệm vụ','Rõ công việc phải giải quyết'],['Thẩm quyền','Rõ người có quyền quyết định'],['Năng lực','Đủ chuyên môn để thực hiện'],['Nguồn lực','Có dữ liệu và công cụ hỗ trợ']];
      items.forEach((r,i)=>{const y=184+i*103;label(s,r[0],834,y,385,C.red,29);para(s,r[1],834,y+44,385,64,23);});
      link(s,'Xem phóng sự VTV ngày 23/08/2025',V.capacity,64,596,720);
      note(s,V.capacity+'\n'+SOURCES.delegation+'\nĐoạn dự kiến 35 giây. Sau video, phân tích điều kiện thực hiện nhiệm vụ và trách nhiệm giải trình.');
    }
    // 12. A second native table connects expectations with evaluation.
    {
      const s=slide(12,'Kỳ vọng và điều kiện cần kiểm tra');
      table(s,[['Kỳ vọng','Nội dung cần kiểm tra'],['Giảm chi phí trùng lặp','Tổng chi chuyển đổi và vận hành'],['Giải quyết công việc nhanh hơn','Thẩm quyền, khối lượng việc và phối hợp'],['Dịch vụ thuận tiện hơn','Khoảng cách và khả năng tiếp cận']],185,371);
      para(s,'Đánh giá lợi ích bằng dữ liệu thực tế sau khi mô hình đi vào hoạt động.',64,590,1130,66,27,C.muted);
    }
    // 13. Six lessons in a flat two-column editorial layout.
    {
      const s=slide(13,'Sáu bài học thực hiện');
      const lessons=[['01','Xuất phát từ yêu cầu phát triển'],['02','Đồng bộ pháp luật và tổ chức'],['03','Phân quyền đi cùng nguồn lực'],['04','Số hóa gắn với sửa quy trình'],['05','Bảo đảm quyền lợi và tham gia'],['06','Đo kết quả, điều chỉnh thường xuyên']];
      lessons.forEach((r,i)=>{const col=i<3?0:1;const row=i%3;const x=64+col*607;const y=195+row*143;text(s,r[0],x,y,85,75,47,C.red,true);para(s,r[1],x+103,y+7,465,103,30);});
      note(s,'Sáu ý là bài học phân tích vận dụng từ nội dung chủ đề. Giải thích thêm về kiểm soát quyền lực và trách nhiệm giải trình khi trình bày bài học thứ ba.');
    }
    // 14. The measures are proposals rather than invented performance data.
    {
      const s=slide(14,'Các thước đo hiệu quả phục vụ');
      label(s,'Thời gian xử lý',64,194,535,C.red,33);
      para(s,'Hồ sơ đúng hạn, số lần bổ sung\nvà thời gian chờ thực tế.',64,266,535,113,28);
      label(s,'Tổng chi phí xã hội',690,194,530,C.red,33);
      para(s,'Chi phí của cơ quan, người dân\nvà doanh nghiệp.',690,266,525,113,28);
      label(s,'Khả năng tiếp cận',64,430,535,C.red,33);
      para(s,'Mức thuận tiện và hài lòng\ncủa từng nhóm người sử dụng.',64,503,535,110,28);
      label(s,'Minh bạch và giải trình',690,430,530,C.red,33);
      para(s,'Theo dõi hồ sơ, phản ánh\nvà truy trách nhiệm xử lý.',690,503,525,110,28);
      note(s,'Các chỉ số trong slide là đề xuất đánh giá. Khi có dữ liệu, so sánh cùng loại công việc, tách giai đoạn chuyển tiếp và xem xét các yếu tố đồng thời khác.');
    }
    // 15. The closing question gives the class a concrete point of discussion.
    {
      const s=slide(15,'Mối quan hệ hai chiều trong đổi mới',true);
      para(s,'Kinh tế đặt ra yêu cầu và điều kiện\ncho đổi mới chính trị.',64,195,1120,118,41,C.white);
      para(s,'Thể chế và bộ máy phù hợp tạo\nđộng lực trở lại cho kinh tế.',64,354,1120,118,41,C.white);
      text(s,'Nếu người dân vẫn mất nhiều thời gian giải quyết công việc,\ncần điều chỉnh những gì?',64,536,1110,84,27,C.gold,true);
      text(s,'Nghe nhạc kết thúc',64,657,430,30,19,C.gold,false,'music-outro');
      text(s,'Nhạc Scott Buckley, CC BY 4.0',696,660,450,27,17,C.gold);
      note(s,SOURCES.music+'\nDừng phần kết luận rồi bấm Nghe nhạc kết thúc để phát đoạn 12 giây. Chuyển hỏi–đáp sau khi nhạc kết thúc. Video ở các slide trước mở qua liên kết trực tuyến và cần Internet.');
    }
    write({slides:presentation.slides.items.length});
  },{artifactType:'presentation'});
}

export async function exportDraft(artifactSession,write) {
  await artifactSession.run(async({presentation})=>{
    const blob=await presentation.export({format:'pptx'});
    await fs.writeFile(path.join(BUILD,'draft.pptx'),new Uint8Array(await blob.arrayBuffer()));
    write({draft:path.join(BUILD,'draft.pptx'),slides:presentation.slides.items.length});
  },{artifactType:'presentation'});
}
