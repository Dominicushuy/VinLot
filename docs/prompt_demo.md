# KẾ HOẠCH DEMO DỰ ÁN CÁ CƯỢC XỔ SỐ (2 NGÀY) - ĐÃ CẬP NHẬT

## PROMPT ĐẶC BIỆT - CHẠY ĐẦU TIÊN

```
Tôi đang xây dựng ứng dụng cá cược xổ số dựa trên tài liệu sau:
`Rules Detailed Document.md`

Thông tin tất cả các đài xổ số theo ngày:
`danh_sach_tinh_theo_ngay.json`

Thông tin kết quả xổ số theo ngày:
`ketqua_xoso.json`

Hãy phân tích kỹ và tóm tắt các thông tin quan trọng sau:

1. Danh sách tất cả các loại cược có trong tài liệu (đầu đuôi, xỉu chủ, bao lô, v.v.)
2. Cho mỗi loại cược, tóm tắt:
   - Nguyên tắc cơ bản
   - Cách tính tiền đóng
   - Tỷ lệ thắng
   - Áp dụng cho miền nào (M1, M2 hoặc cả hai)
3. Tạo một object JSON chứa thông tin về các loại cược để tôi có thể sử dụng làm dữ liệu mẫu trong database
4. Giải thích ngắn gọn logic đối soát kết quả cho từng loại cược (cách xác định người thắng cuộc)
5. Tạo TypeScript interfaces cho tất cả các đối tượng trong Object JSON (betTypes và numberSelectionMethods)
6. Tạo các utility functions cơ bản cho việc tính toán tiền cược dựa trên các quy tắc
7. Tạo TypeScript interfaces và JSON mẫu cho cấu trúc dữ liệu các đài xổ số theo ngày

Tôi cần hiểu rõ logic nghiệp vụ để lập trình chính xác form builder đặt cược và tính năng đối soát kết quả. Kết quả của phân tích này sẽ được sử dụng cho các prompt tiếp theo.
```

## NGÀY 1: SETUP DỰ ÁN & ADMIN PANEL

### Task 1: Setup dự án ban đầu

```
Tôi đang xây dựng ứng dụng cá cược xổ số với các loại cược và luật chơi như đã phân tích sau:

[Dán phần tóm tắt các loại cược từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần khởi tạo nhanh dự án Next.js 15 với Tailwind CSS và Supabase. Dự án cần hỗ trợ chọn đài xổ số cụ thể theo ngày trong tuần. Hãy cung cấp:

1. Lệnh khởi tạo dự án với Next.js 15 app router và Typescript
2. Danh sách dependencies tối thiểu cần cài đặt (Supabase, react-hook-form, zod, UI components cơ bản)
3. Cấu trúc thư mục cơ bản chỉ tập trung vào 3 tính năng chính:
   - Form builder đặt cược (bao gồm chọn đài cụ thể)
   - Admin cài đặt quy tắc/luật chơi
   - Đối soát kết quả thủ công
4. Nội dung .env.local với các biến môi trường Supabase
5. Cấu hình tailwind.config.js với theme cơ bản phù hợp cho ứng dụng cá cược xổ số
6. package.json với scripts cần thiết

Chỉ cần đủ để chạy demo, không cần authentication phức tạp hay đầy đủ các tính năng.
```

### Task 2: Thiết lập Supabase & Database Schema

```
Dựa trên phân tích luật chơi xổ số và thông tin các đài xổ số theo ngày sau:

Tôi cần thiết lập database schema trên Supabase cho ứng dụng demo. Hãy cung cấp SQL scripts để tạo các tables sau:

1. `rules`: lưu thông tin về luật chơi và tỷ lệ
2. `bets`: lưu thông tin cược
3. `users`: thông tin user đơn giản
4. `results`: lưu kết quả xổ số
5. `provinces`: lưu thông tin các tỉnh/đài xổ số theo ngày
...

Đảm bảo schema có:
- Khóa ngoại hợp lý giữa các bảng
- Indexes cho các trường thường được query
- Constraints phù hợp cho dữ liệu
- Cấu trúc linh hoạt để lưu trữ tất cả các loại cược

Hãy sử dụng JSON object đã phân tích để tạo INSERT statements cho bảng rules, đảm bảo có đầy đủ các loại cược chính.

Tạo thêm INSERT statements để nhập dữ liệu các tỉnh/đài xổ số từ danh_sach_tinh_theo_ngay.json vào bảng provinces.
```

