# Kế hoạch chi tiết phát triển ứng dụng web quản lý cá cược xổ số (Phiên bản Demo)

## I. Tổng quan ứng dụng

### A. Tech Stack

- **Frontend**: Next.js 15 (App Router), TailwindCSS 4, React Hook Form, Zod, **@tanstack/react-query@4**
- **Backend**: Supabase (Database, Storage)
- **Utilities**: PDF generation

### B. Module chính (Demo Version)

1. Admin Dashboard (Quản lý hệ thống)
2. Bet Form (Đặt cược)
3. Results Dashboard (Kết quả xổ số)
4. History & Tracking (Lịch sử cược)
5. Analytics & Reporting (Thống kê)

## II. Chi tiết các tính năng

### A. Màn hình quản lý và cài đặt (Admin Dashboard)

#### 1. Quản lý loại cược

- **Hiển thị danh sách loại cược**

  - Bảng hiển thị tất cả loại cược (Đầu Đuôi, Xỉu Chủ, Bao Lô, v.v.)
  - Lọc theo miền (M1, M2)
  - Phân trang và tìm kiếm

- **Chỉnh sửa loại cược**

  - Form chỉnh sửa chi tiết từng loại cược
  - Thay đổi tên hiển thị
  - Bật/tắt loại cược (ẩn/hiện trên giao diện)
  - Điều chỉnh tỷ lệ thưởng

- **Quản lý biến thể cược**
  - Danh sách biến thể cho mỗi loại cược
  - Bật/tắt từng biến thể
  - Chỉnh sửa tỷ lệ thưởng cho từng biến thể

#### 2. Quản lý đài xổ số

- **Danh sách đài theo miền**

  - Hiển thị tất cả đài xổ số theo 3 miền
  - Thông tin về lịch mở thưởng

- **Cấu hình đài**
  - Chỉnh sửa thông tin đài (tên, mã)
  - Cấu hình ngày mở thưởng trong tuần
  - Kích hoạt/vô hiệu hóa đài

#### 3. Cấu hình crawling kết quả

- **Lịch tự động crawl**

  - Cài đặt thời gian crawl hàng ngày
  - Logging hoạt động crawl

- **Crawl thủ công**
  - Nút crawl kết quả theo yêu cầu
  - Lựa chọn ngày và miền để crawl

### B. Màn hình đặt cược (Bet Form)

#### 1. Header và thông tin chung

- **Chọn ngày**

  - Ngày đặt cược (mặc định hôm nay)
  - Ngày xổ (chọn từ lịch)

- **Thông tin người chơi (demo mode)**
  - Sử dụng default user ID/Name
  - Simulation số dư

#### 2. Chọn đài và loại cược

- **Chọn miền**

  - Radio buttons cho M1 (Miền Nam/Trung) và M2 (Miền Bắc)
  - Multi-select miền (cả M1 và M2)

- **Chọn tỉnh/đài**

  - Hiển thị danh sách các tỉnh theo miền đã chọn
  - Multi-select tỉnh trong mỗi miền
  - Lọc nhanh tỉnh theo ngày trong tuần

- **Chọn loại cược**
  - Dropdown/Radio cho loại cược chính
  - Hiển thị biến thể tương ứng với loại cược đã chọn

#### 3. Nhập và quản lý số

- **Nhập số trực tiếp**

  - Text input với validation theo loại cược
  - Hỗ trợ nhập nhiều số cùng lúc (cách nhau bởi dấu phẩy)

- **Phương thức chọn số tự động**

  - 12 Con Giáp: UI chọn con giáp
  - Đảo Số: Nhập số gốc và chọn kiểu đảo
  - Tài/Xỉu: Toggle buttons
  - Chẵn/Lẻ: Toggle buttons
  - Kéo Số: UI chọn kiểu kéo và tham số

- **Quản lý số đã chọn**
  - Danh sách số đã chọn
  - Xóa từng số
  - Xóa tất cả

#### 4. Cấu hình tiền cược

- **Nhập mệnh giá**

  - Input mệnh giá với các preset
  - Validation (min/max)

- **Hiển thị tính toán tự động**
  - Tổng tiền đóng
  - Tiềm năng thắng (theo tỷ lệ)
  - Kiểm tra đủ số dư (simulate)

#### 5. Xác nhận và lưu

- **Tóm tắt cược**

  - Hiển thị tất cả thông tin cược
  - Tổng hợp số tiền

- **Nút thao tác**
  - Xác nhận đặt cược
  - Reset form
  - Lưu mẫu cược

