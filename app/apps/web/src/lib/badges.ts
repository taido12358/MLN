export const BADGE_INFO: Record<string, { emoji: string; name: string; desc: string }> = {
  "tia-chop": { emoji: "⚡", name: "Tia chớp", desc: "Trả lời đúng nhanh nhất phòng" },
  "bat-bai": { emoji: "🛡️", name: "Bất bại", desc: "Đúng 100% số câu đã trả lời" },
  "chuoi-vang": { emoji: "🔥", name: "Chuỗi vàng", desc: "Đạt chuỗi đúng liên tiếp từ 5 câu" },
  "but-pha": { emoji: "🚀", name: "Bứt phá", desc: "Cải thiện thứ hạng nhiều nhất" },
  "ngoi-but-phan-bien": { emoji: "✍️", name: "Ngòi bút phản biện", desc: "Bài thảo luận được upvote nhiều nhất" },
  "loi-nguoc-dong": { emoji: "🌊", name: "Lội ngược dòng", desc: "Từ nhóm cuối bảng vươn lên top 50%" },
  "quan-quan": { emoji: "🏆", name: "Quán quân", desc: "Hạng 1 chung cuộc" },
  "kien-tri": { emoji: "💪", name: "Kiên trì", desc: "Trả lời đầy đủ mọi câu hỏi" },
};

export function badgeInfo(code: string) {
  return BADGE_INFO[code] ?? { emoji: "🎖️", name: code, desc: "" };
}
