export const source = "https://baochinhphu.vn/nghi-quyet-cua-quoc-hoi-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-102250612191145158.htm";
export const policySource = "https://xaydungchinhsach.chinhphu.vn/cong-bo-cac-nghi-dinh-ve-phan-cap-phan-quyen-phan-dinh-tham-quyen-119250612134828114.htm";

// 34 provinces keep 34 distinct formats. Revised questions connect to the 15-slide presentation.
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
    "lesson": "Liên hệ slide 3 và 15. Kết hợp đổi mới kinh tế và đổi mới chính trị trong điều kiện thực tiễn.",
    "revision": 2,
    "slide": 3,
    "sourceUrl": "../../../giao-trinh-llct/md/Giao_trinh_Triet_hoc_ML.md",
    "sourceLabel": "Giáo trình Triết học Mác – Lênin trong dự án"
  },
  {
    "id": "bac-ninh",
    "name": "Bắc Ninh",
    "region": "bac",
    "kind": "letters",
    "type": "Ghép chữ",
    "prompt": "Bắc Giang hợp nhất với Bắc Ninh. Bấm các chữ theo thứ tự để ghép tên tỉnh sau sắp xếp.",
    "tokens": [
      "N",
      "Ắ",
      "H",
      "B",
      "I",
      "N",
      "C"
    ],
    "answer": "BẮCNINH",
    "explanation": "Tên tỉnh sau hợp nhất là Bắc Ninh.",
    "lesson": "Tên gọi mới cần đi cùng cách vận hành thống nhất."
  },
  {
    "id": "phu-tho",
    "name": "Phú Thọ",
    "region": "bac",
    "kind": "double",
    "type": "Chọn đúng hai",
    "prompt": "Chọn ĐÚNG HAI nhận định về tỉnh Phú Thọ sau sắp xếp năm 2025.",
    "options": [
      "Hình thành từ ba tỉnh trước sắp xếp.",
      "Bao gồm Vĩnh Phúc và Hòa Bình trước sắp xếp.",
      "Có thêm Hà Giang trước sắp xếp.",
      "Tên tỉnh sau sắp xếp là Vĩnh Phúc."
    ],
    "answer": [
      0,
      1
    ],
    "explanation": "Phú Thọ mới gồm Phú Thọ, Vĩnh Phúc và Hòa Bình trước sắp xếp. Hai nhận định đầu đúng.",
    "lesson": "Liên hệ slide 9. Quy mô sắp xếp cần đi cùng đo kết quả phục vụ.",
    "slide": 9
  },
  {
    "id": "tuyen-quang",
    "name": "Tuyên Quang",
    "region": "bac",
    "kind": "cloze",
    "type": "Điền tên còn thiếu",
    "prompt": "Hoàn thành thông tin về hai tỉnh trước sắp xếp.",
    "sentence": "_____ và Tuyên Quang hợp nhất thành tỉnh Tuyên Quang.",
    "options": [
      "Hà Giang",
      "Yên Bái",
      "Lào Cai"
    ],
    "answer": "Hà Giang",
    "explanation": "Tuyên Quang mới hình thành từ Hà Giang và Tuyên Quang trước sắp xếp.",
    "lesson": "Quy mô địa bàn thay đổi cần năng lực phục vụ tương ứng."
  },
  {
    "id": "lao-cai",
    "name": "Lào Cai",
    "region": "bac",
    "kind": "matching",
    "type": "Nối cặp địa phương",
    "prompt": "Nối mỗi tỉnh trước sắp xếp với tên tỉnh tương ứng sau hợp nhất.",
    "rows": [
      "Yên Bái",
      "Hà Giang",
      "Bắc Giang"
    ],
    "options": [
      "Bắc Ninh",
      "Lào Cai",
      "Tuyên Quang"
    ],
    "answer": [
      "Lào Cai",
      "Tuyên Quang",
      "Bắc Ninh"
    ],
    "explanation": "Yên Bái thuộc Lào Cai mới, Hà Giang thuộc Tuyên Quang mới, Bắc Giang thuộc Bắc Ninh mới.",
    "lesson": "Thông tin rõ giúp người dân nhận biết đầu mối mới."
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
    "prompt": "Bản tin sau có một tên tỉnh sai. Thay phần được đánh dấu để bản tin chính xác.",
    "sentence": "Thái Bình và [Nam Định] hợp nhất thành Hưng Yên.",
    "options": [
      "Hưng Yên",
      "Hải Dương",
      "Bắc Ninh"
    ],
    "answer": "Hưng Yên",
    "explanation": "Cặp đúng là Thái Bình và Hưng Yên.",
    "lesson": "Dữ liệu và thông tin cần thống nhất sau sắp xếp."
  },
  {
    "id": "hai-phong",
    "name": "Hải Phòng",
    "region": "bac",
    "kind": "odd",
    "type": "Loại tên lạc nhóm",
    "prompt": "Chọn tên KHÔNG thuộc các địa phương trước sắp xếp hình thành Hải Phòng mới.",
    "options": [
      "Hải Phòng",
      "Hải Dương",
      "Quảng Ninh"
    ],
    "answer": 2,
    "explanation": "Hải Phòng mới gồm Hải Phòng và Hải Dương trước sắp xếp. Quảng Ninh thuộc nhóm không sắp xếp cấp tỉnh.",
    "lesson": "Hiểu đúng phạm vi giúp xác định trách nhiệm phối hợp."
  },
  {
    "id": "ninh-binh",
    "name": "Ninh Bình",
    "region": "bac",
    "kind": "equation",
    "type": "Phép tính hợp nhất",
    "prompt": "Tại Ninh Bình, Hà Nam + Nam Định + Ninh Bình trước sắp xếp tạo thành một tỉnh. Điền số vào hai ô.",
    "labels": [
      "Số tỉnh trước hợp nhất",
      "Số tỉnh sau hợp nhất"
    ],
    "answer": [
      3,
      1
    ],
    "explanation": "Ba tỉnh trước sắp xếp hợp nhất thành một tỉnh Ninh Bình.",
    "lesson": "Giảm số đơn vị cần đi cùng cải thiện hiệu quả hoạt động."
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
    "lesson": "Liên hệ slide 11. Phân cấp và dữ liệu trực tuyến tạo điều kiện phục vụ xuất khẩu.",
    "revision": 2,
    "slide": 11,
    "sourceUrl": "https://www.quangninh.gov.vn/Trang/ChiTietTinTuc.aspx?nid=160925",
    "sourceLabel": "Nguồn số liệu C/O Quảng Ninh"
  },
  {
    "id": "cao-bang",
    "name": "Cao Bằng",
    "region": "bac",
    "kind": "memory",
    "type": "Lật thẻ ghi nhớ",
    "prompt": "Tìm bốn cặp “địa phương trước sắp xếp” và “kết quả tương ứng”. Cao Bằng là một địa phương giữ nguyên.",
    "pairs": [
      [
        "Cao Bằng",
        "Cao Bằng giữ nguyên"
      ],
      [
        "Bắc Giang",
        "Bắc Ninh mới"
      ],
      [
        "Yên Bái",
        "Lào Cai mới"
      ],
      [
        "Hà Giang",
        "Tuyên Quang mới"
      ]
    ],
    "explanation": "Cao Bằng giữ nguyên. Ba cặp còn lại minh họa các địa phương sau hợp nhất.",
    "lesson": "Ghi nhớ địa giới là điểm bắt đầu để tìm hiểu tổ chức mới."
  },
  {
    "id": "dien-bien",
    "name": "Điện Biên",
    "region": "bac",
    "kind": "number",
    "type": "Tính nhanh con số",
    "prompt": "Điện Biên thuộc nhóm giữ nguyên. Trên cả nước, số đơn vị cấp tỉnh chuyển từ 63 xuống 34. Giảm bao nhiêu đơn vị?",
    "answer": 29,
    "explanation": "63 − 34 = 29 đơn vị. Con số này là mức giảm số đơn vị, cần phân biệt với số phương án hợp nhất.",
    "lesson": "Liên hệ slide 9. Cả nước giảm 29 đơn vị cấp tỉnh, tương đương khoảng 46,0%.",
    "slide": 9
  },
  {
    "id": "lai-chau",
    "name": "Lai Châu",
    "region": "bac",
    "kind": "slider",
    "type": "Thanh trượt thống kê",
    "prompt": "Lai Châu là một tỉnh giữ nguyên. Kéo thanh đến số tỉnh, thành không thực hiện sắp xếp cấp tỉnh theo Nghị quyết 202.",
    "min": 0,
    "max": 34,
    "answer": 11,
    "explanation": "Có 11 tỉnh, thành không thực hiện sắp xếp cấp tỉnh trong đợt này.",
    "lesson": "Phương án tổ chức cần phù hợp điều kiện từng địa phương."
  },
  {
    "id": "lang-son",
    "name": "Lạng Sơn",
    "region": "bac",
    "kind": "wordsearch",
    "type": "Tìm chữ trong lưới",
    "prompt": "Tìm tên LANGSON theo một hàng ngang, từ trái sang phải. Đây là một tỉnh giữ nguyên trong đợt sắp xếp cấp tỉnh.",
    "grid": [
      "BACNINH",
      "PHUTHOA",
      "HAINOIX",
      "LANGSON",
      "YENBAIX",
      "CAOBANG",
      "DANANGX"
    ],
    "answer": "LANGSON",
    "explanation": "Lạng Sơn thuộc nhóm không thực hiện sắp xếp cấp tỉnh năm 2025.",
    "lesson": "Mỗi địa phương có điều kiện riêng khi đổi mới quản trị."
  },
  {
    "id": "son-la",
    "name": "Sơn La",
    "region": "bac",
    "kind": "decision",
    "type": "Ngã rẽ quản trị",
    "prompt": "Sơn La giữ nguyên cấp tỉnh. Trong tình huống giả định có hồ sơ chậm, hãy đi qua hai ngã rẽ để chọn cách xử lý phù hợp.",
    "steps": [
      {
        "label": "Bước đầu tiên",
        "options": [
          "Rà soát điểm chậm và trách nhiệm xử lý",
          "Chỉ đổi tên bộ phận tiếp nhận"
        ],
        "answer": 0
      },
      {
        "label": "Sau khi tìm được điểm chậm",
        "options": [
          "Cắt thêm người mà chưa xem khối lượng việc",
          "Điều chỉnh quy trình và năng lực tương ứng"
        ],
        "answer": 1
      }
    ],
    "explanation": "Trong tình huống giả định, cần xác định nguyên nhân rồi điều chỉnh cách thực hiện và điều kiện làm việc.",
    "lesson": "Thực tiễn cung cấp căn cứ để sửa cơ chế."
  },
  {
    "id": "thanh-hoa",
    "name": "Thanh Hóa",
    "region": "trung",
    "kind": "policy-order",
    "type": "Xếp bước xử lý",
    "prompt": "Thanh Hóa giữ nguyên cấp tỉnh. Trong tình huống giả định, xếp ba bước theo quy trình đã cho: xác định việc, chuẩn bị điều kiện, rồi đánh giá kết quả.",
    "items": [
      "Đo kết quả phục vụ",
      "Làm rõ nhiệm vụ và thẩm quyền",
      "Bố trí cán bộ, dữ liệu và công cụ"
    ],
    "answer": [
      1,
      2,
      0
    ],
    "explanation": "Theo quy trình của tình huống, phải rõ nhiệm vụ trước, bố trí điều kiện thực hiện rồi đo kết quả.",
    "lesson": "Đổi mới cần gắn tổ chức với điều kiện thực thi."
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
    "lesson": "Liên hệ slide 14. Đo hiệu quả bằng cùng loại thủ tục và cùng cách tính thời gian.",
    "revision": 2,
    "slide": 14
  },
  {
    "id": "ha-tinh",
    "name": "Hà Tĩnh",
    "region": "trung",
    "kind": "evidence",
    "type": "Chọn nguồn kiểm chứng",
    "prompt": "Trong nhóm thảo luận tại Hà Tĩnh, bạn muốn kiểm chứng số liệu năm 2024 về tỷ lệ doanh nghiệp dành trên 10% thời gian cho quy định pháp luật. Chọn nguồn và lý do.",
    "options": [
      "Báo cáo PCI 2024 của VCCI, trang 20",
      "Một ảnh biểu đồ không có nguồn",
      "Bình luận được chia sẻ nhiều"
    ],
    "reasons": [
      "Nguồn khảo sát công bố chỉ tiêu, năm và số liệu",
      "Nguồn có nhiều lượt thích"
    ],
    "answer": [
      0,
      0
    ],
    "explanation": "Báo cáo PCI 2024 ghi gần 24% doanh nghiệp dành trên 10% thời gian tìm hiểu và thực hiện quy định pháp luật, so với khoảng 20% năm 2023. Đây là số liệu khảo sát toàn quốc.",
    "lesson": "Liên hệ slide 5. Số liệu chi phí tuân thủ giúp xác định nhu cầu cải cách.",
    "revision": 2,
    "slide": 5,
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
    "prompt": "Huế thuộc nhóm giữ nguyên cấp tỉnh. Trả lời lần lượt ba câu để mở bước tiếp theo.",
    "steps": [
      {
        "label": "Huế có thực hiện sắp xếp cấp tỉnh trong đợt Nghị quyết 202?",
        "options": [
          "Có",
          "Không"
        ],
        "answer": 1
      },
      {
        "label": "Sau sắp xếp cả nước có bao nhiêu thành phố trực thuộc Trung ương?",
        "options": [
          "6",
          "8"
        ],
        "answer": 0
      },
      {
        "label": "Đổi mới quản trị ở nơi giữ nguyên địa giới có cần thiết?",
        "options": [
          "Có",
          "Không"
        ],
        "answer": 0
      }
    ],
    "explanation": "Huế giữ nguyên trong đợt sắp xếp này. Cơ cấu sau sắp xếp có 6 thành phố trực thuộc Trung ương. Đổi mới quản trị vẫn cần thiết.",
    "lesson": "Sự cần thiết của đổi mới bắt nguồn từ yêu cầu phát triển."
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
    "lesson": "Liên hệ slide 8. Cải cách quy trình có thể được vận dụng khi tổ chức bộ máy mới.",
    "revision": 2,
    "slide": 8,
    "sourceUrl": "https://daklak.gov.vn/thong-tin-tuyen-truyen/-/asset_publisher/eTFgYrRjRQin/content/rut-ngan-thoi-gian-giai-quyet-mot-so-thu-tuc-hanh-chinh-thuoc-linh-vuc-ang-ky-doanh-nghiep",
    "sourceLabel": "Thông báo Đắk Lắk ngày 21/03/2024"
  },
  {
    "id": "lam-dong",
    "name": "Lâm Đồng",
    "region": "trung",
    "kind": "triple",
    "type": "Chọn bộ ba",
    "prompt": "Chọn đúng BA tỉnh trước sắp xếp hình thành tỉnh Lâm Đồng mới.",
    "options": [
      "Lâm Đồng",
      "Đắk Nông",
      "Bình Thuận",
      "Ninh Thuận",
      "Đắk Lắk"
    ],
    "answer": [
      0,
      1,
      2
    ],
    "explanation": "Lâm Đồng mới gồm Lâm Đồng, Đắk Nông và Bình Thuận trước sắp xếp.",
    "lesson": "Địa bàn mở rộng cần dịch vụ và nguồn lực phù hợp."
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
    "lesson": "Liên hệ slide 10 và 12. Quy hoạch thống nhất cần đi cùng quy trình và năng lực phục vụ.",
    "revision": 2,
    "slide": 10,
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
    "prompt": "Đọc thẻ tin rồi hoàn thành hai ô thông tin.",
    "passage": "Cần Thơ trước sắp xếp cùng Sóc Trăng và Hậu Giang hợp nhất thành thành phố Cần Thơ.",
    "fields": [
      {
        "label": "Số địa phương trước hợp nhất",
        "options": [
          "2",
          "3",
          "4"
        ]
      },
      {
        "label": "Tên thành phố sau hợp nhất",
        "options": [
          "Cần Thơ",
          "Sóc Trăng",
          "Hậu Giang"
        ]
      }
    ],
    "answer": [
      "3",
      "Cần Thơ"
    ],
    "explanation": "Ba địa phương hình thành thành phố Cần Thơ sau sắp xếp.",
    "lesson": "Thông tin rõ giúp người dân hiểu mô hình tổ chức mới."
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
    "lesson": "Liên hệ slide 13. Tinh gọn tạo dư địa sử dụng nguồn lực cho phát triển.",
    "revision": 2,
    "slide": 13,
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
    "lesson": "Liên hệ slide 9 và 14. Quy mô tổ chức và kết quả phục vụ cần được theo dõi cùng nhau.",
    "revision": 2,
    "slide": 9,
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
    "lesson": "Liên hệ slide 15. Chính trị mở đường thông qua thể chế, tổ chức và năng lực thực thi phù hợp.",
    "slide": 15
  }
];
