# DANH SÁCH PROMPT CHO DỰ ÁN CÁ CƯỢC XỔ SỐ

Dưới đây là danh sách các prompt chi tiết theo từng sprint và task để bạn có thể sử dụng với Chat Bot AI:

## SPRINT 1: SETUP & DATABASE FOUNDATION

### Prompt 1: Khởi tạo dự án Next.js & Cài đặt dependencies

```
Tôi đang xây dựng ứng dụng quản lý cá cược xổ số sử dụng Next.js 15, Tailwind CSS 3 và Supabase. Hãy giúp tôi:

1. Cách khởi tạo dự án Next.js 15 với TypeScript, ESLint, Tailwind và App Router
2. Danh sách đầy đủ các dependencies cần cài đặt cho dự án này (bao gồm Supabase, react-hook-form, zod, UI components, recharts, telegraf)
3. Cấu trúc thư mục chi tiết theo App Router kèm giải thích từng thư mục
4. Nội dung cho file .env.local với các biến môi trường cần thiết (Supabase, etc.)
5. Nội dung cho tsconfig.json với các cài đặt tối ưu

Vui lòng cung cấp mã lệnh đầy đủ để tôi có thể copy và chạy ngay.
```

### Prompt 2: Thiết lập Tailwind CSS & UI Components

```
Tôi cần thiết lập Tailwind CSS 3 và xây dựng UI component library cơ bản cho ứng dụng cá cược xổ số. Hãy giúp tôi:

1. File tailwind.config.js đầy đủ với theme được tùy chỉnh (color scheme phù hợp cho ứng dụng cá cược)
2. Code chi tiết cho các UI components cơ bản sau (mỗi component là một file riêng biệt):
   - Button.tsx (các variants: primary, secondary, outline, ghost)
   - Input.tsx (text, number với validation)
   - Card.tsx (với header, body, footer)
   - Modal.tsx (dialog với Radix UI)
   - Select.tsx (dropdown selection)
   - Form.tsx (form wrapper với error handling)
   - Table.tsx (data table với sorting, pagination)

Mỗi component nên được typed đầy đủ với TypeScript và có documentation rõ ràng.
```

### Prompt 3: Thiết lập Layout Components

```
Tôi cần thiết kế các layout components cho ứng dụng cá cược xổ số. Hãy cung cấp code chi tiết cho:

1. app/layout.tsx (root layout với Supabase provider và font setup)
2. Components/layouts/Navbar.tsx (navigation bar responsive với mobile menu)
3. Components/layouts/Sidebar.tsx (sidebar với các menu items khác nhau cho admin và user)
4. Components/layouts/DashboardLayout.tsx (layout chung cho các trang dashboard)

Sử dụng Tailwind CSS và đảm bảo responsive cho tất cả các thiết bị.
Thêm animation và transitions để tạo UX mượt mà.
```

### Prompt 4: Thiết lập Supabase & Database Schema

```
Tôi đang xây dựng ứng dụng cá cược xổ số và cần thiết lập database trên Supabase. Tài liệu quy tắc cá cược nằm trong file docs.md. Hãy giúp tôi:

1. SQL script đầy đủ để tạo các tables sau trên Supabase:
   - users (id, username, email, full_name, telegram_id, balance, role, created_at, updated_at)
   - rules (id, rule_code, name, description, region, bet_type, rate, active, created_at, updated_at)
   - bets (id, user_id, bet_code, rule_id, region, chosen_numbers, amount, total_amount, potential_win, status, draw_date, result, won_amount, created_at, updated_at)
   - results (id, draw_date, region, province, winning_numbers, created_at)
   - settings (id, key, value, description, updated_at, updated_by)

2. RLS Policies cho từng table để đảm bảo bảo mật
3. Các functions, triggers cần thiết (ví dụ: update_updated_at trigger)
4. Indexes để tối ưu performance

Cung cấp script SQL đầy đủ có thể chạy trực tiếp trên Supabase SQL Editor.
```

### Prompt 5: Tạo Supabase Database Functions