### C. Màn hình kết quả xổ số

#### 1. Navigation và bộ lọc

- **Chọn ngày**

  - Date picker
  - Nút nhanh (Hôm nay, Hôm qua)

- **Chọn miền**

  - Tabs cho 3 miền (Bắc, Trung, Nam)
  - Hiển thị miền mặc định dựa theo thời gian

- **Cập nhật kết quả**
  - Nút cập nhật thủ công
  - Indicator trạng thái cập nhật
  - Integration với script crawler

#### 2. Hiển thị kết quả

- **Layout miền Bắc**

  - Table hiển thị kết quả giải
  - Highlight giải Đặc biệt

- **Layout miền Trung/Nam**

  - Table cho từng tỉnh
  - Tab/Swiper để chuyển đổi giữa các tỉnh trong miền

- **Quick Stats**
  - Hiển thị nhanh thông tin trúng thưởng
  - Indicators số nhiều người đặt

#### 3. Phân tích kết quả

- **Tổng hợp đầu/đuôi**

  - Thống kê đầu/đuôi hiện tại
  - So sánh với lịch sử

- **Thống kê nhanh**
  - Số lần xuất hiện
  - Lô gan (số không về trong nhiều ngày)

#### 4. Công cụ kiểm tra

- **Kiểm tra vé**
  - Nhập số vé để kiểm tra nhanh
  - Hiển thị giải nếu trúng

### D. Màn hình lịch sử cược

#### 1. Hiển thị danh sách

- **Filters**

  - Theo ngày (từ - đến)
  - Theo trạng thái (Đang chờ, Đã thắng, Đã thua)
  - Theo loại cược
  - Theo miền/tỉnh

- **Danh sách cược**

  - Bảng với phân trang
  - Quick stats (tổng tiền cược, tổng thắng/thua)

- **Báo cáo tổng hợp**
  - Tổng kết thống kê theo filter
  - Export báo cáo ra Excel/PDF

#### 2. Chi tiết cược

- **Thông tin cược**

  - Loại cược, đài, số cược
  - Mệnh giá và tổng tiền đã đóng
  - Tiền thưởng (nếu thắng)

- **Trạng thái đối soát**

  - Kết quả đối soát chi tiết
  - Số đã về, số tiền thắng từng số

- **Xử lý thắng/thua**
  - In phiếu thưởng (PDF)
  - Cập nhật trạng thái (đã thanh toán)

### E. Màn hình thống kê và báo cáo

#### 1. Dashboard tổng quan

- **Key Performance Indicators**

  - Tổng doanh thu
  - Tổng chi trả
  - Tỷ lệ lợi nhuận

- **Biểu đồ xu hướng**
  - Doanh thu theo thời gian
  - Số lượng cược theo loại
  - Win/Loss ratio

#### 2. Phân tích chuyên sâu

- **Thống kê theo loại cược**

  - Loại cược phổ biến nhất
  - Loại cược lợi nhuận cao nhất

- **Thống kê theo đài**

  - Đài có nhiều người đặt nhất
  - Đài có tỷ lệ thắng cao nhất

- **Thống kê theo số**
  - Số được đặt nhiều nhất
  - Số về nhiều nhất

#### 3. Export và tích hợp

- **Xuất báo cáo**
  - Báo cáo PDF
  - Export data dạng Excel/CSV

## III. Roadmap triển khai (Phiên bản Demo)

### Giai đoạn 1: Thiết lập nền tảng (1-2 tuần)

1. **Tuần 1: Khởi tạo dự án**

   - Thiết lập Next.js 15 project với App Router
   - Cấu hình TailwindCSS 4
   - Thiết lập Supabase Database
   - Cấu hình @tanstack/react-query
   - Tạo database schema theo thiết kế

2. **Tuần 1-2: Triển khai các thành phần cơ bản**
   - Layout chung và navigation
   - Components UI cơ bản
   - Context providers và utility functions
   - Setup React Query client

### Giai đoạn 2: Core features (3-4 tuần)

1. **Tuần 2-3: Màn hình kết quả xổ số**

   - Layout hiển thị kết quả cho 3 miền
   - Integration với crawler script
   - Tối ưu hiển thị và performance
   - Cài đặt các React Query hooks cho data fetching

2. **Tuần 3-4: Bet Form đơn giản**

   - Form đặt cược cơ bản
   - Form validation với React Hook Form + Zod
   - Tính toán tự động tiền cược
   - Integration với React Query mutations