### Task 3: UI Component cơ bản

```
Tôi đang xây dựng ứng dụng cá cược xổ số với các loại cược như sau:

[Dán tóm tắt ngắn gọn về các loại cược từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần xây dựng nhanh một số UI components cơ bản phù hợp với chủ đề cá cược xổ số. Hãy cung cấp code đầy đủ cho:

1. components/ui/Button.tsx (các variants: primary, secondary, outline, ghost)
2. components/ui/Input.tsx (text, number với validation)
3. components/ui/Select.tsx (dropdown selection)
4. components/ui/Card.tsx (card container đơn giản)
5. components/ui/Tabs.tsx (tab navigation)
6. components/ui/Form.tsx (form wrapper với validation)
7. components/ui/Table.tsx (table hiển thị dữ liệu)
8. components/ui/Badge.tsx (hiển thị trạng thái cược: pending, won, lost)
9. components/ui/NumberGrid.tsx (grid hiển thị các số 00-99 để chọn)
10. components/ui/DatePicker.tsx (chọn ngày xổ)
11. components/ui/ProvinceSelector.tsx (chọn tỉnh/đài xổ số theo ngày)
12. lib/utils.ts (utility functions, bao gồm cn/clsx để combine class names)

Sử dụng Tailwind CSS với màu sắc phù hợp cho ứng dụng cá cược xổ số (tông màu xanh dương/đỏ/vàng).
Đảm bảo components đơn giản, đẹp và dễ sử dụng. Chỉ cần đủ để demo, không cần quá phức tạp.
```

### Task 4: Admin Panel - Quản lý luật chơi và đài xổ số

```
Dựa trên phân tích chi tiết về luật chơi xổ số và thông tin các đài xổ số sau:

[Dán TypeScript interfaces và phần tóm tắt về các loại cược từ PROMPT ĐẶC BIỆT vào đây]
[Dán phần phân tích về cấu trúc dữ liệu các đài xổ số theo ngày vào đây]

Tôi cần xây dựng trang admin quản lý luật chơi xổ số và đài xổ số. Hãy cung cấp code đầy đủ cho:

1. app/admin/rules/page.tsx (trang liệt kê tất cả luật chơi)
2. app/admin/rules/new/page.tsx (trang tạo luật chơi mới)
3. app/admin/rules/[id]/page.tsx (trang chỉnh sửa luật chơi)
4. app/admin/provinces/page.tsx (trang quản lý đài xổ số)
5. app/admin/provinces/[id]/page.tsx (trang chỉnh sửa thông tin đài)
6. components/admin/RuleForm.tsx (form tạo/sửa luật chơi)
7. components/admin/RulesTable.tsx (bảng hiển thị luật chơi)
8. components/admin/ProvinceForm.tsx (form tạo/sửa đài xổ số)
9. components/admin/ProvincesTable.tsx (bảng hiển thị đài xổ số)
10. lib/actions/rules.ts (server actions cho CRUD rules)
11. lib/actions/provinces.ts (server actions cho CRUD provinces)
12. lib/validators/ruleSchema.ts (Zod validation schema cho rules)
13. lib/validators/provinceSchema.ts (Zod validation schema cho provinces)

Form quản lý luật chơi cần có các field:
- Tên luật chơi
- Mã luật chơi (rule_code)
- Loại cược (dropdown với tất cả loại cược đã phân tích)
- Khu vực áp dụng (M1, M2, ALL)
- Tỷ lệ thắng (rate)
- Mô tả luật chơi
- Trạng thái (active/inactive)
- Công thức tính tiền cược (stake_formula)
- Biến thể (variants) - có thể thêm nhiều biến thể

Form quản lý đài xổ số cần có các field:
- Tên tỉnh/đài
- Mã đài (code)
- Khu vực (M1, M2)
- Các ngày quay thưởng trong tuần

Sử dụng Server Components và Server Actions của Next.js 15 để tương tác với Supabase.
```