```
Tôi cần tạo các Supabase Database Functions cho ứng dụng cá cược xổ số để xử lý các tác vụ phức tạp. Hãy cung cấp SQL script đầy đủ cho các functions sau:

1. Function tính toán tổng tiền cược dựa trên loại cược, số lượng số và mệnh giá
2. Function kiểm tra kết quả cược và tính toán tiền thắng
3. Function tạo mã cược độc đáo (bet_code) theo format "XS-{timestamp}-{random}"
4. Function cập nhật số dư (balance) của user sau khi đặt cược và sau khi có kết quả

Mỗi function cần có comments chi tiết giải thích logic hoạt động và các tham số đầu vào/đầu ra.
```

### Prompt 6: Thiết lập Supabase Client & Hooks

```
Tôi cần thiết lập Supabase client và custom hooks cho ứng dụng cá cược xổ số. Hãy cung cấp code đầy đủ cho:

1. lib/supabase/client.ts (client-side Supabase client)
2. lib/supabase/server.ts (server-side Supabase client với cookies)
3. lib/hooks/useUser.ts (hook lấy và quản lý thông tin user hiện tại)
4. lib/hooks/useRules.ts (hook lấy luật chơi từ Supabase)
5. lib/hooks/useBets.ts (hook quản lý cược: tạo, lấy lịch sử, etc.)
6. lib/hooks/useResults.ts (hook lấy kết quả xổ số)

Mỗi hook cần có TypeScript types đầy đủ, error handling, và loading states.
```

### Prompt 7: Thiết lập Authentication & Middleware

```
Tôi cần thiết lập authentication và route protection cho ứng dụng cá cược xổ số. Hãy cung cấp code chi tiết cho:

1. Middleware.ts để bảo vệ routes (phân biệt routes cho admin và user)
2. Components/auth/AuthProvider.tsx (context provider cho auth state)
3. app/(auth)/login/page.tsx (trang đăng nhập đầy đủ với form validation)
4. app/(auth)/register/page.tsx (trang đăng ký đầy đủ với form validation)
5. app/(auth)/layout.tsx (auth layout chung)
6. app/api/auth/[...nextauth]/route.ts (API routes cho authentication)

Sử dụng react-hook-form và zod cho form validation. Đảm bảo UI/UX đẹp với Tailwind CSS.
```

## SPRINT 2: ADMIN DASHBOARD

### Prompt 8: Tạo Layout cho Admin Dashboard

```
Tôi cần tạo layout cho Admin Dashboard của ứng dụng cá cược xổ số. Hãy thiết kế và cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/layout.tsx (admin layout chung)
2. components/layouts/AdminSidebar.tsx (sidebar với các menu items:)
   - Dashboard (tổng quan)
   - Quản lý luật chơi
   - Quản lý người dùng
   - Cài đặt hệ thống
   - Báo cáo
3. components/layouts/AdminHeader.tsx (header với user info, notifications, settings)

Sử dụng Tailwind CSS và đảm bảo responsive. Thêm dark mode toggle nếu có thể.
```

### Prompt 9: Admin Dashboard Overview

```
Tôi cần tạo trang Dashboard Overview cho Admin trong ứng dụng cá cược xổ số. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/page.tsx (trang dashboard chính)
2. components/dashboard/StatCard.tsx (component hiển thị số liệu thống kê)
3. components/dashboard/RecentBetsTable.tsx (table hiển thị các cược gần đây)
4. components/dashboard/RevenueChart.tsx (biểu đồ doanh thu sử dụng Recharts)
5. components/dashboard/BetStatusPieChart.tsx (biểu đồ tròn trạng thái cược)

Kết hợp tất cả components trên trong trang dashboard chính. Đảm bảo UI thân thiện và responsive.
```

### Prompt 10: Admin Rules Management - Part 1

```
Tôi cần xây dựng phần quản lý luật chơi (Rules Management) cho Admin trong ứng dụng cá cược xổ số. Dựa trên tài liệu docs.md, hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/rules/page.tsx (trang danh sách luật chơi)
2. components/rules/RulesTable.tsx (bảng hiển thị và quản lý luật chơi với các actions)
3. components/rules/RuleFilterBar.tsx (thanh tìm kiếm và lọc luật chơi)
4. app/api/rules/route.ts (API endpoint để lấy danh sách luật và tạo luật mới)

Sử dụng Server Components của Next.js 14 để tối ưu performance. Hiển thị các thông tin quan trọng như tên luật, tỉ lệ thắng, trạng thái active, v.v.
```

### Prompt 11: Admin Rules Management - Part 2