3. **Tuần 4-5: Quản lý loại cược (Admin)**
   - CRUD cho các loại cược
   - Cấu hình tỷ lệ thắng
   - Ẩn/hiện các loại cược
   - React Query mutations và cache management

### Giai đoạn 3: Advanced features (2-3 tuần)

1. **Tuần 5-6: Hoàn thiện Bet Form**

   - Hỗ trợ đặt cược nhiều miền/tỉnh
   - Các phương thức chọn số tự động
   - UI/UX improvements
   - Optimistic updates với React Query

2. **Tuần 6-7: Màn hình lịch sử và xử lý kết quả**
   - Hiển thị lịch sử cược
   - Logic đối soát kết quả
   - In phiếu thưởng (PDF)
   - React Query infinity scroll

### Giai đoạn 4: Analytics & Refinement (1-2 tuần)

1. **Tuần 7-8: Thống kê và báo cáo**

   - Dashboard thống kê
   - Biểu đồ và visualizations
   - Export báo cáo
   - React Query data transformations

2. **Tuần 8: Tối ưu và hoàn thiện**
   - Performance optimizations
   - UI/UX refinements
   - Testing và fixing bugs
   - React Query prefetching & stale-while-revalidate

## IV. Chi tiết các tác vụ triển khai

### A. Cài đặt và cấu hình ban đầu

1. Khởi tạo project Next.js 15 với App Router

   ```bash
   npx create-next-app@latest xoso-app --typescript --tailwind --app
   ```

2. Cài đặt các dependencies

   ```bash
   npm install @tanstack/react-query@4 @supabase/supabase-js react-hook-form zod @hookform/resolvers/zod recharts react-datepicker jspdf tailwind-merge clsx
   ```

3. Thiết lập cấu trúc thư mục

   ```
   /app
     /admin
     /bet
     /results
     /history
     /analytics
   /components
     /ui
     /forms
     /charts
     /admin
     /bet
     /results
   /lib
     /supabase
     /utils
     /hooks
     /validators
   /types
   ```

4. Cấu hình Supabase client
5. Thiết lập React Query provider

### B. Các tác vụ chính theo tính năng

#### 1. Admin Dashboard

- Xây dựng UI quản lý loại cược
- CRUD operations cho loại cược
- Tạo form chỉnh sửa tỷ lệ cược
- Xây dựng UI quản lý đài xổ số
- Thiết lập giao diện crawl kết quả

#### 2. Bet Form

- Thiết kế form đặt cược
- Validation schema với Zod
- Xây dựng UI chọn số
- Logic tính toán tiền cược
- Integration với database

#### 3. Kết quả xổ số

- Layout hiển thị kết quả 3 miền
- Integration với script crawler
- Xây dựng UI phân tích kết quả
- Công cụ kiểm tra vé số

#### 4. Lịch sử cược

- UI danh sách cược
- Filters và search
- Chi tiết cược và đối soát
- In phiếu thưởng

#### 5. Analytics

- Dashboard tổng quan
- Biểu đồ và visualizations
- Export dữ liệu

## V. Các tính năng ưu tiên cho Demo

### Prioritized Features

1. **Màn hình kết quả xổ số**

   - Integration crawler script
   - Hiển thị kết quả 3 miền
   - UI thân thiện, dễ hiểu

2. **Bet Form**

   - Multi-select tỉnh/miền
   - Đầy đủ các phương thức chọn số
   - Tính toán tự động chính xác

3. **Admin Dashboard**

   - Quản lý loại cược và tỷ lệ
   - Cấu hình hiển thị

4. **Lịch sử và Đối soát**

   - Hiển thị rõ ràng kết quả đối soát
   - In phiếu thưởng

5. **Thống kê cơ bản**
   - Hiển thị KPIs
   - Biểu đồ xu hướng

## VI. Kết luận

Kế hoạch phát triển phiên bản demo tập trung vào việc triển khai các tính năng cốt lõi trong thời gian ngắn (khoảng 8 tuần). Phiên bản này loại bỏ các phần phức tạp như authentication, quản lý người dùng và tích hợp thông báo, nhưng vẫn đảm bảo đầy đủ chức năng chính phục vụ cho mục đích demo với khách hàng.

Việc sử dụng @tanstack/react-query giúp tối ưu hóa quá trình fetching data và state management, đặc biệt hữu ích khi làm việc với các tác vụ CRUD phức tạp trong Admin Dashboard và việc hiển thị kết quả xổ số. Mỗi tính năng được phân rã thành các tác vụ cụ thể, giúp team phát triển có thể triển khai song song và tối ưu thời gian.
