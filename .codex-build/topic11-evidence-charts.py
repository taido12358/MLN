from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager

OUTPUT = Path('C:/Users/ADMIN/Downloads/MLN/Presents/11-doi-moi-kinh-te-chinh-tri-tinh-gon-bo-may/bieu-do')
OUTPUT.mkdir(exist_ok=True)
font_manager.fontManager.addfont('C:/Windows/Fonts/arial.ttf')
plt.rcParams.update({'font.family': 'Arial', 'font.size': 19, 'axes.spines.top': False,
                     'axes.spines.right': False, 'axes.spines.left': False,
                     'axes.edgecolor': '#bcb4a6', 'text.color': '#28312e',
                     'axes.labelcolor': '#54615c', 'xtick.color': '#54615c',
                     'ytick.color': '#54615c', 'figure.facecolor': '#fffaf1',
                     'axes.facecolor': '#fffaf1'})

def frame(title, subtitle):
    figure, axis = plt.subplots(figsize=(14, 7.8), dpi=150)
    figure.subplots_adjust(left=.10, right=.95, bottom=.24, top=.70)
    figure.text(.06, .92, title, fontsize=28, weight='bold', va='top')
    figure.text(.06, .84, subtitle, fontsize=18, color='#59645d', va='top')
    axis.grid(axis='y', color='#dfded3', linewidth=.8)
    axis.set_axisbelow(True)
    axis.tick_params(axis='both', length=0, pad=12)
    return figure, axis

def finish(figure, filename, source, note):
    figure.text(.06, .105, source, fontsize=14, color='#59645d', va='top')
    figure.text(.06, .06, note, fontsize=14, color='#59645d', va='top')
    figure.savefig(OUTPUT / filename)
    plt.close(figure)

figure, axis = frame('Chi phí tuân thủ đặt ra yêu cầu cải cách',
                    'Tỷ lệ doanh nghiệp dành trên 10% thời gian để tìm hiểu và thực hiện quy định pháp luật')
axis.bar(['2023', '2024'], [20, 24], width=.46, color=['#b5ada0', '#8b2937'])
axis.set_ylim(0, 30)
axis.set_yticks([0, 10, 20, 30], ['0%', '10%', '20%', '30%'])
for x, value, label in [(0, 20, 'Khoảng 20%'), (1, 24, 'Gần 24%')]:
    axis.text(x, value+.8, label, ha='center', weight='bold', fontsize=25)
finish(figure, '01-chi-phi-thoi-gian-pci.png',
       'Nguồn  VCCI, Báo cáo PCI 2024, trang 20.',
       'Số liệu khảo sát trước đợt sắp xếp 2025. Các tỷ lệ được nguồn làm tròn.')

for filename, title, values, maximum, ticks, labels, reduction, source in [
    ('02-don-vi-cap-tinh.png', 'Đơn vị hành chính cấp tỉnh từ 63 còn 34', [63, 34], 80,
     [0, 20, 40, 60, 80], ['0', '20', '40', '60', '80'],
     'Giảm 29 đơn vị, tương đương khoảng 46,0%',
     'Nguồn  Nghị quyết 202/2025/QH15, Báo Điện tử Chính phủ ngày 12/06/2025.'),
    ('03-don-vi-cap-xa.png', 'Đơn vị hành chính cấp xã từ 10.035 còn 3.321', [10035, 3321], 12000,
     [0, 3000, 6000, 9000, 12000], ['0', '3.000', '6.000', '9.000', '12.000'],
     'Giảm 6.714 đơn vị, tương đương khoảng 66,9%',
     'Nguồn  Bộ Tài chính tổng hợp triển khai chính quyền địa phương hai cấp năm 2025.'),
]:
    figure, axis = frame(title, reduction)
    axis.bar(['Trước sắp xếp 2025', 'Sau sắp xếp 2025'], values, width=.46,
             color=['#b5ada0', '#397d64'])
    axis.set_ylim(0, maximum)
    axis.set_yticks(ticks, labels)
    axis.set_ylabel('Số đơn vị')
    for x, value in enumerate(values):
        axis.text(x, value+maximum*.025, f'{value:,}'.replace(',', '.'),
                  ha='center', weight='bold', fontsize=30)
    finish(figure, filename, source,
           'Tỷ lệ giảm do nhóm tính. Biểu đồ thể hiện thay đổi cơ cấu hành chính năm 2025.')

figure, axis = frame('Đắk Lắk rút ngắn thời hạn thủ tục đăng ký',
                    'Thời hạn được địa phương công bố năm 2024. Đơn vị tính bằng ngày làm việc.')
positions = [0, 1.5]
axis.bar([x-.2 for x in positions], [3, 3], width=.36, color='#b5ada0', label='Trước điều chỉnh')
axis.bar([x+.2 for x in positions], [2, 1], width=.36, color='#397d64', label='Sau điều chỉnh')
axis.set_xticks(positions, ['Đăng ký thành lập mới', 'Một số thay đổi đăng ký\nVí dụ đổi tên doanh nghiệp'])
axis.set_ylim(0, 4.1)
axis.set_yticks([0, 1, 2, 3, 4])
axis.set_ylabel('Ngày làm việc')
for x, before, after in zip(positions, [3, 3], [2, 1]):
    axis.text(x-.2, before+.1, str(before), ha='center', fontsize=25, weight='bold')
    axis.text(x+.2, after+.1, str(after), ha='center', fontsize=25, weight='bold')
axis.legend(loc='upper center', bbox_to_anchor=(.5, 1.22), ncols=2, frameon=False, fontsize=17)
finish(figure, '04-thu-tuc-dak-lak.png',
       'Nguồn  Cổng TTĐT tỉnh Đắk Lắk, thông tin ngày 21/03/2024.',
       'Mức rút ngắn tương ứng 1 ngày (33,3%) và 2 ngày (66,7%), do nhóm tính.')
print('Created four evidence charts at', OUTPUT)
