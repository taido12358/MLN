# Logs & điều phối nhiều agent

Dự án này có thể được **nhiều Claude agent/phiên làm việc đồng thời** (ví dụ: một agent
sửa `apps/api`, một agent khác sửa `apps/web`, một agent khác ingest nội dung). Thư mục
này là nơi duy nhất lưu lại "ai đang làm gì, ai đã làm gì, vì sao" — vì repo **không phải
git repository** nên không có `git log`/`git blame` để tra cứu.

**Trước khi bắt đầu bất kỳ việc gì đáng kể, đọc theo thứ tự:**

1. [`STATUS.md`](STATUS.md) — xem hiện có agent nào khác đang động vào cùng khu vực
   (file/module) mình sắp sửa không. Nếu có, tránh đụng file đó hoặc phối hợp trước.
2. [`decisions/`](decisions/) — các quyết định kỹ thuật quan trọng đã chốt, kèm lý do.
   Đọc để không vô tình làm ngược lại một quyết định đã có chủ đích.
3. [`sessions/`](sessions/) — lịch sử chi tiết theo thời gian, mới nhất ở cuối mỗi
   file/index.
4. [`issues/ISSUES.md`](issues/ISSUES.md) — việc còn thiếu / lỗi đã biết / giới hạn.

## Cấu trúc thư mục

```
logs/
  README.md          <- file này
  STATUS.md           <- bảng "đang làm gì" — cập nhật MỖI KHI bắt đầu/kết thúc một việc
  decisions/          <- 1 file / 1 quyết định kỹ thuật quan trọng (ADR ngắn gọn)
  sessions/           <- 1 file / 1 phiên làm việc (nhật ký tường thuật, append-only)
  issues/
    ISSUES.md         <- danh sách việc còn thiếu / bug đã biết / giới hạn hiện tại
```

## Quy ước — vì sao tách ra thế này khi có nhiều agent cùng lúc

Một file log duy nhất mà nhiều agent cùng ghi vào sẽ dễ bị **ghi đè lẫn nhau** (agent A
đọc file, agent B ghi xong, agent A ghi tiếp theo bản cũ → mất nội dung của B). Cách xử
lý:

- **`sessions/`**: mỗi agent/phiên tạo **file riêng của mình**, không sửa file của
  agent khác. Tên file PHẢI duy nhất để tránh trùng khi 2 agent chạy cùng lúc:
  `YYYY-MM-DD_HHmm_<area>_<slug>.md` (giờ theo giờ hệ thống lúc bắt đầu, `area` là một
  trong `web` / `api` / `db` / `shared` / `content` / `infra` / `misc`). Ví dụ:
  `2026-09-11_1430_api_add-quiz-export.md`.
- **`decisions/`**: mỗi quyết định là 1 file riêng, đánh số thứ tự tăng dần:
  `NNNN-slug-ngan-gon.md` (ví dụ `0004-switch-to-redis-for-scale.md`). Trước khi tạo
  số mới, xem số lớn nhất đang có trong thư mục để tránh trùng — nếu 2 agent trùng số
  cùng lúc, người phát hiện ra sau đổi số file mình sang số tiếp theo còn trống.
- **`STATUS.md`**: đây là file DUY NHẤT nhiều agent cùng sửa, nên rủi ro ghi đè cao
  nhất. Quy tắc bắt buộc: **chỉ thêm/sửa dòng của chính mình**, không xóa hoặc sửa dòng
  agent khác đang thêm (trừ khi dọn dẹp các dòng đã "Done" từ lâu). Đọc lại file ngay
  trước khi ghi để giảm khả năng ghi đè.
- **`issues/ISSUES.md`**: thêm dòng mới ở cuối mục phù hợp, ghi rõ ngày + ai/khu vực
  phát hiện. Khi giải quyết xong, chuyển dòng đó sang mục "Đã giải quyết" kèm ngày,
  đừng xóa hẳn (giữ lịch sử).

## Format một file trong `sessions/`

- **Bối cảnh / yêu cầu**: người dùng muốn gì, tại sao.
- **Đã làm**: thay đổi cụ thể (file/module nào), quyết định kỹ thuật quan trọng — nếu
  quyết định đủ lớn, tách thành 1 file trong `decisions/` và link tới đây.
- **Còn thiếu / việc tiếp theo**: nếu phiên chưa xong việc → cũng nên có 1 dòng tương
  ứng trong `STATUS.md` nếu việc còn dang dở khi agent kết thúc phiên.
- **Lưu ý cho phiên sau**: bẫy, giới hạn, thứ dễ hiểu lầm.

Cập nhật `../CLAUDE.md` khi có thay đổi ảnh hưởng bức tranh tổng thể (stack, cách chạy,
cấu trúc thư mục) — `CLAUDE.md` là "hiện trạng", `logs/` là "lịch sử + điều phối".