```
Tiếp tục xây dựng phần quản lý luật chơi, tôi cần code cho trang tạo mới và chỉnh sửa luật chơi. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/rules/new/page.tsx (trang tạo luật chơi mới)
2. app/(dashboard)/admin/rules/[id]/page.tsx (trang xem và chỉnh sửa luật chơi)
3. components/forms/RuleForm.tsx (form component cho luật chơi với tất cả fields cần thiết)
4. lib/validators/ruleSchema.ts (Zod schema cho validation)
5. app/api/rules/[id]/route.ts (API handler cho GET, PUT, DELETE)

Form cần hỗ trợ tất cả loại luật chơi từ tài liệu docs.md (đầu đuôi, xỉu chủ, bao lô, v.v.) với validation phù hợp cho từng loại cược.
```

### Prompt 12: Form Component cho từng Loại Cược

```
Dựa vào tài liệu docs.md về các loại cược xổ số, tôi cần tạo các form components riêng biệt cho từng loại cược. Hãy cung cấp code đầy đủ cho:

1. components/forms/bet-types/DauDuoiForm.tsx (Form cho đầu đuôi)
2. components/forms/bet-types/XiuChuForm.tsx (Form cho xỉu chủ)
3. components/forms/bet-types/BaoLoForm.tsx (Form cho bao lô 2, 3, 4)
4. components/forms/bet-types/DaForm.tsx (Form cho Đá)
5. components/forms/bet-types/XienForm.tsx (Form cho Xiên)
6. components/forms/bet-types/BaoLoSpecialForm.tsx (Form cho Bao 7 lô, Bao 8 lô)

Mỗi form cần có các fields phù hợp với loại cược, validation logic, và chức năng tính toán số tiền cược tự động.
```

### Prompt 13: Admin User Management

```
Tôi cần xây dựng phần quản lý người dùng (User Management) cho Admin. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/users/page.tsx (trang danh sách users)
2. components/users/UsersTable.tsx (bảng hiển thị users với sorting, filtering)
3. app/(dashboard)/admin/users/new/page.tsx (trang tạo user mới)
4. app/(dashboard)/admin/users/[id]/page.tsx (trang chi tiết và chỉnh sửa user)
5. components/forms/UserForm.tsx (form component cho user)
6. app/api/users/route.ts và app/api/users/[id]/route.ts (API endpoints)

Chức năng cần có: tạo user mới, chỉnh sửa thông tin, đổi role (admin/user), điều chỉnh số dư (balance), reset password, xem lịch sử cược của user.
```

### Prompt 14: Settings Management

```
Tôi cần xây dựng trang quản lý cài đặt hệ thống (Settings) cho Admin. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/settings/page.tsx (trang cài đặt)
2. components/settings/SettingsForm.tsx (form component với tất cả settings)
3. lib/validators/settingsSchema.ts (Zod validation schema)
4. app/api/settings/route.ts (API endpoints)

Settings cần quản lý:
- Telegram Bot Token
- Thời gian đóng cược (giờ cụ thể mỗi ngày)
- Thời gian crawler chạy
- Tỉ lệ thưởng mặc định cho các loại cược
- Các cài đặt hệ thống khác

Form nên được chia thành các sections rõ ràng và có validation đầy đủ.
```

### Prompt 15: Crawler Integration - Part 1

```
Tôi cần tích hợp crawler xổ số vào hệ thống (tôi đã có sẵn code crawler). Hãy cung cấp code đầy đủ cho:

1. lib/services/crawlerService.ts (service để gọi crawler API và xử lý kết quả)
2. app/api/crawler/route.ts (API endpoint để trigger crawler thủ công)
3. app/(dashboard)/admin/crawler/page.tsx (trang quản lý và theo dõi crawler)
4. components/crawler/CrawlerHistory.tsx (component hiển thị lịch sử chạy crawler)

Chức năng cần có:
- Trigger crawler thủ công
- Xem lịch sử chạy crawler
- Xem kết quả crawler gần nhất
- Debug mode để kiểm tra kết quả crawler
```

### Prompt 16: Crawler Integration - Part 2 (Supabase Edge Function)

