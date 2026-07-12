# vivo report daily — PWA cho PG nhập báo cáo Zalo (Báo cáo ngày PG Huế)

Web App tĩnh (không server, không Google Sheet), chạy offline, lưu dữ liệu bằng
IndexedDB ngay trên điện thoại. Đúng theo SRS `VN5 REPORT v1.0 STABLE`.

## Cách đưa lên GitHub Pages

1. Tạo repo mới trên GitHub, ví dụ `vn5-report`.
2. Upload **toàn bộ** các file trong thư mục này (giữ nguyên tên, cùng cấp thư mục gốc):
   - `index.html`, `style.css`, `app.js`, `data.js`
   - `manifest.json`, `sw.js`
   - `logo.png`, `icon-192.png`, `icon-512.png`
3. Vào **Settings → Pages** → Source chọn nhánh `main`, thư mục `/ (root)` → Save.
4. Sau ~1 phút, app sẽ chạy tại `https://<username>.github.io/vn5-report/`.
5. Mở link đó trên điện thoại Android → trình duyệt sẽ gợi ý **"Thêm vào Màn hình chính"**
   (Add to Home Screen) → cài như 1 app thật, chạy offline.

## Dữ liệu đã nhúng sẵn (không cần nhập lại)

- **17 nhân viên** (từ `Nhân_viên.xlsx`): MSNV, Họ tên, Sales, Khu vực, Shop, Phân loại shop.
- **53 model Vivo** (từ `Model.xlsx`).
- **Target tháng** theo từng MSNV + target theo 5 nhóm model KEY (V70, V70 FE, Y31d, Y05, Y11d)
  + V60 Series + Model khác (từ `Target.xlsx`).

Nếu nhân sự/model/target thay đổi, chỉnh trực tiếp trong file `data.js` (là JS thuần,
copy dữ liệu mới vào 3 mảng `EMPLOYEES`, `MODELS`, `TARGETS`) rồi upload lại lên GitHub.

## Những điểm đã tự quyết định khi triển khai (do mẫu gốc không có công thức rõ ràng)

1. **Target Tuần / Target Ngày**: mẫu Zalo gốc có 2 dòng này nhưng `Target.xlsx` chỉ có
   Target Tháng, không có công thức chia tuần/ngày. App để PG **tự nhập tay** 2 số này
   ở tab "Hôm nay" mỗi ngày (Anthropic gợi ý 2 cách khác nhưng bạn đã chọn cách này).
2. **Target theo nhóm model** thay cho "V60lite / V60 5G" (không khớp trực tiếp với cột
   trong `Target.xlsx`): app dùng đúng 7 nhóm có trong file target — V70, V70 FE, Y31d,
   Y05, Y11d, V60 Series, Model khác — để số liệu Target vs Thực tế luôn khớp nguồn gốc.
3. **Công thức "Hôm nay / Lũy kế tháng"**: khi bấm [+]/[-] ở 1 model, số "Hôm nay" và
   "Lũy kế tháng" tăng/giảm cùng lúc. Khi bấm "Tiếp tục báo cáo hôm qua", số Lũy kế
   tháng được giữ nguyên làm mốc, số Hôm nay reset về 0 để PG nhập tiếp cho ngày mới.
   Khi bấm "Báo cáo mới", toàn bộ số liệu (kể cả lũy kế) reset về 0.

## Cấu trúc 3 tab đúng SRS

- **Tab 1 – Hôm nay**: thông tin PG/shop, KPI tháng, chọn ca làm việc, nhập Target
  tuần/ngày, và luồng "Tiếp tục báo cáo hôm qua / Báo cáo mới".
- **Tab 2 – Cập nhật**: ô tìm kiếm model (fuzzy theo số, vd gõ "70" ra "V70 FE"),
  danh sách "Model gần đây", toàn bộ 53 model dùng Stepper [-]/[+], và 4 đối thủ
  (Realme, Samsung, Oppo, Xiaomi) cũng dùng Stepper.
- **Tab 3 – Xuất báo cáo**: xem trước báo cáo đúng định dạng mẫu Zalo, nút Copy
  (dùng `navigator.clipboard.writeText`), Lịch sử 10 báo cáo gần nhất, Backup
  (xuất file `VN5_<MSNV>.json`) và Restore (nhập lại file đó).

## Công nghệ

HTML5 + CSS3 + JavaScript ES6 thuần, IndexedDB, Service Worker (PWA). Không dùng
React/Vue/Bootstrap/Firebase/API/Backend — đúng yêu cầu SRS.