## NGÀY 2: FORM BUILDER & ĐỐI SOÁT KẾT QUẢ

### Task 5: Form Builder đặt cược với chọn đài

```
Dựa trên phân tích chi tiết về luật chơi xổ số, logic tính tiền cược và thông tin các đài xổ số sau:

[Dán TypeScript interfaces và utility functions cho việc tính toán tiền cược từ PROMPT ĐẶC BIỆT vào đây]
[Dán phần phân tích về cấu trúc dữ liệu các đài xổ số theo ngày vào đây]

Tôi cần xây dựng form builder động cho người dùng đặt cược, có khả năng chọn đài xổ số cụ thể. Hãy cung cấp code đầy đủ cho:

1. lib/context/BetFormContext.tsx (context provider quản lý state của form)
2. lib/hooks/useBetForm.ts (custom hook cho việc quản lý form)
3. lib/hooks/useProvinces.ts (custom hook lấy dữ liệu đài xổ số theo ngày)
4. lib/utils/betCalculator.ts (utility tính toán tiền cược và tiềm năng thắng)
5. app/bets/new/page.tsx (trang đặt cược mới)
6. components/betting/BetForm.tsx (form đặt cược chính)
7. components/betting/BetTypeSelector.tsx (component chọn loại cược)
8. components/betting/RegionSelector.tsx (component chọn khu vực M1, M2)
9. components/betting/ProvinceSelector.tsx (component chọn đài xổ số cụ thể)
10. components/betting/DrawDatePicker.tsx (component chọn ngày xổ)
11. components/betting/NumberSelection/index.tsx (component quản lý chọn số)
12. components/betting/NumberSelection/DirectInput.tsx (nhập số trực tiếp)
13. components/betting/NumberSelection/NumberGrid.tsx (chọn từ bảng số)
14. components/betting/NumberSelection/ZodiacSelection.tsx (chọn theo 12 con giáp)
15. components/betting/AmountInput.tsx (component nhập số tiền)
16. components/betting/BetSummary.tsx (hiển thị tóm tắt cược)
17. lib/actions/bets.ts (server action tạo cược mới)

Tập trung vào 3 loại form cược quan trọng nhất:
1. Form cho Đầu Đuôi (components/betting/types/DauDuoiBetForm.tsx)
2. Form cho Bao Lô 2/3/4 (components/betting/types/BaoLoBetForm.tsx)
3. Form cho Đá (components/betting/types/DaBetForm.tsx)

Form cần có các tính năng:
- Chọn đài xổ số cụ thể dựa trên ngày quay thưởng
- Thay đổi động dựa trên loại cược được chọn
- Validation cho số cược theo từng loại
- Tính toán tự động tổng tiền đóng và tiềm năng thắng
- UI thân thiện và responsive
```

### Task 6: Trang in phiếu cược sau khi đặt cược thành công