```
Tôi cần tạo Supabase Edge Function để chạy crawler tự động hàng ngày. Hãy cung cấp code đầy đủ cho:

1. supabase/functions/daily-crawler/index.ts (Edge Function để chạy crawler)
2. Tất cả code cần thiết để function này hoạt động (imports, types, etc.)
3. Hướng dẫn cách deploy function này lên Supabase
4. Cách cấu hình cron trigger để function chạy tự động hàng ngày

Function này cần:
- Gọi crawler API
- Xử lý kết quả và lưu vào Supabase
- Gửi notification nếu có lỗi
- Log chi tiết quá trình crawl
```

## SPRINT 3: USER INTERFACE & BETTING

### Prompt 17: User Dashboard Layout

```
Tôi cần thiết kế layout cho User Dashboard của ứng dụng cá cược xổ số. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/user/layout.tsx (user layout chung)
2. components/layouts/UserSidebar.tsx (sidebar với các menu items):
   - Dashboard
   - Đặt cược mới
   - Lịch sử cược
   - Thông tin cá nhân
3. components/layouts/UserHeader.tsx (header với user info, balance, notifications)

Sử dụng Tailwind CSS và đảm bảo responsive. Thiết kế UI thân thiện, dễ sử dụng cho người dùng.
```

### Prompt 18: Form Builder cho Betting - Part 1

```
Dựa vào tài liệu docs.md về luật chơi xổ số, tôi cần tạo form builder động cho user đặt cược. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/user/bets/new/page.tsx (trang đặt cược mới)
2. components/betting/BetTypeSelector.tsx (component chọn loại cược)
3. components/betting/RegionSelector.tsx (component chọn khu vực: M1, M2)
4. components/betting/BetForm.tsx (form component chính)
5. lib/validators/betSchema.ts (Zod schema cho validation)

Form cần có:
- Chọn loại cược (đầu đuôi, xỉu chủ, bao lô,...)
- Chọn khu vực (M1, M2)
- Các fields động phụ thuộc vào loại cược
- Tính toán tự động tổng tiền cược
```

### Prompt 19: Form Builder cho Betting - Part 2

```
Tiếp tục xây dựng form đặt cược, tôi cần code cho các component con và logic tính toán. Hãy cung cấp code đầy đủ cho:

1. components/betting/NumberInput.tsx (component nhập số đặt cược)
2. components/betting/AmountInput.tsx (component nhập số tiền)
3. lib/utils/betCalculator.ts (utility function tính toán tổng tiền cược và tiềm năng thắng)
4. components/betting/BetSummary.tsx (component hiển thị thông tin tóm tắt cược)
5. components/betting/ConfirmBetModal.tsx (modal xác nhận trước khi đặt cược)
6. app/api/bets/route.ts (API endpoint để tạo cược mới)

Tính toán cần tuân theo đúng logic trong tài liệu docs.md với tất cả các loại cược và tỉ lệ thắng.
```

### Prompt 20: Chi tiết Form cho từng Loại Cược

```
Tôi cần tạo các form components chi tiết cho từng loại cược xổ số theo tài liệu docs.md. Hãy cung cấp code đầy đủ cho:

1. components/betting/types/DauDuoiBetForm.tsx (Form đầu đuôi)
2. components/betting/types/XiuChuBetForm.tsx (Form xỉu chủ)
3. components/betting/types/BaoLoBetForm.tsx (Form bao lô 2/3/4)
4. components/betting/types/BaoLoSpecialBetForm.tsx (Form bao 7 lô, bao 8 lô)
5. components/betting/types/DaBetForm.tsx (Form đá)
6. components/betting/types/XienBetForm.tsx (Form xiên)

Mỗi form component cần có:
- Validation phù hợp với loại cược
- UI trực quan để nhập số cược
- Logic tính toán tổng tiền
- Hỗ trợ các tuỳ chọn đặc biệt (nếu có) theo tài liệu
```

### Prompt 21: Trang In Phiếu Cược

```
Tôi cần tạo trang in phiếu cược sau khi user đặt cược thành công. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/user/bets/[id]/print/page.tsx (trang in phiếu)
2. components/betting/BetTicket.tsx (component hiển thị thông tin phiếu cược)
3. components/betting/QRCode.tsx (component tạo QR code chứa thông tin cược)
4. lib/utils/printUtils.ts (utility functions cho việc in ấn)

Phiếu cược cần có:
- Mã cược duy nhất (bet_code)
- QR code chứa mã cược
- Thông tin chi tiết về loại cược, số tiền, số cược
- Ngày giờ đặt cược và ngày xổ
- Thông tin user
- Nút in trực tiếp
- Nút gửi qua Telegram
```

