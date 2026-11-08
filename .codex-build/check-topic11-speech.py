from pathlib import Path
import re, subprocess, difflib

root = Path('Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may')
slides_path = root / 'slides.md'
speech = (root / 'loi-thuyet-trinh-slide.md').read_text(encoding='utf-8')
slides = slides_path.read_text(encoding='utf-8')
original = subprocess.check_output(['git', 'show', 'HEAD:' + slides_path.as_posix()]).decode('utf-8-sig').replace('\r\n', '\n')
def sections(text):
    return re.split(r'(?=^## Slide \d+ — )', text, flags=re.M)[1:]
spoken, current, before = sections(speech), sections(slides), sections(original)
assert len(spoken) == len(current) == len(before) == 15
for i, (a,b,c) in enumerate(zip(spoken,current,before),1):
    body = a.split('\n',1)[1].split('\n---\n',1)[0].strip()
    embedded = re.search(r'### (?:Lời thuyết trình|Lời kết)\n(.*?)(?=\n### )', b, re.S)[1].strip()
    assert body == embedded, ('speech mismatch',i)
    def displayed(x):
        return re.search(r'### Nội dung chiếu\n(.*?)(?=\n### )',x,re.S)[1].strip()
    assert displayed(b) == displayed(c), ('display content changed',i)
    def data_tables(x):
        return re.findall(r'### Dữ liệu để dựng biểu đồ\n(.*?)(?=\n### )',x,re.S)
    assert data_tables(b) == data_tables(c), ('chart data changed',i)
for link in re.findall(r'\]\(([^)]+)\)',speech):
    assert (root / link).resolve().exists(), link
assert all(x not in slides for x in ['Cảm ơn các đội đã tham gia minigame','Trong minigame, mỗi lần chọn tỉnh','Quảng Ninh trong minigame','Từ minigame đến các ví dụ thực tế'])
print('PASS: 15 matching speeches, original display content and chart data preserved, all local source links resolve.')
print('Speech file whitespace-delimited word count:', len(speech.split()))

# Stage only this task's completion row; retain earlier unrelated STATUS edits locally.
status_path='logs/STATUS.md'
head=subprocess.check_output(['git','show','HEAD:'+status_path]).decode('utf-8-sig').replace('\r\n','\n')
working=Path(status_path).read_text(encoding='utf-8-sig')
row=next(line for line in working.splitlines() if '2026-11-08_1727_content_loi-thuyet-trinh-bo-cuc-moi.md' in line)
marker='| Khu vực | Việc | Hoàn thành | Log |\n|---|---|---|---|\n'
assert head.count(marker)==1
new=head.replace(marker, marker+row+'\n',1)
patch=''.join(difflib.unified_diff(head.splitlines(keepends=True),new.splitlines(keepends=True),fromfile='a/logs/STATUS.md',tofile='b/logs/STATUS.md'))
Path('.codex-build/topic11-speech-status.patch').write_text(patch,encoding='utf-8')
