# 2026-09-23 — web: đổi theme toàn bộ UI sang bảng màu Tết (lì xì / vàng kim / xanh tre)

## Bối cảnh / yêu cầu

Người dùng gửi ảnh minh hoạ "cây tre treo bao lì xì đỏ có dấu ?" (nền kem đào, lồng đèn đỏ, hoa mai
vàng) và yêu cầu: *"Code lại giao diện web hiện tại thành màu này. Hiệu thật đẹp"* — tức đổi
bảng màu app từ theme tối tím/cyan sang theme sáng ấm theo ảnh, kèm hiệu ứng.

## Đã làm

### Nền tảng theme (giữ nguyên TÊN token để các trang khỏi sửa nhiều)

- `apps/web/src/theme-tokens.ts` — giá trị mới: `ink` **đổi nghĩa** từ "nền tối" thành "màu chữ
  nâu đỏ đậm" (`#4a1414`); thêm `bg` (nền kem `#fbeedc`), `gold`, `gold-deep` (vàng đậm đủ tương
  phản cho chữ nhỏ), `bamboo`. `accent` = đỏ lì xì `#d7261e`, `accent2` = vàng kim `#e5a41c`.
- `apps/web/tailwind.config.ts` — `app-gradient` mới (kem → đào + glow đỏ/vàng/xanh), 4 màu ô
  đáp án Kahoot đổi thành đỏ/vàng/xanh tre/lam, thêm `bg-red-envelope`, `bg-gold-shine`, shadow
  `glow` (đỏ ấm) / `card` / `gold`, keyframes `petal-fall`, `sway`, `shimmer`, `float-y`.
- `apps/web/src/app/globals.css` — body nền sáng chữ tối; các hiệu ứng CSS thuần:
  `.text-gold-shine` (chữ vàng kim ánh kim chạy), `.btn-shine` (vệt sáng quét qua nút khi hover),
  `.petal` (cánh mai rơi), `.lantern` (lồng đèn CSS đung đưa), `.envelope` (bao lì xì CSS).
  Tất cả tắt khi `prefers-reduced-motion`.

### Component mới

- `components/TetBackground.tsx` — lớp nền cố định phía sau mọi trang: 2 lồng đèn góc trên (ẩn
  trên mobile), tre mờ 2 góc dưới (SVG inline), 16 cánh mai rơi. Vị trí cánh hoa lấy từ bảng
  seed cố định (không `Math.random`) để tránh hydration mismatch. Được mount trong `layout.tsx`.
- `components/LiXiEnvelope.tsx` — bao lì xì đỏ có ô vàng "?" giống ảnh, thay cho ô 🎓 tím ở
  trang chủ.
- `lib/confetti.ts` — `tetConfetti()` bọc `canvas-confetti` với màu đỏ/vàng/kem/xanh; thay ở 4
  chỗ gọi (play ×2, leaderboard projector, host console).

### UI kit (`components/ui/*`)

- `Button`: primary = nền đỏ lì xì, chữ vàng, viền vàng mảnh, `btn-shine`; secondary = kem viền
  vàng; ghost/danger đổi theo palette sáng.
- `Card`, `Input`, `Badge`, `ProgressBar` (đỏ→cam→vàng), `CenteredMessage` (emoji trong vòng tròn
  viền vàng, nổi lên xuống khi `pulse`), `ConfirmDialog` (dải đỏ trên đầu, viền vàng).
- `LeaderboardList`: hạng 1 thẻ vàng kim gradient, hạng 2–3 vàng nhạt, 🥇🥈🥉 thay `#n`; hàng của
  chính mình viền đỏ.
- `QuizOptionTile`: ring chọn đổi từ trắng sang vàng.

### Các trang

Chạy 1 lượt sed toàn cục trên `src/app/**/*.tsx`: `text-white/NN` → `text-muted(/80,/60)`,
`bg-white/N` → `bg-ink/N`, `border-white/N` → `border-accent2/40`, `text-accent2` (vàng, tương
phản kém trên nền kem) → `text-accent` (đỏ), nút gradient cũ → `bg-red-envelope text-gold`,
`text-ink` trên nút màu → `text-white`, nút `bg-wrong/*` thêm `text-white`. Sau đó sửa tay: mã
phòng dùng `text-gold-shine` (leaderboard, host console, host content), nút "+10s" nền vàng giữ
chữ tối, đồng hồ đếm ngược `text-ink`, banner mất kết nối vẫn `bg-wrong text-white`.
`global-error.tsx` (inline style, không có Tailwind) đổi sang `THEME.bg`/`THEME.ink`.

### Kiểm tra

- `tsc --noEmit` sạch.
- `docker compose up -d --build` + xem bằng Chrome các trang `/`, `/host`, `/host/content`,
  `/play/<code>` (kết quả ghi ở cuối file này).

## Lưu ý cho phiên sau

- **`ink` giờ là màu chữ tối, không phải nền.** `bg-ink/5..20` là overlay xám ấm nhẹ trên nền
  kem, `bg-ink/60` là backdrop dialog. Đừng dùng `bg-ink` đặc làm nền panel.
- `text-accent2` (vàng) trên nền kem chỉ đạt ~2:1 tương phản — chữ nhỏ dùng `text-gold-deep`
  hoặc `text-accent`; chữ to/mã phòng dùng `.text-gold-shine`.
- Muốn tắt hiệu ứng nền (máy chiếu yếu): bỏ `<TetBackground />` trong `layout.tsx`, hoặc chỉ
  bỏ mảng `PETALS`.
- Sửa `packages/shared` không liên quan phiên này; chỉ cần rebuild image `web`.

## Kết quả kiểm tra (Chrome, 2026-09-23)

- Đã xem qua: `/` (bao lì xì + lồng đèn + tre), `/host` (form kem viền vàng), `/leaderboard/<code>`
  (mã phòng vàng kim ánh kim), `/play/<code>` ở các trạng thái chờ → câu hỏi (4 ô đỏ/vàng/xanh/lam)
  → kết quả (chữ xanh tre, thanh thống kê) → thảo luận (thẻ kem, tên đỏ) → bảng xếp hạng (hạng 1
  thẻ vàng gradient, 🥇, viền đỏ cho chính mình).
- **Chưa xem bằng mắt**: `/host/content` và `/host/rooms/<code>` (cần đăng nhập giáo viên trong
  trình duyệt — agent không nhập mật khẩu). Hai trang này chỉ đổi class qua sed + `tsc` sạch, nên
  nên mở kiểm tra lại 1 lần bằng mắt.
- **Sự cố hiệu năng đã sửa trong phiên**: bản đầu dùng `background-attachment: fixed` trên body +
  `filter: drop-shadow` trên lồng đèn đang animate → renderer Chrome bị treo khi chụp màn hình.
  Đã chuyển gradient sang lớp `TetBackground` (fixed) và thay filter bằng box-shadow.
- Để test, đã `prisma db push` + `npm run seed` vào volume Postgres mới (trống), tạo phòng
  `SGRCWK` (đã kết thúc) và 1 câu quiz tạm (đã xoá). Phòng test còn trong DB, vô hại.