### Prompt 22: Trang Lịch Sử Cược

```
Tôi cần tạo trang lịch sử cược cho user. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/user/history/page.tsx (trang lịch sử cược)
2. components/betting/BetHistoryTable.tsx (bảng hiển thị lịch sử cược)
3. components/betting/BetStatusBadge.tsx (component hiển thị trạng thái cược)
4. components/betting/BetFilters.tsx (các bộ lọc: thời gian, loại cược, trạng thái)
5. lib/hooks/useBetHistory.ts (custom hook lấy dữ liệu lịch sử cược)

Chức năng cần có:
- Hiển thị tất cả cược của user với phân trang
- Lọc theo ngày, loại cược, trạng thái
- Link đến chi tiết từng cược
- Hiển thị tổng tiền đã cược và tiền thắng/thua
```

### Prompt 23: Trang Chi tiết Cược

```
Tôi cần tạo trang xem chi tiết một cược cụ thể. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/user/bets/[id]/page.tsx (trang chi tiết cược)
2. components/betting/BetDetails.tsx (component hiển thị chi tiết cược)
3. components/betting/ResultsDisplay.tsx (component hiển thị kết quả xổ số liên quan)
4. components/betting/WinningCalculation.tsx (component hiển thị cách tính tiền thắng)
5. app/api/bets/[id]/route.ts (API endpoint để lấy thông tin chi tiết cược)

Trang cần hiển thị:
- Tất cả thông tin về cược (loại, số cược, tiền cược, ngày cược)
- Trạng thái cược hiện tại
- Kết quả xổ số liên quan (nếu đã có)
- Cách tính tiền thắng (nếu trúng)
- Nút in phiếu cược
- Nút chia sẻ kết quả qua Telegram (nếu đã có kết quả)
```

## SPRINT 4: RESULT PROCESSING & NOTIFICATIONS

### Prompt 24: Đối Soát Kết Quả - Part 1

```
Tôi cần tạo logic đối soát kết quả xổ số với các cược đã đặt. Dựa trên tài liệu docs.md về luật chơi, hãy cung cấp code đầy đủ cho:

1. lib/services/resultService.ts (service xử lý đối soát kết quả)
2. lib/utils/betMatching.ts (utility functions kiểm tra trúng thưởng cho từng loại cược)
3. app/api/results/process/route.ts (API endpoint để trigger đối soát)

Chức năng cần có:
- Đọc kết quả xổ số từ database
- Lấy tất cả cược với trạng thái 'pending' cho ngày xổ tương ứng
- Kiểm tra từng cược theo đúng luật chơi
- Tính toán số tiền thắng nếu trúng
- Cập nhật trạng thái cược và số tiền thắng
```

### Prompt 25: Đối Soát Kết Quả - Part 2

```
Tiếp tục từ phần đối soát kết quả, tôi cần code chi tiết cho việc kiểm tra trúng thưởng cho từng loại cược cụ thể. Dựa trên docs.md, hãy cung cấp code đầy đủ cho:

1. lib/utils/matchers/dauDuoiMatcher.ts (hàm kiểm tra đầu đuôi)
2. lib/utils/matchers/xiuChuMatcher.ts (hàm kiểm tra xỉu chủ)
3. lib/utils/matchers/baoLoMatcher.ts (hàm kiểm tra bao lô 2/3/4)
4. lib/utils/matchers/daMatcher.ts (hàm kiểm tra đá)
5. lib/utils/matchers/xienMatcher.ts (hàm kiểm tra xiên)
6. lib/utils/matchers/baoLoSpecialMatcher.ts (hàm kiểm tra bao 7 lô, bao 8 lô)

Mỗi matcher cần:
- Kiểm tra số cược với kết quả xổ số
- Trả về kết quả trúng/thua và cách tính cụ thể
- Tính toán số tiền thắng chính xác theo tỉ lệ quy định
```

### Prompt 26: Đối Soát Kết Quả - Part 3 (Supabase Edge Function)

