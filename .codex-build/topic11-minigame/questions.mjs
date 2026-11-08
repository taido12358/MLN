export const source = "https://baochinhphu.vn/nghi-quyet-cua-quoc-hoi-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-102250612191145158.htm";
export const policySource = "https://xaydungchinhsach.chinhphu.vn/cong-bo-cac-nghi-dinh-ve-phan-cap-phan-quyen-phan-dinh-tham-quyen-119250612134828114.htm";

// 34 provinces, 34 formats. Slide refs match the current 14-slide deck.
export const questions = [
  {
    "id": "ha-noi",
    "name": "Hà Nội",
    "region": "bac",
    "kind": "binary",
    "type": "Có hay không",
    "prompt": "Hà Nội giữ nguyên cấp tỉnh năm 2025. Theo quan hệ kinh tế và chính trị trong giáo trình, có thể quy mọi kết quả phát triển kinh tế chỉ cho quyết định tổ chức bộ máy không?",
    "options": [
      "Có",
      "Không"
    ],
    "answer": 1,
    "explanation": "Kinh tế quyết định chính trị xét đến cùng. Chính trị có tính độc lập tương đối và tác động trở lại kinh tế. Giáo trình nhấn mạnh lấy đổi mới kinh tế làm trọng tâm, đồng thời đổi mới chính trị từng bước phù hợp.",
    "lesson": "Kết hợp đổi mới kinh tế và đổi mới chính trị trong điều kiện thực tiễn.",
    "revision": 2,
    "slide": 2,
    "sourceUrl": "../../../giao-trinh-llct/md/Giao_trinh_Triet_hoc_ML.md",
    "sourceLabel": "Giáo trình Triết học Mác – Lênin trong dự án"
  },
  {
    "id": "bac-ninh",
    "name": "Bắc Ninh",
    "region": "bac",
    "kind": "letters",
    "type": "Ghép chữ",
    "prompt": "GIẢ ĐỊNH tại Bắc Ninh: cơ quan đã được giao nhiệm vụ nhưng không có quyền ra quyết định. Ghép thuật ngữ 9 chữ chỉ yếu tố còn thiếu.",
    "tokens": [
      "Q",
      "Ề",
      "T",
      "Y",
      "M",
      "N",
      "Ẩ",
      "U",
      "H"
    ],
    "answer": "THẨMQUYỀN",
    "explanation": "Thuật ngữ là THẨM QUYỀN. Giao nhiệm vụ phải đi cùng quyền quyết định và trách nhiệm tương ứng.",
    "lesson": "Phân cấp cần bảo đảm cơ quan có quyền và điều kiện thực hiện nhiệm vụ.",
    "revision": 2,
    "slide": 5
  },
  {
    "id": "phu-tho",
    "name": "Phú Thọ",
    "region": "bac",
    "kind": "double",
    "type": "Chọn đúng hai",
    "prompt": "Phú Thọ sau sắp xếp: muốn đánh giá tác động đến doanh nghiệp, chọn ĐÚNG HAI cách kiểm tra có cơ sở.",
    "options": [
      "So sánh cùng thủ tục, cùng cách tính thời gian.",
      "Đo thêm số lượt đi lại và chi phí bổ sung hồ sơ.",
      "Dùng thời hạn niêm yết thay cho mọi thời gian thực tế.",
      "Suy ra hiệu quả kinh tế từ tỷ lệ giảm đầu mối."
    ],
    "answer": [
      0,
      1
    ],
    "explanation": "Cần nhóm hồ sơ tương đồng và dữ liệu trải nghiệm thực tế. Thời hạn niêm yết, thời gian thực tế và số đầu mối phản ánh các mặt khác nhau.",
    "lesson": "Chọn đúng chỉ tiêu trước khi kết luận tác động của sáp nhập.",
    "slide": 13,
    "revision": 2
  },
  {
    "id": "tuyen-quang",
    "name": "Tuyên Quang",
    "region": "bac",
    "kind": "cloze",
    "type": "Điền giải pháp còn thiếu",
    "prompt": "GIẢ ĐỊNH tại Tuyên Quang: hồ sơ cũ có mã và định dạng khác nhau. Chọn việc ưu tiên để hạn chế yêu cầu người dân khai lại.",
    "sentence": "Trước khi liên thông hồ sơ, cần _____ để dữ liệu nhận diện đúng và dùng lại được.",
    "options": [
      "đối soát và chuẩn hóa dữ liệu",
      "thống nhất tên cơ quan trên báo cáo",
      "đổi màu biểu mẫu tiếp nhận"
    ],
    "answer": "đối soát và chuẩn hóa dữ liệu",
    "explanation": "Chuẩn hóa giúp dữ liệu từ các đơn vị cũ tương thích; đối soát giúp phát hiện trùng hoặc sai. Đổi tên cơ quan chưa giải quyết sự khác biệt dữ liệu.",
    "lesson": "Cơ cấu mới cần khả năng liên thông dữ liệu và quy trình.",
    "revision": 2,
    "slide": 5
  },
  {
    "id": "lao-cai",
    "name": "Lào Cai",
    "region": "bac",
    "kind": "matching",
    "type": "Nối vướng mắc với giải pháp",
    "prompt": "GIẢ ĐỊNH tại Lào Cai sau hợp nhất: nối mỗi vướng mắc với giải pháp trực tiếp nhất.",
    "rows": [
      "Cấp dưới nhận việc nhưng thiếu quyền quyết định.",
      "Hồ sơ bị yêu cầu nhập lại tại hai đầu mối.",
      "Chưa biết người dân còn phải đi lại bao nhiêu lần."
    ],
    "options": [
      "Liên thông dữ liệu",
      "Phân định thẩm quyền",
      "Đo kết quả phục vụ"
    ],
    "answer": [
      "Phân định thẩm quyền",
      "Liên thông dữ liệu",
      "Đo kết quả phục vụ"
    ],
    "explanation": "Thiếu quyền cần phân định thẩm quyền; nhập lại cần liên thông; thiếu dữ liệu trải nghiệm cần đo kết quả phục vụ.",
    "lesson": "Giải pháp cần đi vào nguyên nhân của vướng mắc.",
    "revision": 2,
    "slide": 5
  },
  {
    "id": "thai-nguyen",
    "name": "Thái Nguyên",
    "region": "bac",
    "kind": "vowels",
    "type": "Khôi phục nguyên âm",
    "prompt": "Tỉnh nào hợp nhất với Thái Nguyên? Khôi phục hai nguyên âm trong tên B_C K_N.",
    "answer": [
      "Ắ",
      "Ạ"
    ],
    "explanation": "Tên cần tìm là Bắc Kạn. Bắc Kạn và Thái Nguyên hợp nhất thành Thái Nguyên.",
    "lesson": "Sắp xếp tên gọi cần gắn với cập nhật dữ liệu."
  },
  {
    "id": "hung-yen",
    "name": "Hưng Yên",
    "region": "bac",
    "kind": "correction",
    "type": "Sửa bản tin",
    "prompt": "Sửa phần suy luận vượt quá bằng chứng trong bản tin về Hưng Yên sau sắp xếp.",
    "sentence": "Việc giảm đầu mối [chứng minh thời gian thực tế đã giảm] dù chưa có dữ liệu hồ sơ.",
    "options": [
      "tạo điều kiện cải tiến nhưng cần đo thời gian thực tế",
      "cho phép lấy thời hạn niêm yết thay cho thời gian thực tế",
      "đủ để quy mọi thay đổi kinh doanh cho sáp nhập"
    ],
    "answer": "tạo điều kiện cải tiến nhưng cần đo thời gian thực tế",
    "explanation": "Thay đổi cơ cấu mở ra điều kiện cải tiến. Muốn xác nhận thời gian giảm phải có dữ liệu hồ sơ so sánh phù hợp.",
    "lesson": "Phân biệt cơ hội cải cách với kết quả đã được kiểm chứng.",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "hai-phong",
    "name": "Hải Phòng",
    "region": "bac",
    "kind": "odd",
    "type": "Tìm suy luận thiếu căn cứ",
    "prompt": "Nhóm đánh giá Hải Phòng sau hợp nhất. Chọn nhận định KHÔNG đủ căn cứ để kết luận hiệu quả kinh tế.",
    "options": [
      "Cần so sánh cùng tuyến vận tải và loại hàng.",
      "Cần tính chi phí phối hợp và chuyển đổi.",
      "Mức giảm đầu mối bằng đúng mức tăng năng suất.",
      "Cần theo dõi trách nhiệm xử lý dự án liên khu vực."
    ],
    "answer": 2,
    "explanation": "Số đầu mối và năng suất là hai chỉ tiêu khác nhau. Năng suất cần đo sản lượng hoặc khối lượng việc trên nguồn lực tương ứng.",
    "lesson": "Số liệu cơ cấu không tự xác định mức tăng năng suất.",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "ninh-binh",
    "name": "Ninh Bình",
    "region": "bac",
    "kind": "equation",
    "type": "Tính chi phí chuyển đổi",
    "prompt": "GIẢ ĐỊNH tại Ninh Bình: trước hợp nhất có 3 đầu mối, mỗi nơi chi 240 triệu/năm. Sau hợp nhất chi vận hành 360 triệu/năm, chuyển đổi một lần 180 triệu. Tính số tiết kiệm.",
    "labels": [
      "Năm đầu, sau chi chuyển đổi (triệu đồng)",
      "Mỗi năm sau, nếu chi vận hành giữ nguyên (triệu đồng)"
    ],
    "answer": [
      180,
      360
    ],
    "explanation": "Trước: 3 × 240 = 720 triệu/năm. Năm đầu: 720 − 360 − 180 = 180 triệu. Năm sau: 720 − 360 = 360 triệu. Toàn bộ số liệu là giả định.",
    "lesson": "Lợi ích ròng cần tính chi phí chuyển đổi và thời kỳ đánh giá.",
    "revision": 2,
    "slide": 12
  },
  {
    "id": "quang-ninh",
    "name": "Quảng Ninh",
    "region": "bac",
    "kind": "truth-matrix",
    "type": "Bảng đúng sai",
    "prompt": "Đọc số liệu cấp C/O được Quảng Ninh báo cáo sau phân cấp từ 01/10/2025. Đánh dấu đúng hoặc sai cho từng nhận định.",
    "rows": [
      "Có 15 trong 21 loại C/O thực hiện hoàn toàn trực tuyến.",
      "Số hồ sơ tăng tự nó chứng minh năng suất mỗi cán bộ tăng đúng bằng mức ấy.",
      "Thời gian xử lý được báo cáo còn 1–2 giờ làm việc."
    ],
    "options": [
      "Đúng",
      "Sai"
    ],
    "answer": [
      "Đúng",
      "Sai",
      "Đúng"
    ],
    "explanation": "Nguồn địa phương nêu 15/21 loại C/O trực tuyến và thời gian còn 1–2 giờ. Muốn đánh giá năng suất cần thêm dữ liệu nhân lực và khối lượng công việc. Quảng Ninh giữ nguyên cấp tỉnh trong đợt 2025.",
    "lesson": "Phân cấp và dữ liệu trực tuyến tạo điều kiện phục vụ xuất khẩu.",
    "revision": 2,
    "slide": 10,
    "sourceUrl": "https://www.quangninh.gov.vn/Trang/ChiTietTinTuc.aspx?nid=160925",
    "sourceLabel": "Nguồn số liệu C/O Quảng Ninh"
  },
  {
    "id": "cao-bang",
    "name": "Cao Bằng",
    "region": "bac",
    "kind": "memory",
    "type": "Lật thẻ ghi nhớ",
    "prompt": "Cao Bằng giữ nguyên cấp tỉnh nhưng vẫn cần đổi mới quản trị. Lật và ghép bốn công cụ với tác dụng trực tiếp của chúng.",
    "pairs": [
      [
        "Phân cấp",
        "Giao quyền quyết định"
      ],
      [
        "Liên thông dữ liệu",
        "Giảm khai lại thông tin"
      ],
      [
        "Trách nhiệm giải trình",
        "Làm rõ trách nhiệm xử lý"
      ],
      [
        "Đo thời gian thực tế",
        "Kiểm tra mức chờ đợi"
      ]
    ],
    "explanation": "Bốn cặp gắn công cụ quản trị với tác dụng trực tiếp. Hiệu quả cuối cùng còn phụ thuộc cách triển khai.",
    "lesson": "Đổi mới quản trị cần thiết cả ở nơi giữ nguyên địa giới.",
    "revision": 2,
    "slide": 5
  },
  {
    "id": "dien-bien",
    "name": "Điện Biên",
    "region": "bac",
    "kind": "number",
    "type": "Tính nhanh con số",
    "prompt": "GIẢ ĐỊNH tại Điện Biên: trong 120 hồ sơ, 70 hồ sơ giảm được 2 lượt đi lại, 50 hồ sơ giảm được 1 lượt. Tổng số lượt đi lại giảm là bao nhiêu?",
    "answer": 190,
    "explanation": "70 × 2 + 50 × 1 = 190 lượt. Đây là tổng số lượt giảm trong tình huống giả định, không phải số hồ sơ hay tỷ lệ phần trăm.",
    "lesson": "Đo lợi ích phục vụ bằng đúng đơn vị và đúng nhóm hồ sơ.",
    "slide": 13,
    "inputLabel": "Tổng số lượt đi lại giảm",
    "revision": 2
  },
  {
    "id": "lai-chau",
    "name": "Lai Châu",
    "region": "bac",
    "kind": "slider",
    "type": "Thanh trượt tỷ lệ tổng hợp",
    "prompt": "GIẢ ĐỊNH tại Lai Châu: khu trung tâm có 60/80 hồ sơ đúng hạn, vùng xa có 10/20. Kéo đến tỷ lệ đúng hạn CHUNG (%), không lấy trung bình hai tỷ lệ.",
    "min": 0,
    "max": 100,
    "answer": 70,
    "explanation": "Tỷ lệ chung = (60 + 10) / (80 + 20) × 100% = 70%. Trung bình 75% và 50% cho 62,5% sẽ sai vì hai nhóm có quy mô khác nhau.",
    "lesson": "Tỷ lệ tổng hợp cần tính theo số hồ sơ của từng nhóm.",
    "rangeLabel": "Tỷ lệ hồ sơ đúng hạn chung, phần trăm",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "lang-son",
    "name": "Lạng Sơn",
    "region": "bac",
    "kind": "wordsearch",
    "type": "Tìm chữ trong lưới",
    "prompt": "Tại Lạng Sơn, giao quyền quyết định cho cấp dưới là công cụ quản trị nào? Tìm thuật ngữ 7 chữ KHÔNG DẤU trên một hàng, từ trái sang phải.",
    "grid": [
      "HOSOCAP",
      "DULIEUX",
      "TRACNHI",
      "PHANCAP",
      "THAMQYA",
      "NGUONLC",
      "PHAPLYX"
    ],
    "answer": "PHANCAP",
    "explanation": "PHÂN CẤP là việc giao thẩm quyền phù hợp cho cấp dưới, gắn với trách nhiệm và điều kiện thực hiện.",
    "lesson": "Giao quyền phải đi cùng năng lực, nguồn lực và kiểm tra.",
    "revision": 2,
    "slide": 5
  },
  {
    "id": "son-la",
    "name": "Sơn La",
    "region": "bac",
    "kind": "decision",
    "type": "Ngã rẽ quản trị",
    "prompt": "GIẢ ĐỊNH tại Sơn La: tỷ lệ đúng hạn tăng nhưng người dân đi lại nhiều hơn. Chọn cách đánh giá rồi cách xử lý phù hợp.",
    "steps": [
      {
        "label": "Cần bổ sung dữ liệu nào?",
        "options": [
          "Số lượt đi lại và lần bổ sung hồ sơ",
          "Chỉ thời hạn xử lý hồ sơ đã hợp lệ"
        ],
        "answer": 0
      },
      {
        "label": "Phát hiện hai đầu mối yêu cầu nhập lại thông tin. Ưu tiên gì?",
        "options": [
          "Tăng số quầy nhưng giữ nguyên bước nhập lại",
          "Đối soát, liên thông và làm rõ trách nhiệm"
        ],
        "answer": 1
      }
    ],
    "explanation": "Chỉ số đúng hạn chưa phản ánh toàn bộ trải nghiệm. Cần đo công sức người dân và xử lý nguyên nhân nhập lại dữ liệu.",
    "lesson": "Đánh giá cải cách từ cả quy trình nội bộ và trải nghiệm người sử dụng.",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "thanh-hoa",
    "name": "Thanh Hóa",
    "region": "trung",
    "kind": "policy-order",
    "type": "Xếp bước xử lý",
    "prompt": "GIẢ ĐỊNH tại Thanh Hóa: xếp bốn bước cải tiến để có căn cứ trước can thiệp, quyền hạn trước thực thi và kiểm chứng sau thí điểm.",
    "items": [
      "So sánh kết quả với dữ liệu ban đầu",
      "Làm rõ nhiệm vụ và thẩm quyền",
      "Đo hiện trạng, xác định khâu gây chậm",
      "Bố trí nguồn lực, thí điểm quy trình mới"
    ],
    "answer": [
      2,
      1,
      3,
      0
    ],
    "explanation": "Đo hiện trạng → làm rõ quyền hạn → bố trí nguồn lực và thí điểm → so sánh kết quả. Cần dữ liệu ban đầu để đánh giá thay đổi.",
    "lesson": "Thiết kế cải cách cần gắn chẩn đoán, thực hiện và kiểm chứng.",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "nghe-an",
    "name": "Nghệ An",
    "region": "trung",
    "kind": "classification",
    "type": "Phân loại nhiệm vụ",
    "prompt": "Nghệ An giữ nguyên cấp tỉnh năm 2025. Phân loại các chỉ số dùng để đánh giá cải cách quản trị.",
    "rows": [
      "Số đơn vị hành chính cấp tỉnh",
      "Số ngày người dân chờ nhận kết quả hồ sơ",
      "Số lượt đi lại để hoàn tất một thủ tục"
    ],
    "options": [
      "Thay đổi cơ cấu",
      "Kết quả phục vụ"
    ],
    "answer": [
      "Thay đổi cơ cấu",
      "Kết quả phục vụ",
      "Kết quả phục vụ"
    ],
    "explanation": "Số đơn vị phản ánh cơ cấu. Thời gian chờ và số lượt đi lại phản ánh kết quả phục vụ mà người dân trải nghiệm.",
    "lesson": "Đo hiệu quả bằng cùng loại thủ tục và cùng cách tính thời gian.",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "ha-tinh",
    "name": "Hà Tĩnh",
    "region": "trung",
    "kind": "evidence",
    "type": "Chọn nguồn kiểm chứng",
    "prompt": "Nhóm Hà Tĩnh cần kiểm chứng tỷ lệ doanh nghiệp dành trên 10% thời gian cho quy định pháp luật NĂM 2024 trên phạm vi cả nước. Chọn nguồn và lý do.",
    "options": [
      "Báo cáo PCI 2024 của VCCI, đúng chỉ tiêu",
      "Báo cáo địa phương về hồ sơ đúng hạn năm 2024",
      "Khảo sát doanh nghiệp năm 2025 với chỉ tiêu khác"
    ],
    "reasons": [
      "Khớp năm, phạm vi và định nghĩa chỉ tiêu cần kiểm chứng",
      "Dữ liệu mới hơn luôn thay thế được mọi chỉ tiêu cũ"
    ],
    "answer": [
      0,
      0
    ],
    "explanation": "PCI 2024 nêu gần 24% doanh nghiệp dành trên 10% thời gian cho quy định, so với khoảng 20% năm 2023. Cần kiểm tra đúng chỉ tiêu, năm và phạm vi.",
    "lesson": "Nguồn đáng tin cần phù hợp chính xác với câu hỏi nghiên cứu.",
    "revision": 3,
    "slide": 4,
    "sourceUrl": "https://pcivietnam.vn/uploads/VN-Bao-cao-dai-PCI/Layout-PCI-2024_VN.pdf#page=20",
    "sourceLabel": "Báo cáo PCI 2024, trang 20"
  },
  {
    "id": "quang-tri",
    "name": "Quảng Trị",
    "region": "trung",
    "kind": "timeline",
    "type": "Dòng thời gian",
    "prompt": "Quảng Bình và Quảng Trị hợp nhất thành Quảng Trị. Xếp các mốc từ sớm đến muộn.",
    "items": [
      "01/7/2025 — chính quyền mới hoạt động",
      "12/6/2025 — thông qua Nghị quyết 202",
      "23/8/2025 — tư liệu VTV về phân cấp"
    ],
    "answer": [
      1,
      0,
      2
    ],
    "explanation": "Thứ tự thời gian là 12/6, 01/7, rồi 23/8/2025. Mốc 23/8 là ngày tư liệu minh họa trong bài thuyết trình.",
    "lesson": "Phân biệt thời điểm quyết định, vận hành và đánh giá thực tiễn."
  },
  {
    "id": "hue",
    "name": "Huế",
    "region": "trung",
    "kind": "rapid",
    "type": "Ba câu liên tiếp",
    "prompt": "Huế giữ nguyên cấp tỉnh. Hoàn thành ba tình huống về cách kiểm chứng hiệu quả đổi mới quản trị.",
    "steps": [
      {
        "label": "Hai nơi có thời gian xử lý khác nhau nhưng cơ cấu hồ sơ khác nhau. Nên?",
        "options": [
          "Chọn nhóm hồ sơ tương đồng để đối chiếu",
          "Xếp hạng ngay theo thời gian trung bình"
        ],
        "answer": 0
      },
      {
        "label": "Khối lượng hồ sơ tăng nhưng nhân lực cũng tăng. Có thể suy ra năng suất tăng cùng tỷ lệ?",
        "options": [
          "Có",
          "Chưa đủ dữ liệu"
        ],
        "answer": 1
      },
      {
        "label": "Tỷ lệ đúng hạn tăng nhưng số lượt bổ sung tăng. Nên?",
        "options": [
          "Bổ sung dữ liệu trải nghiệm và rà lại quy trình",
          "Kết luận hoàn thành cải cách theo một chỉ tiêu"
        ],
        "answer": 0
      }
    ],
    "explanation": "Cần so sánh đối tượng tương đồng, tính đến nguồn lực và theo dõi trải nghiệm. Một chỉ tiêu riêng lẻ chưa đủ để đánh giá toàn bộ cải cách.",
    "lesson": "Kết luận cần tương xứng với bằng chứng.",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "da-nang",
    "name": "Đà Nẵng",
    "region": "trung",
    "kind": "connect",
    "type": "Nối điểm hợp nhất",
    "prompt": "Bấm chọn đúng hai địa phương trước sắp xếp, rồi nối với tên đơn vị sau hợp nhất.",
    "options": [
      "Quảng Nam",
      "Đà Nẵng",
      "Quảng Trị",
      "Huế"
    ],
    "targets": [
      "Đà Nẵng",
      "Quảng Ngãi",
      "Huế"
    ],
    "answer": [
      [
        0,
        1
      ],
      "Đà Nẵng"
    ],
    "explanation": "Quảng Nam và Đà Nẵng trước sắp xếp hợp nhất thành Đà Nẵng.",
    "lesson": "Không gian quản lý mới đặt ra yêu cầu điều phối phù hợp."
  },
  {
    "id": "quang-ngai",
    "name": "Quảng Ngãi",
    "region": "trung",
    "kind": "crossword",
    "type": "Ô chữ giao nhau",
    "prompt": "Điền chữ KHÔNG DẤU. Hàng ngang gồm 6 chữ là tỉnh hợp nhất với Quảng Ngãi. Hàng dọc gồm 9 chữ là tên tỉnh sau hợp nhất.",
    "across": "KONTUM",
    "down": "QUANGNGAI",
    "explanation": "Kon Tum hợp nhất với Quảng Ngãi thành tỉnh Quảng Ngãi. Hai tên giao nhau tại chữ N.",
    "lesson": "Hợp nhất tạo yêu cầu kết nối những địa bàn có đặc điểm khác nhau."
  },
  {
    "id": "gia-lai",
    "name": "Gia Lai",
    "region": "trung",
    "kind": "hints",
    "type": "Mở gợi ý đoán tên",
    "prompt": "Đoán tên tỉnh sau hợp nhất với địa phương Bình Định trước sắp xếp. Có thể mở thêm gợi ý.",
    "hints": [
      "Tên tỉnh có hai tiếng.",
      "Địa phương trước sắp xếp còn lại cũng mang tên này.",
      "Tên bắt đầu bằng GIA."
    ],
    "answer": "Gia Lai",
    "explanation": "Bình Định và Gia Lai trước sắp xếp hợp nhất thành tỉnh Gia Lai.",
    "lesson": "Liên kết kinh tế tạo yêu cầu tổ chức quản lý tương ứng."
  },
  {
    "id": "khanh-hoa",
    "name": "Khánh Hòa",
    "region": "trung",
    "kind": "sentence",
    "type": "Sắp câu bản tin",
    "prompt": "Bấm các cụm từ để tạo câu đúng theo thứ tự chủ thể, hành động và kết quả.",
    "tokens": [
      "thành Khánh Hòa.",
      "và Khánh Hòa",
      "Ninh Thuận",
      "hợp nhất"
    ],
    "answer": [
      2,
      1,
      3,
      0
    ],
    "explanation": "Ninh Thuận và Khánh Hòa hợp nhất thành Khánh Hòa.",
    "lesson": "Một quyết định tổ chức cần được thông tin rõ tới người dân."
  },
  {
    "id": "dak-lak",
    "name": "Đắk Lắk",
    "region": "trung",
    "kind": "fact-inference",
    "type": "Sự kiện hay phân tích",
    "prompt": "Theo thông tin Đắk Lắk công bố ngày 21/03/2024, phân biệt thời hạn được công bố với phân tích tác động kinh tế.",
    "rows": [
      "Thành lập mới doanh nghiệp được rút từ 3 xuống 2 ngày làm việc.",
      "Một số thay đổi đăng ký, gồm đổi tên doanh nghiệp, từ 3 xuống 1 ngày làm việc.",
      "Giảm thời gian chờ có thể giúp doanh nghiệp chủ động kế hoạch."
    ],
    "options": [
      "Thời hạn được công bố",
      "Phân tích vận dụng"
    ],
    "answer": [
      "Thời hạn được công bố",
      "Thời hạn được công bố",
      "Phân tích vận dụng"
    ],
    "explanation": "Hai dữ kiện đầu là thời hạn địa phương công bố năm 2024. Mức giảm lần lượt 1 ngày (33,3%) và 2 ngày (66,7%). Câu cuối phân tích cơ chế tác động. Kết quả từng hồ sơ cần được đo riêng.",
    "lesson": "Cải cách quy trình có thể được vận dụng khi tổ chức bộ máy mới.",
    "revision": 2,
    "slide": 7,
    "sourceUrl": "https://daklak.gov.vn/thong-tin-tuyen-truyen/-/asset_publisher/eTFgYrRjRQin/content/rut-ngan-thoi-gian-giai-quyet-mot-so-thu-tuc-hanh-chinh-thuoc-linh-vuc-ang-ky-doanh-nghiep",
    "sourceLabel": "Thông báo Đắk Lắk ngày 21/03/2024"
  },
  {
    "id": "lam-dong",
    "name": "Lâm Đồng",
    "region": "trung",
    "kind": "triple",
    "type": "Chọn bộ ba",
    "prompt": "Lâm Đồng có địa bàn rộng sau hợp nhất. Chọn đúng BA biện pháp giúp giảm đầu mối gắn với chất lượng phục vụ.",
    "options": [
      "Bố trí điểm hỗ trợ phù hợp dân cư và địa bàn.",
      "Chuẩn hóa dữ liệu, giảm khai lại thông tin.",
      "Đo thời gian thực tế và chi phí người dân.",
      "Tập trung mọi việc tại một nơi dù phải đi xa.",
      "Đánh giá hiệu quả chỉ bằng số cán bộ đã giảm."
    ],
    "answer": [
      0,
      1,
      2
    ],
    "explanation": "Điểm phục vụ phù hợp, dữ liệu liên thông và đo kết quả giúp gắn tinh gọn với trải nghiệm người dân. Địa bàn mở rộng cần điều kiện thực thi tương ứng.",
    "lesson": "Tinh gọn cần đi cùng khả năng tiếp cận dịch vụ.",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "tp-hcm",
    "name": "TP.HCM",
    "region": "nam",
    "kind": "budget",
    "type": "Phân bổ nguồn lực",
    "prompt": "TP.HCM năm 2025 hợp nhất từ TP.HCM, Bình Dương và Bà Rịa – Vũng Tàu. Để tổ chức phục vụ, hãy phân bổ 100 đơn vị ngân sách GIẢ ĐỊNH đáp ứng bốn yêu cầu dưới đây.",
    "labels": [
      "Phục vụ trực tiếp, ít nhất 30",
      "Hạ tầng dữ liệu, ít nhất 30",
      "Đào tạo cán bộ, ít nhất 20",
      "Dự phòng, ít nhất 10"
    ],
    "minimums": [
      30,
      30,
      20,
      10
    ],
    "total": 100,
    "explanation": "Ví dụ 30 + 30 + 20 + 20 = 100 đáp ứng các ngưỡng. Bài toán minh họa việc bố trí điều kiện thực hiện, số ngân sách là giả định. Tại Quận 3 trước đây, nguồn năm 2018 ghi nhận quy trình đăng ký hộ kinh doanh trong 4 giờ so với mốc 5 ngày trước cải tiến.",
    "lesson": "Quy hoạch thống nhất cần đi cùng quy trình và năng lực phục vụ.",
    "revision": 2,
    "slide": 9,
    "sourceUrl": "https://plo.vn/4-gio-xong-thu-tuc-dang-ky-kinh-doanh-post495617.html",
    "sourceLabel": "Kinh nghiệm đăng ký hộ kinh doanh Quận 3"
  },
  {
    "id": "dong-nai",
    "name": "Đồng Nai",
    "region": "nam",
    "kind": "assembly",
    "type": "Lắp sơ đồ trước sau",
    "prompt": "Điền đủ hai đầu vào và tên kết quả để lắp sơ đồ hợp nhất của Đồng Nai.",
    "fields": [
      {
        "label": "Địa phương thứ nhất",
        "options": [
          "Đồng Nai",
          "Tây Ninh",
          "Bình Dương"
        ]
      },
      {
        "label": "Địa phương thứ hai",
        "options": [
          "Bình Phước",
          "Long An",
          "Tiền Giang"
        ]
      },
      {
        "label": "Tên sau hợp nhất",
        "options": [
          "Đồng Nai",
          "Bình Phước",
          "TP.HCM"
        ]
      }
    ],
    "answer": [
      "Đồng Nai",
      "Bình Phước",
      "Đồng Nai"
    ],
    "explanation": "Đồng Nai và Bình Phước trước sắp xếp hợp nhất thành Đồng Nai.",
    "lesson": "Các đơn vị hợp nhất cần thống nhất dữ liệu và quy trình."
  },
  {
    "id": "tay-ninh",
    "name": "Tây Ninh",
    "region": "nam",
    "kind": "pin",
    "type": "Mật mã bốn số",
    "prompt": "Long An hợp nhất với Tây Ninh. Dùng NGÀY và THÁNG thông qua Nghị quyết 202/2025/QH15 làm mã gồm 4 chữ số, theo DDMM.",
    "answer": "1206",
    "explanation": "Nghị quyết được thông qua ngày 12/6/2025, nên mã là 1206. Long An và Tây Ninh hợp nhất thành Tây Ninh.",
    "lesson": "Cần phân biệt ngày thông qua với ngày chính quyền mới hoạt động."
  },
  {
    "id": "can-tho",
    "name": "Cần Thơ",
    "region": "nam",
    "kind": "reading",
    "type": "Đọc tin điền bảng",
    "prompt": "Đọc dữ liệu GIẢ ĐỊNH tại Cần Thơ rồi chọn kết quả tính toán và kết luận phù hợp.",
    "passage": "Trước cải tiến: 60/80 hồ sơ đúng hạn. Sau cải tiến: 90/100 hồ sơ đúng hạn. Chưa biết cơ cấu hồ sơ và nhân lực hai kỳ.",
    "fields": [
      {
        "label": "Tỷ lệ đúng hạn tăng bao nhiêu?",
        "options": [
          "15 điểm phần trăm",
          "30 điểm phần trăm",
          "15% so với tỷ lệ trước"
        ]
      },
      {
        "label": "Có thể kết luận gì về nguyên nhân?",
        "options": [
          "Chưa đủ căn cứ quy toàn bộ mức tăng cho cải tiến",
          "Đã chứng minh toàn bộ mức tăng do cải tiến",
          "Đã chứng minh năng suất mỗi cán bộ tăng 50%"
        ]
      }
    ],
    "answer": [
      "15 điểm phần trăm",
      "Chưa đủ căn cứ quy toàn bộ mức tăng cho cải tiến"
    ],
    "explanation": "60/80 = 75%; 90/100 = 90%; tăng 15 điểm phần trăm, tương đương tăng tương đối 20%. Cần thêm dữ liệu để đánh giá nguyên nhân và năng suất.",
    "lesson": "Phân biệt điểm phần trăm, phần trăm tăng và quan hệ nhân quả.",
    "revision": 2,
    "slide": 13
  },
  {
    "id": "dong-thap",
    "name": "Đồng Tháp",
    "region": "nam",
    "kind": "two-claims",
    "type": "Ai nói đúng",
    "prompt": "Nhóm Đồng Tháp trao đổi về mức giảm chi thường xuyên 39 nghìn tỷ đồng/năm được báo cáo ngày 12/10/2025. An muốn theo dõi thêm chi phí chuyển đổi. Bình cho rằng đó là lợi ích ròng cuối cùng. Ai có cách đánh giá phù hợp?",
    "options": [
      "Bạn An",
      "Bạn Bình"
    ],
    "reasons": [
      "Đánh giá lợi ích cần tính cả chi chuyển đổi và cách sử dụng nguồn lực",
      "Mọi khoản giảm chi đều tự động trở thành đầu tư phát triển"
    ],
    "answer": [
      0,
      0
    ],
    "explanation": "Mức giảm chi thường xuyên được nêu trong báo cáo tổng kết tinh gọn bộ máy. Cần thêm chi phí chuyển đổi và quyết định phân bổ để đánh giá lợi ích cuối cùng.",
    "lesson": "Tinh gọn tạo dư địa sử dụng nguồn lực cho phát triển.",
    "revision": 2,
    "slide": 12,
    "sourceUrl": "https://baochinhphu.vn/thu-tuong-doi-moi-dot-pha-manh-me-hon-nua-nhat-la-trong-huy-dong-nguon-luc-phat-trien-102251012161852286.htm",
    "sourceLabel": "Báo cáo được công bố ngày 12/10/2025"
  },
  {
    "id": "vinh-long",
    "name": "Vĩnh Long",
    "region": "nam",
    "kind": "buckets",
    "type": "Chuyển thẻ vào nhóm",
    "prompt": "Chọn một nhóm đích, rồi bấm từng thẻ để phân loại. Nhóm Vĩnh Long mới phải có đúng ba tên.",
    "tokens": [
      "Bến Tre",
      "Trà Vinh",
      "Vĩnh Long",
      "Tiền Giang",
      "Sóc Trăng"
    ],
    "groups": [
      "Vĩnh Long mới",
      "Phương án khác"
    ],
    "answer": [
      0,
      0,
      0,
      1,
      1
    ],
    "explanation": "Bến Tre, Trà Vinh và Vĩnh Long trước sắp xếp hình thành Vĩnh Long mới.",
    "lesson": "Phạm vi tổ chức rõ giúp thiết kế phối hợp và phân công."
  },
  {
    "id": "ca-mau",
    "name": "Cà Mau",
    "region": "nam",
    "kind": "binary-lock",
    "type": "Khóa nhị phân",
    "prompt": "Nhóm Cà Mau kiểm tra số liệu sắp xếp năm 2025. Ghi 1 cho nhận định đúng, 0 cho nhận định sai để tạo mã bốn số.",
    "rows": [
      "Số đơn vị cấp tỉnh giảm từ 63 còn 34.",
      "Số đơn vị cấp xã giảm từ 10.035 còn 3.321.",
      "Giảm đầu mối tự động làm mọi thủ tục nhanh hơn.",
      "Cần đo thời gian và chi phí phục vụ sau sắp xếp."
    ],
    "answer": "1101",
    "explanation": "Hai số liệu cơ cấu và yêu cầu đo chất lượng phục vụ là đúng. Hiệu quả thủ tục phụ thuộc quy trình và thực thi. Mã đúng là 1101.",
    "lesson": "Quy mô tổ chức và kết quả phục vụ cần được theo dõi cùng nhau.",
    "revision": 2,
    "slide": 8,
    "sourceUrl": "https://www.mof.gov.vn/bo-tai-chinh/dua-nghi-quyet-cua-dang-vao-cuoc-song/qua-trinh-hoan-thien-the-che-chinh-sach-ve-chinh-quyen-dia-phuong-2-cap-duoc-trien-khai-dong-bo-toan-dien",
    "sourceLabel": "Bộ Tài chính tổng hợp sắp xếp năm 2025"
  },
  {
    "id": "an-giang",
    "name": "An Giang",
    "region": "nam",
    "kind": "argument",
    "type": "Ghép lập luận ba bước",
    "prompt": "Hoàn thành lập luận về An Giang theo ba phần sự kiện, cơ hội và điều kiện.",
    "fields": [
      {
        "label": "Sự kiện",
        "options": [
          "Kiên Giang và An Giang hợp nhất thành An Giang",
          "Kiên Giang và Cà Mau hợp nhất thành An Giang"
        ]
      },
      {
        "label": "Cơ hội có thể có",
        "options": [
          "Tăng khả năng phối hợp không gian kinh tế",
          "Tự động tạo ra mọi lợi ích kinh tế"
        ]
      },
      {
        "label": "Điều kiện thực hiện",
        "options": [
          "Quy hoạch, nguồn lực và trách nhiệm phù hợp",
          "Chỉ cần thay tên đơn vị"
        ]
      }
    ],
    "answer": [
      "Kiên Giang và An Giang hợp nhất thành An Giang",
      "Tăng khả năng phối hợp không gian kinh tế",
      "Quy hoạch, nguồn lực và trách nhiệm phù hợp"
    ],
    "explanation": "Sự kiện địa giới tạo bối cảnh mới. Cơ hội phát triển cần điều kiện quản trị để trở thành kết quả thực tế.",
    "lesson": "Chính trị mở đường thông qua thể chế, tổ chức và năng lực thực thi phù hợp.",
    "slide": 14
  }
];
