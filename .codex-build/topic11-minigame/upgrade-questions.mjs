import fs from 'node:fs/promises';
import {questions,source,policySource} from './questions.mjs';
const updates={
 'bac-ninh':{
  prompt:'GIẢ ĐỊNH tại Bắc Ninh: cơ quan đã được giao nhiệm vụ nhưng không có quyền ra quyết định. Ghép thuật ngữ 9 chữ chỉ yếu tố còn thiếu.',
  tokens:['Q','Ề','T','Y','M','N','Ẩ','U','H'],answer:'THẨMQUYỀN',
  explanation:'Thuật ngữ là THẨM QUYỀN. Giao nhiệm vụ phải đi cùng quyền quyết định và trách nhiệm tương ứng.',
  lesson:'Phân cấp cần bảo đảm cơ quan có quyền và điều kiện thực hiện nhiệm vụ.'
 },
 'phu-tho':{
  prompt:'Phú Thọ sau sắp xếp: muốn đánh giá tác động đến doanh nghiệp, chọn ĐÚNG HAI cách kiểm tra có cơ sở.',
  options:['So sánh cùng thủ tục, cùng cách tính thời gian.','Đo thêm số lượt đi lại và chi phí bổ sung hồ sơ.','Dùng thời hạn niêm yết thay cho mọi thời gian thực tế.','Suy ra hiệu quả kinh tế từ tỷ lệ giảm đầu mối.'],answer:[0,1],
  explanation:'Cần nhóm hồ sơ tương đồng và dữ liệu trải nghiệm thực tế. Thời hạn niêm yết, thời gian thực tế và số đầu mối phản ánh các mặt khác nhau.',
  lesson:'Chọn đúng chỉ tiêu trước khi kết luận tác động của sáp nhập.'
 },
 'tuyen-quang':{
  type:'Điền giải pháp còn thiếu',prompt:'GIẢ ĐỊNH tại Tuyên Quang: hồ sơ cũ có mã và định dạng khác nhau. Chọn việc ưu tiên để hạn chế yêu cầu người dân khai lại.',
  sentence:'Trước khi liên thông hồ sơ, cần _____ để dữ liệu nhận diện đúng và dùng lại được.',
  options:['đối soát và chuẩn hóa dữ liệu','thống nhất tên cơ quan trên báo cáo','đổi màu biểu mẫu tiếp nhận'],answer:'đối soát và chuẩn hóa dữ liệu',
  explanation:'Chuẩn hóa giúp dữ liệu từ các đơn vị cũ tương thích; đối soát giúp phát hiện trùng hoặc sai. Đổi tên cơ quan chưa giải quyết sự khác biệt dữ liệu.',
  lesson:'Cơ cấu mới cần khả năng liên thông dữ liệu và quy trình.'
 },
 'lao-cai':{
  type:'Nối vướng mắc với giải pháp',prompt:'GIẢ ĐỊNH tại Lào Cai sau hợp nhất: nối mỗi vướng mắc với giải pháp trực tiếp nhất.',
  rows:['Cấp dưới nhận việc nhưng thiếu quyền quyết định.','Hồ sơ bị yêu cầu nhập lại tại hai đầu mối.','Chưa biết người dân còn phải đi lại bao nhiêu lần.'],
  options:['Liên thông dữ liệu','Phân định thẩm quyền','Đo kết quả phục vụ'],
  answer:['Phân định thẩm quyền','Liên thông dữ liệu','Đo kết quả phục vụ'],
  explanation:'Thiếu quyền cần phân định thẩm quyền; nhập lại cần liên thông; thiếu dữ liệu trải nghiệm cần đo kết quả phục vụ.',
  lesson:'Giải pháp cần đi vào nguyên nhân của vướng mắc.'
 },
 'hung-yen':{
  prompt:'Sửa phần suy luận vượt quá bằng chứng trong bản tin về Hưng Yên sau sắp xếp.',
  sentence:'Việc giảm đầu mối [chứng minh thời gian thực tế đã giảm] dù chưa có dữ liệu hồ sơ.',
  options:['tạo điều kiện cải tiến nhưng cần đo thời gian thực tế','cho phép lấy thời hạn niêm yết thay cho thời gian thực tế','đủ để quy mọi thay đổi kinh doanh cho sáp nhập'],
  answer:'tạo điều kiện cải tiến nhưng cần đo thời gian thực tế',
  explanation:'Thay đổi cơ cấu mở ra điều kiện cải tiến. Muốn xác nhận thời gian giảm phải có dữ liệu hồ sơ so sánh phù hợp.',
  lesson:'Phân biệt cơ hội cải cách với kết quả đã được kiểm chứng.'
 },
 'hai-phong':{
  type:'Tìm suy luận thiếu căn cứ',prompt:'Nhóm đánh giá Hải Phòng sau hợp nhất. Chọn nhận định KHÔNG đủ căn cứ để kết luận hiệu quả kinh tế.',
  options:['Cần so sánh cùng tuyến vận tải và loại hàng.','Cần tính chi phí phối hợp và chuyển đổi.','Mức giảm đầu mối bằng đúng mức tăng năng suất.','Cần theo dõi trách nhiệm xử lý dự án liên khu vực.'],answer:2,
  explanation:'Số đầu mối và năng suất là hai chỉ tiêu khác nhau. Năng suất cần đo sản lượng hoặc khối lượng việc trên nguồn lực tương ứng.',
  lesson:'Số liệu cơ cấu không tự xác định mức tăng năng suất.'
 },
 'ninh-binh':{
  type:'Tính chi phí chuyển đổi',prompt:'GIẢ ĐỊNH tại Ninh Bình: trước hợp nhất có 3 đầu mối, mỗi nơi chi 240 triệu/năm. Sau hợp nhất chi vận hành 360 triệu/năm, chuyển đổi một lần 180 triệu. Tính số tiết kiệm.',
  labels:['Năm đầu, sau chi chuyển đổi (triệu đồng)','Mỗi năm sau, nếu chi vận hành giữ nguyên (triệu đồng)'],answer:[180,360],
  explanation:'Trước: 3 × 240 = 720 triệu/năm. Năm đầu: 720 − 360 − 180 = 180 triệu. Năm sau: 720 − 360 = 360 triệu. Toàn bộ số liệu là giả định.',
  lesson:'Lợi ích ròng cần tính chi phí chuyển đổi và thời kỳ đánh giá.'
 },
 'cao-bang':{
  prompt:'Cao Bằng giữ nguyên cấp tỉnh nhưng vẫn cần đổi mới quản trị. Lật và ghép bốn công cụ với tác dụng trực tiếp của chúng.',
  pairs:[['Phân cấp','Giao quyền quyết định'],['Liên thông dữ liệu','Giảm khai lại thông tin'],['Trách nhiệm giải trình','Làm rõ trách nhiệm xử lý'],['Đo thời gian thực tế','Kiểm tra mức chờ đợi']],
  explanation:'Bốn cặp gắn công cụ quản trị với tác dụng trực tiếp. Hiệu quả cuối cùng còn phụ thuộc cách triển khai.',
  lesson:'Đổi mới quản trị cần thiết cả ở nơi giữ nguyên địa giới.'
 },
 'dien-bien':{
  prompt:'GIẢ ĐỊNH tại Điện Biên: trong 120 hồ sơ, 70 hồ sơ giảm được 2 lượt đi lại, 50 hồ sơ giảm được 1 lượt. Tổng số lượt đi lại giảm là bao nhiêu?',
  inputLabel:'Tổng số lượt đi lại giảm',answer:190,
  explanation:'70 × 2 + 50 × 1 = 190 lượt. Đây là tổng số lượt giảm trong tình huống giả định, không phải số hồ sơ hay tỷ lệ phần trăm.',
  lesson:'Đo lợi ích phục vụ bằng đúng đơn vị và đúng nhóm hồ sơ.'
 },
 'lai-chau':{
  type:'Thanh trượt tỷ lệ tổng hợp',prompt:'GIẢ ĐỊNH tại Lai Châu: khu trung tâm có 60/80 hồ sơ đúng hạn, vùng xa có 10/20. Kéo đến tỷ lệ đúng hạn CHUNG (%), không lấy trung bình hai tỷ lệ.',
  min:0,max:100,answer:70,rangeLabel:'Tỷ lệ hồ sơ đúng hạn chung, phần trăm',
  explanation:'Tỷ lệ chung = (60 + 10) / (80 + 20) × 100% = 70%. Trung bình 75% và 50% cho 62,5% sẽ sai vì hai nhóm có quy mô khác nhau.',
  lesson:'Tỷ lệ tổng hợp cần tính theo số hồ sơ của từng nhóm.'
 },
 'lang-son':{
  prompt:'Tại Lạng Sơn, giao quyền quyết định cho cấp dưới là công cụ quản trị nào? Tìm thuật ngữ 7 chữ KHÔNG DẤU trên một hàng, từ trái sang phải.',
  grid:['HOSOCAP','DU LIEU'.replaceAll(' ','' )+'X','TRACNHI','PHANCAP','THAMQYA','NGUONLC','PHAPLYX'],answer:'PHANCAP',
  explanation:'PHÂN CẤP là việc giao thẩm quyền phù hợp cho cấp dưới, gắn với trách nhiệm và điều kiện thực hiện.',
  lesson:'Giao quyền phải đi cùng năng lực, nguồn lực và kiểm tra.'
 },
 'son-la':{
  prompt:'GIẢ ĐỊNH tại Sơn La: tỷ lệ đúng hạn tăng nhưng người dân đi lại nhiều hơn. Chọn cách đánh giá rồi cách xử lý phù hợp.',
  steps:[{label:'Cần bổ sung dữ liệu nào?',options:['Số lượt đi lại và lần bổ sung hồ sơ','Chỉ thời hạn xử lý hồ sơ đã hợp lệ'],answer:0},{label:'Phát hiện hai đầu mối yêu cầu nhập lại thông tin. Ưu tiên gì?',options:['Tăng số quầy nhưng giữ nguyên bước nhập lại','Đối soát, liên thông và làm rõ trách nhiệm'],answer:1}],
  explanation:'Chỉ số đúng hạn chưa phản ánh toàn bộ trải nghiệm. Cần đo công sức người dân và xử lý nguyên nhân nhập lại dữ liệu.',
  lesson:'Đánh giá cải cách từ cả quy trình nội bộ và trải nghiệm người sử dụng.'
 },
 'thanh-hoa':{
  prompt:'GIẢ ĐỊNH tại Thanh Hóa: xếp bốn bước cải tiến để có căn cứ trước can thiệp, quyền hạn trước thực thi và kiểm chứng sau thí điểm.',
  items:['So sánh kết quả với dữ liệu ban đầu','Làm rõ nhiệm vụ và thẩm quyền','Đo hiện trạng, xác định khâu gây chậm','Bố trí nguồn lực, thí điểm quy trình mới'],answer:[2,1,3,0],
  explanation:'Đo hiện trạng → làm rõ quyền hạn → bố trí nguồn lực và thí điểm → so sánh kết quả. Cần dữ liệu ban đầu để đánh giá thay đổi.',
  lesson:'Thiết kế cải cách cần gắn chẩn đoán, thực hiện và kiểm chứng.'
 },
 'ha-tinh':{
  prompt:'Nhóm Hà Tĩnh cần kiểm chứng tỷ lệ doanh nghiệp dành trên 10% thời gian cho quy định pháp luật NĂM 2024 trên phạm vi cả nước. Chọn nguồn và lý do.',
  options:['Báo cáo PCI 2024 của VCCI, đúng chỉ tiêu','Báo cáo địa phương về hồ sơ đúng hạn năm 2024','Khảo sát doanh nghiệp năm 2025 với chỉ tiêu khác'],
  reasons:['Khớp năm, phạm vi và định nghĩa chỉ tiêu cần kiểm chứng','Dữ liệu mới hơn luôn thay thế được mọi chỉ tiêu cũ'],answer:[0,0],
  explanation:'PCI 2024 nêu gần 24% doanh nghiệp dành trên 10% thời gian cho quy định, so với khoảng 20% năm 2023. Cần kiểm tra đúng chỉ tiêu, năm và phạm vi.',
  lesson:'Nguồn đáng tin cần phù hợp chính xác với câu hỏi nghiên cứu.'
 },
 'hue':{
  prompt:'Huế giữ nguyên cấp tỉnh. Hoàn thành ba tình huống về cách kiểm chứng hiệu quả đổi mới quản trị.',
  steps:[{label:'Hai nơi có thời gian xử lý khác nhau nhưng cơ cấu hồ sơ khác nhau. Nên?',options:['Chọn nhóm hồ sơ tương đồng để đối chiếu','Xếp hạng ngay theo thời gian trung bình'],answer:0},{label:'Khối lượng hồ sơ tăng nhưng nhân lực cũng tăng. Có thể suy ra năng suất tăng cùng tỷ lệ?',options:['Có','Chưa đủ dữ liệu'],answer:1},{label:'Tỷ lệ đúng hạn tăng nhưng số lượt bổ sung tăng. Nên?',options:['Bổ sung dữ liệu trải nghiệm và rà lại quy trình','Kết luận hoàn thành cải cách theo một chỉ tiêu'],answer:0}],
  explanation:'Cần so sánh đối tượng tương đồng, tính đến nguồn lực và theo dõi trải nghiệm. Một chỉ tiêu riêng lẻ chưa đủ để đánh giá toàn bộ cải cách.',
  lesson:'Kết luận cần tương xứng với bằng chứng.'
 },
 'lam-dong':{
  prompt:'Lâm Đồng có địa bàn rộng sau hợp nhất. Chọn đúng BA biện pháp giúp giảm đầu mối gắn với chất lượng phục vụ.',
  options:['Bố trí điểm hỗ trợ phù hợp dân cư và địa bàn.','Chuẩn hóa dữ liệu, giảm khai lại thông tin.','Đo thời gian thực tế và chi phí người dân.','Tập trung mọi việc tại một nơi dù phải đi xa.','Đánh giá hiệu quả chỉ bằng số cán bộ đã giảm.'],answer:[0,1,2],
  explanation:'Điểm phục vụ phù hợp, dữ liệu liên thông và đo kết quả giúp gắn tinh gọn với trải nghiệm người dân. Địa bàn mở rộng cần điều kiện thực thi tương ứng.',
  lesson:'Tinh gọn cần đi cùng khả năng tiếp cận dịch vụ.'
 },
 'can-tho':{
  prompt:'Đọc dữ liệu GIẢ ĐỊNH tại Cần Thơ rồi chọn kết quả tính toán và kết luận phù hợp.',
  passage:'Trước cải tiến: 60/80 hồ sơ đúng hạn. Sau cải tiến: 90/100 hồ sơ đúng hạn. Chưa biết cơ cấu hồ sơ và nhân lực hai kỳ.',
  fields:[{label:'Tỷ lệ đúng hạn tăng bao nhiêu?',options:['15 điểm phần trăm','30 điểm phần trăm','15% so với tỷ lệ trước']},{label:'Có thể kết luận gì về nguyên nhân?',options:['Chưa đủ căn cứ quy toàn bộ mức tăng cho cải tiến','Đã chứng minh toàn bộ mức tăng do cải tiến','Đã chứng minh năng suất mỗi cán bộ tăng 50%']}],
  answer:['15 điểm phần trăm','Chưa đủ căn cứ quy toàn bộ mức tăng cho cải tiến'],
  explanation:'60/80 = 75%; 90/100 = 90%; tăng 15 điểm phần trăm, tương đương tăng tương đối 20%. Cần thêm dữ liệu để đánh giá nguyên nhân và năng suất.',
  lesson:'Phân biệt điểm phần trăm, phần trăm tăng và quan hệ nhân quả.'
 }
};
for(const q of questions){
 if(updates[q.id]){Object.assign(q,updates[q.id]);q.revision=(q.revision||1)+1;}
 if(q.slide){
  q.slide=q.slide>1?q.slide-1:q.slide;
  q.lesson=q.lesson.replace(/^Liên hệ slide [^.]+\.\s*/,'');
 }
}
for(const q of questions){
 if(q.kind==='wordsearch'&&(q.grid.length!==7||q.grid.some(r=>r.length!==7)))throw new Error('Invalid word grid');
 if(q.kind==='letters'&&[...q.answer].sort().join('')!==[...q.tokens.join('')].sort().join(''))throw new Error('Letter bank mismatch');
}
await fs.writeFile(new URL('./questions.mjs',import.meta.url),`export const source = ${JSON.stringify(source)};\nexport const policySource = ${JSON.stringify(policySource)};\n\n// 34 provinces, 34 formats; scenarios marked hypothetical. Slide refs match the current 14-slide deck.\nexport const questions = ${JSON.stringify(questions,null,2)};\n`,'utf8');
console.log('Upgraded',Object.keys(updates).length,'questions; retained 34 unique formats.');