```
Tôi cần tạo Supabase Edge Function để tự động đối soát kết quả sau khi crawler hoàn thành. Hãy cung cấp code đầy đủ cho:

1. supabase/functions/process-results/index.ts (Edge Function đối soát kết quả)
2. Tất cả code cần thiết để function này hoạt động (imports, types, etc.)
3. Hướng dẫn cách deploy function này lên Supabase
4. Cách cấu hình để function này chạy tự động sau khi crawler hoàn thành

Function này cần:
- Lấy kết quả xổ số mới nhất
- Chạy đối soát cho tất cả cược liên quan
- Cập nhật số dư của users khi họ thắng
- Gửi notification qua Telegram cho users thắng cược
- Log chi tiết quá trình đối soát
```

### Prompt 27: Admin Result Management

```
Tôi cần tạo giao diện quản lý kết quả xổ số cho Admin. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/results/page.tsx (trang quản lý kết quả)
2. components/results/ResultsTable.tsx (bảng hiển thị kết quả)
3. components/results/ResultDetailsModal.tsx (modal xem chi tiết kết quả)
4. components/results/ProcessResultsButton.tsx (nút trigger đối soát thủ công)
5. app/api/results/route.ts và app/api/results/[id]/route.ts (API endpoints)

Chức năng cần có:
- Xem tất cả kết quả xổ số đã crawl với phân trang và lọc
- Xem chi tiết kết quả (tất cả các giải)
- Thêm kết quả thủ công nếu crawler thất bại
- Trigger đối soát thủ công
- Xem danh sách cược đã xử lý theo từng kết quả
```

### Prompt 28: Telegram Notification - Part 1

```
Tôi cần tạo service gửi thông báo qua Telegram cho users. Hãy cung cấp code đầy đủ cho:

1. lib/services/telegramService.ts (service gửi thông báo Telegram)
2. app/api/telegram/notify/route.ts (API endpoint để gửi notification thủ công)
3. components/settings/TelegramSetupForm.tsx (form cài đặt Telegram cho user)
4. app/(dashboard)/user/settings/telegram/page.tsx (trang cài đặt Telegram)

Service cần có các functions:
- sendWinningNotification(userId, betId, amount): gửi thông báo thắng cược
- sendResultNotification(userId, region, date): gửi thông báo kết quả xổ
- testConnection(telegramId): kiểm tra kết nối tới user
- getBotInformation(): lấy thông tin bot

Đảm bảo service này có error handling đầy đủ và retry logic.
```

### Prompt 29: Telegram Notification - Part 2 (Supabase Edge Function)

```
Tôi cần tạo Supabase Edge Function để gửi thông báo Telegram tự động. Hãy cung cấp code đầy đủ cho:

1. supabase/functions/telegram-notifications/index.ts (Edge Function gửi notifications)
2. Tất cả code cần thiết để function này hoạt động (imports, types, etc.)
3. Hướng dẫn cách deploy function này lên Supabase
4. Cách cấu hình để function này tự động gửi notifications sau khi đối soát

Function này cần:
- Lấy danh sách cược vừa được đối soát và có kết quả thắng
- Lấy thông tin Telegram của users tương ứng
- Gửi thông báo chi tiết về kết quả thắng
- Xử lý error và retry nếu gửi thất bại
- Log chi tiết quá trình gửi notification
```

## SPRINT 5: REPORTS & FINISHING

### Prompt 30: Báo Cáo Admin - Part 1

```
Tôi cần tạo trang báo cáo thống kê cho Admin. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/reports/page.tsx (trang báo cáo chính)
2. components/reports/DailyRevenueChart.tsx (biểu đồ doanh thu hàng ngày)
3. components/reports/UserBetDistribution.tsx (biểu đồ phân bố cược theo user)
4. components/reports/BetTypeDistribution.tsx (biểu đồ phân bố theo loại cược)
5. components/reports/WinLossRatio.tsx (biểu đồ tỉ lệ thắng/thua)

Sử dụng thư viện Recharts để tạo các biểu đồ. Đảm bảo mỗi biểu đồ có:
- Tùy chọn filter theo thời gian (ngày, tuần, tháng, năm)
- Tooltips chi tiết khi hover
- Chức năng export dữ liệu (CSV, Excel)
- Responsive design
```

### Prompt 31: Báo Cáo Admin - Part 2