```
Dựa trên phân tích về luật chơi xổ số và các loại cược sau:

[Dán tóm tắt ngắn gọn về cách tính tiền đóng và tiềm năng thắng từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần tạo trang in phiếu cược sau khi user đặt cược thành công. Phiếu cần hiển thị thông tin đài xổ số cụ thể. Hãy cung cấp code đầy đủ cho:

1. app/bets/[id]/print/page.tsx (trang in phiếu)
2. components/betting/BetTicket.tsx (component hiển thị thông tin phiếu cược)
3. components/betting/QRCode.tsx (component tạo QR code chứa thông tin cược)
4. lib/utils/printUtils.ts (utility functions cho việc in ấn)
5. app/bets/[id]/print/print.css (CSS styles cho việc in phiếu)

Phiếu cược cần có:
- Mã cược duy nhất (bet_code)
- QR code chứa mã cược
- Thông tin đài xổ số đã chọn (tỉnh, ngày xổ)
- Thông tin chi tiết về loại cược, số tiền, số cược
- Ngày giờ đặt cược và ngày xổ
- Chi tiết cách tính tiền đóng (dựa trên loại cược)
- Thông tin tiềm năng thắng (tỷ lệ thắng × số tiền cược)
- Nút in trực tiếp
- Style phù hợp cho cả hiển thị trên màn hình và khi in ra giấy

Trang này cần hiển thị chính xác thông tin theo từng loại cược, đặc biệt là cách tính tiền đóng dựa trên logic đã phân tích.
```

### Task 7: Đối soát kết quả thủ công

```
Dựa trên phân tích chi tiết về luật chơi xổ số, logic đối soát và thông tin các đài xổ số sau:

[Dán phần giải thích về logic đối soát từ PROMPT ĐẶC BIỆT vào đây]
[Dán phần phân tích về cấu trúc dữ liệu các đài xổ số theo ngày vào đây]

Tôi cần xây dựng tính năng đối soát kết quả xổ số thủ công. Tôi đã có sẵn code crawler kết quả xổ số dạng file Node.js. Hãy cung cấp code đầy đủ cho:

1. app/admin/results/page.tsx (trang quản lý kết quả và đối soát)
2. app/admin/results/new/page.tsx (trang nhập kết quả xổ số mới)
3. components/admin/ResultForm.tsx (form nhập kết quả xổ số theo đài)
4. components/admin/ResultUploader.tsx (component upload file kết quả đã crawl)
5. components/admin/ProcessResultsButton.tsx (nút trigger đối soát thủ công)
6. components/admin/ResultsTable.tsx (bảng hiển thị kết quả đã xử lý)
7. components/admin/MatchedBetsTable.tsx (bảng hiển thị cược thắng)
8. lib/actions/results.ts (server actions cho xử lý kết quả)
9. lib/actions/process-bets.ts (server actions cho xử lý đối soát cược)
10. lib/matchers/index.ts (utility chứa các matcher functions)
11. lib/matchers/dauDuoiMatcher.ts (matcher cho đầu đuôi)
12. lib/matchers/baoLoMatcher.ts (matcher cho bao lô)
13. lib/matchers/daMatcher.ts (matcher cho đá)

Logic đối soát cần tích hợp với thông tin đài xổ số:
- Kiểm tra đài xổ số cụ thể mà user đã đặt cược
- Kiểm tra từng loại cược theo đúng quy tắc đã phân tích
- Cập nhật trạng thái các cược và tính tiền thắng
- Hiển thị kết quả đối soát theo từng đài

Tập trung vào việc hiển thị rõ ràng cách đối soát để demo cho khách hàng hiểu quy trình.
```

### Task 8: Trang Dashboard hiển thị kết quả

```
Dựa trên phân tích về luật chơi xổ số, các loại cược và thông tin các đài xổ số sau:

[Dán tóm tắt ngắn gọn về các loại cược từ PROMPT ĐẶC BIỆT vào đây]
[Dán phần phân tích về cấu trúc dữ liệu các đài xổ số theo ngày vào đây]

Tôi cần tạo trang dashboard đơn giản để hiển thị kết quả cược và thống kê cơ bản. Hãy cung cấp code đầy đủ cho:

1. app/dashboard/page.tsx (trang dashboard chính)
2. components/dashboard/BetSummary.tsx (tóm tắt cược)
3. components/dashboard/RecentResults.tsx (kết quả xổ số gần đây theo đài)
4. components/dashboard/WinningBets.tsx (danh sách cược thắng)
5. components/dashboard/BetTypeDistribution.tsx (biểu đồ phân bố theo loại cược)
6. components/dashboard/ProvinceDistribution.tsx (biểu đồ phân bố theo đài xổ số)
7. lib/actions/dashboard.ts (server actions lấy dữ liệu cho dashboard)

Trang dashboard cần hiển thị thông tin theo từng loại cược và đài xổ số:
- Tổng số cược đặt theo từng loại và từng đài
- Tỷ lệ thắng/thua theo từng loại và từng đài
- Kết quả xổ số gần nhất với các giải quan trọng
- Danh sách cược thắng với thông tin cách thắng (khớp với giải nào)

Giao diện cần trực quan, dễ hiểu cho khách hàng, với biểu đồ hoặc bảng tóm tắt rõ ràng.
```

