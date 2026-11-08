from pathlib import Path
import re

root = Path('Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may')
speech = (root / 'loi-thuyet-trinh-slide.md').read_text(encoding='utf-8')
parts = re.split(r'(?=^## Slide \d+ — )', speech, flags=re.M)[1:]
assert len(parts) == 15
sections = {}
for part in parts:
    number = int(re.match(r'## Slide (\d+)', part)[1])
    body = part.split('\n', 1)[1].strip()
    body = body.split('\n---\n', 1)[0].strip()
    sections[number] = body

path = root / 'slides.md'
slides = path.read_text(encoding='utf-8-sig')
slides = slides.replace(
    '> Biên tập theo góp ý giảng viên ngày 07/11/2026. Phần 1 là minigame bản đồ 34 tỉnh, thành. Phần 2 gồm 15 slide dưới đây, dự kiến 18–20 phút. Thời gian chơi và hỏi–đáp tính riêng.',
    '> Lời thuyết trình cập nhật ngày 08/11/2026 theo bố cục: video hook → 15 slide → minigame bản đồ 34 tỉnh, thành → video recap. Bản lời nói đầy đủ dự kiến 25–30 phút, cần chốt qua tập dượt; chưa tính video, trò chơi và hỏi–đáp. Có thể tập riêng bằng [file lời thuyết trình](./loi-thuyet-trinh-slide.md).'
)
slides = slides.replace(
    'Lịch chiếu video và phát âm thanh thủ công nằm trong [kế hoạch nghe nhìn](./ke-hoach-video-am-thanh.md).',
    'Video và âm thanh được phát riêng. Với bố cục mới, phần slide trình bày liền mạch sau hook và trước minigame; video recap phát sau minigame. [Kế hoạch nghe nhìn](./ke-hoach-video-am-thanh.md) ghi phương án tư liệu trước đây, chưa phải lịch điều phối theo bố cục mới.'
)
chunks = re.split(r'(?=^## Slide \d+ — )', slides, flags=re.M)
for i in range(1, len(chunks)):
    number = int(re.match(r'## Slide (\d+)', chunks[i])[1])
    chunks[i], count = re.subn(
        r'### (Lời thuyết trình|Lời kết)\n.*?(?=\n### )',
        lambda match: '### ' + match[1] + '\n\n' + sections[number] + '\n',
        chunks[i], count=1, flags=re.S
    )
    assert count == 1, number
slides = ''.join(chunks)
slides = slides.replace('Hiện ảnh bản đồ minigame rồi chuyển sang câu hỏi trên. Giọng trực tiếp khoảng 50 giây, dành 5–10 giây cho lớp trả lời.', 'Hiện ảnh bản đồ để giới thiệu minigame sắp diễn ra, sau đó chuyển sang câu hỏi trên. Dành 5–10 giây cho lớp trả lời; thời lượng lời nói theo bản chi tiết mới.')
slides = slides.replace('Trình bày xong nội dung slide rồi chuyển sang phần tư liệu theo kế hoạch nghe nhìn. Sau phần tư liệu, tiếp tục slide 8.', 'Theo bố cục mới, tiếp tục slide 8 sau lời chuyển; không chèn tư liệu ở mốc này.')
slides = slides.replace('Trình bày xong hai biểu đồ rồi thực hiện phần tư liệu theo kế hoạch nghe nhìn. Sau phần tư liệu, tiếp tục slide 10.', 'Theo bố cục mới, tiếp tục slide 10 sau lời chuyển; không chèn tư liệu ở mốc này.')
slides = slides.replace('Trình bày xong nội dung slide rồi thực hiện phần tư liệu theo kế hoạch nghe nhìn. Sau phần tư liệu, tiếp tục slide 11.', 'Theo bố cục mới, tiếp tục slide 11 sau lời chuyển; không chèn tư liệu ở mốc này.')
slides = slides.replace('Trình bày xong số liệu Quảng Ninh rồi thực hiện phần tư liệu theo kế hoạch nghe nhìn. Sau phần tư liệu, tiếp tục slide 12.', 'Theo bố cục mới, tiếp tục slide 12 sau lời chuyển; không chèn tư liệu ở mốc này.')
slides = slides.replace('**Trở lại minigame**', '**Dẫn vào minigame**')
slides = slides.replace('Kết luận bằng giọng trực tiếp, sau đó người điều khiển thực hiện phần kết buổi theo kế hoạch nghe nhìn và mời lớp thảo luận.', 'Kết luận phần slide rồi mở HTML minigame, bàn giao cho người điều phối. Video recap phát sau minigame.')
slides = slides.replace('Video và âm thanh được điều phối thủ công theo kế hoạch nghe nhìn MD.', 'Bản lời nói mới dùng bố cục hook → slide → minigame → recap; các thời lượng ngắn trong ghi chú nghe nhìn cũ chỉ là tham khảo của bản trước. Lượt biên tập lời nói này chưa cập nhật ghi chú trong PPTX.')
path.write_text(slides, encoding='utf-8')
assert len(re.findall(r'^## Slide \d+ — ', slides, re.M)) == 15
for text in ['Cảm ơn các đội đã tham gia minigame', 'Trong minigame, mỗi lần chọn tỉnh', 'Quảng Ninh trong minigame', 'Từ minigame đến các ví dụ thực tế']:
    assert text not in slides, text
print('Updated 15 matching slide speeches; obsolete minigame-first introductions removed.')