```
Tiếp tục xây dựng trang báo cáo, tôi cần code cho các báo cáo chi tiết và API routes. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/reports/users/page.tsx (báo cáo theo users)
2. app/(dashboard)/admin/reports/bets/page.tsx (báo cáo theo cược)
3. app/(dashboard)/admin/reports/revenue/page.tsx (báo cáo doanh thu)
4. app/api/reports/route.ts (API endpoint cho báo cáo tổng hợp)
5. app/api/reports/export/route.ts (API endpoint xuất báo cáo sang Excel/CSV)
6. lib/services/reportService.ts (service xử lý dữ liệu báo cáo)

Báo cáo cần có chức năng:
- Filter theo nhiều tiêu chí (thời gian, loại cược, users)
- Xuất báo cáo sang nhiều định dạng (Excel, CSV, PDF)
- Lưu preset báo cáo để tái sử dụng
- Tự động tính toán các chỉ số quan trọng (doanh thu, lợi nhuận, ROI)
```

### Prompt 32: Admin Actions & Batch Operations

```
Tôi cần tạo các chức năng xử lý hàng loạt (batch operations) cho Admin. Hãy cung cấp code đầy đủ cho:

1. app/(dashboard)/admin/actions/page.tsx (trang admin actions)
2. components/admin/BatchOperationsForm.tsx (form thực hiện batch operations)
3. components/admin/ConfirmActionModal.tsx (modal xác nhận action)
4. app/api/admin/actions/route.ts (API endpoint xử lý batch operations)
5. lib/services/adminActionService.ts (service xử lý admin actions)

Các batch operations cần hỗ trợ:
- Hủy cược hàng loạt theo tiêu chí (date range, bet type, etc.)
- Đánh dấu đã thanh toán cho nhiều cược cùng lúc
- Khóa/mở khóa nhiều tài khoản user
- Điều chỉnh số dư (balance) cho nhiều user
- Export dữ liệu hàng loạt
```

### Prompt 33: Testing & Debugging - Unit Tests

```
Tôi cần viết unit tests cho các logic phức tạp trong ứng dụng cá cược xổ số. Hãy cung cấp code đầy đủ cho:

1. __tests__/utils/betCalculator.test.ts (tests cho việc tính tiền cược)
2. __tests__/utils/matchers/dauDuoiMatcher.test.ts (tests cho matcher đầu đuôi)
3. __tests__/utils/matchers/baoLoMatcher.test.ts (tests cho matcher bao lô)
4. __tests__/utils/matchers/daMatcher.test.ts (tests cho matcher đá)
5. __tests__/services/resultService.test.ts (tests cho service đối soát kết quả)

Mỗi test file cần:
- Multiple test cases cho các scenario khác nhau
- Test cases cho happy path và edge cases
- Mock data phù hợp
- Clear assertions
- Comments giải thích logic test
```

### Prompt 34: API Documentation & Deployment

```
Tôi cần code và cấu hình cho documentation và deployment. Hãy cung cấp đầy đủ:

1. Swagger/OpenAPI schema cho tất cả API endpoints của ứng dụng
2. File .github/workflows/ci.yml cho GitHub Actions CI/CD
3. Cấu hình Vercel cho deployment (vercel.json)
4. Hướng dẫn chi tiết cách deploy Supabase Edge Functions
5. Documentation cho API sử dụng NextJS API routes

Documentation cần:
- Mô tả đầy đủ các endpoints
- Request và response schema
- Authentication requirements
- Example requests và responses
- Error codes và handling
```

## SPRINT 6: POLISH & ENHANCEMENTS

### Prompt 35: UX Enhancements - Loading States & Error Handling

```
Tôi cần tăng cường UX cho ứng dụng cá cược xổ số bằng cách thêm loading states và error handling. Hãy cung cấp code đầy đủ cho:

1. components/ui/LoadingSpinner.tsx (component hiển thị loading)
2. components/ui/ErrorMessage.tsx (component hiển thị error)
3. lib/hooks/useLoadingState.ts (custom hook quản lý loading state)
4. lib/hooks/useErrorHandler.ts (custom hook xử lý errors)
5. components/ui/PageTransition.tsx (animation khi chuyển trang)

Implement trên một số trang chính:
- Form đặt cược
- Trang lịch sử cược
- Trang admin dashboard

Đảm bảo UI thân thiện, rõ ràng và responsive.
```