## THỨ TỰ ƯU TIÊN VÀ LIÊN KẾT

### Thứ tự ưu tiên nếu thời gian bị giới hạn

1. Form Builder đặt cược với chọn đài (tập trung vào Đầu Đuôi, Bao Lô)
2. Admin Panel quản lý luật chơi và đài xổ số
3. Đối soát kết quả cơ bản theo đài
4. Trang in phiếu và Dashboard

### Hướng dẫn liên kết giữa các task

```
Lưu ý cho tất cả các prompt:
- Luôn tham chiếu đến interfaces và schema từ Prompt đặc biệt và Task 2
- Tái sử dụng UI components từ Task 3
- Đảm bảo nhất quán về naming convention và cấu trúc dữ liệu
- Khi làm task sau, hãy xem xét output của task trước để đảm bảo tính liên tục
- Mỗi phần code phải có comment đầy đủ và rõ ràng
- Đảm bảo code có thể chạy được ngay khi copy/paste
- Cần tích hợp thông tin đài xổ số vào mỗi chức năng
```

### Các ví dụ dữ liệu cần chuẩn bị

1. Ví dụ kết quả xổ số M1 (Miền Nam/Trung) cho từng đài cụ thể
2. Ví dụ kết quả xổ số M2 (Miền Bắc) cho từng đài cụ thể
3. Ví dụ các phiếu cược với các loại cược khác nhau cho từng đài cụ thể
4. Ví dụ kết quả đối soát cho từng đài

## GỢI Ý TÊN DỰ ÁN

Một số gợi ý tên cho dự án cá cược xổ số:

### Tên tiếng Việt

1. **LôVIP** - Ngắn gọn, thể hiện đẳng cấp
2. **XSMaster** - Thể hiện sự chuyên nghiệp trong lĩnh vực xổ số
3. **LôĐỏ** - Gợi ý sự may mắn (màu đỏ tượng trưng cho may mắn trong văn hóa Á Đông)
4. **XSPlus** - Đơn giản, hiện đại

### Tên tiếng Anh

5. **LottoViet** - Kết hợp cả hai yếu tố xổ số và nguồn gốc Việt Nam
6. **VietBet** - Ngắn gọn, dễ nhớ
7. **NumbersGuru** - Thể hiện sự thông thạo về con số
8. **BetGenius** - Gợi ý sự thông minh trong việc đặt cược

### Tên kết hợp

9. **SoBet** - Kết hợp "Số" (tiếng Việt) và "Bet" (tiếng Anh)
10. **LottoX** - Hiện đại, ngắn gọn
11. **VixLotto** - Sáng tạo, kết hợp Việt và xổ số
12. **Numerix** - Sáng tạo, liên quan đến con số

## LƯU Ý QUAN TRỌNG

1. **Sử dụng dữ liệu đài theo ngày**: Tất cả các form cần tích hợp chọn đài xổ số theo ngày
2. **Cache thông tin đài**: Sử dụng React Context hoặc Server Components để tải thông tin đài tối ưu
3. **Đảm bảo validation**: Kiểm tra loại cược có phù hợp với đài đã chọn không
4. **Tính năng chính**: Form Builder với chọn đài, Quản lý luật chơi và đài, Đối soát kết quả
5. **Test data**: Chuẩn bị dữ liệu mẫu cho từng đài