### Prompt 36: Responsive Design Mobile Optimization

```
Tôi cần tối ưu hóa ứng dụng cá cược xổ số cho mobile. Hãy cung cấp code đầy đủ để tối ưu các component chính:

1. components/layouts/ResponsiveSidebar.tsx (sidebar responsive)
2. components/betting/MobileBetForm.tsx (form đặt cược tối ưu cho mobile)
3. components/ui/MobileNavigation.tsx (thanh navigation bottom cho mobile)
4. components/tables/ResponsiveTable.tsx (bảng dữ liệu responsive)
5. app/layout.tsx (cập nhật với meta viewport tags và responsive utilities)

Kèm theo media queries và Tailwind utilities để đảm bảo tất cả trang đều responsive trên các kích thước màn hình từ 320px đến 1920px.
```

### Prompt 37: Animations & Transitions

```
Tôi cần thêm animations và transitions cho ứng dụng cá cược xổ số để tăng UX. Hãy cung cấp code đầy đủ cho:

1. components/ui/animations/FadeIn.tsx (animation fade in khi load component)
2. components/ui/animations/SlideIn.tsx (animation slide in)
3. components/ui/animations/NumberCounter.tsx (animation đếm số)
4. components/ui/animations/ConfettiEffect.tsx (hiệu ứng confetti khi thắng cược)
5. lib/hooks/useAnimations.ts (custom hook quản lý animations)

Áp dụng animations vào các trường hợp cụ thể:
- Form đặt cược thành công
- Hiển thị kết quả thắng cược
- Chuyển trang
- Hiệu ứng hover/focus trên các interactive elements
```

### Prompt 38: Performance Optimization - Database & Caching

```
Tôi cần tối ưu performance cho ứng dụng cá cược xổ số. Hãy cung cấp code đầy đủ cho:

1. Script SQL tạo indexes cho các bảng trong Supabase
2. lib/utils/cache.ts (utility functions cho caching)
3. Cấu hình ISR/SSG cho các trang static hoặc semi-static
4. Middleware cho API route caching
5. Lazy loading cho heavy components

Cấu hình caching chiến lược cho:
- Dữ liệu luật chơi (ít thay đổi)
- Kết quả xổ số
- Báo cáo thống kê
- User data (với invalidation phù hợp)
```

### Prompt 39: Security Enhancements

```
Tôi cần tăng cường bảo mật cho ứng dụng cá cược xổ số. Hãy cung cấp code đầy đủ cho:

1. middleware.ts (cập nhật với rate limiting và security headers)
2. lib/utils/security.ts (utility functions cho security checks)
3. Cấu hình Content-Security-Policy
4. lib/utils/inputSanitizer.ts (utility sanitize user inputs)
5. lib/hooks/useCsrfToken.ts (hook xử lý CSRF protection)

Cung cấp thêm:
- Cách cấu hình Supabase RLS policies bảo mật
- Best practices cho xử lý authentication
- Input validation toàn diện
- Secure password handling
- Audit logging cho sensitive actions
```

### Prompt 40: Final Testing & Launch Checklist

```
Tôi cần một checklist và scripts để chuẩn bị cho launch ứng dụng cá cược xổ số. Hãy cung cấp:

1. Cypress E2E test scripts cho các luồng chính (đăng nhập, đặt cược, admin dashboard)
2. Launch checklist đầy đủ (security, performance, analytics)
3. Production environment setup guide
4. Monitoring configuration (error tracking, analytics)
5. Backup và disaster recovery plan

Cung cấp thêm:
- Kịch bản load testing
- User acceptance testing script
- Documentation cho end users
- Phương pháp collect feedback sau launch
```

---

Với các prompt chi tiết trên, bạn có thể dần dần xây dựng từng phần của dự án cá cược xổ số bằng AI. Mỗi prompt đã được thiết kế để:

1. Nêu rõ yêu cầu cụ thể
2. Liệt kê các files/components cần tạo
3. Mô tả chức năng chi tiết
4. Tham chiếu đến tài liệu quan trọng (như docs.md)

Bằng cách chia nhỏ dự án thành các prompt nhỏ như vậy, bạn có thể nhận được code chất lượng hơn từ ChatBot AI và dễ dàng quản lý tiến độ dự án.
