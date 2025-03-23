-- Kích hoạt extension UUID để sử dụng uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng provinces - lưu thông tin các tỉnh/đài xổ số
CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id VARCHAR(255) UNIQUE NOT NULL,  -- ID của tỉnh, dùng để liên kết
  name VARCHAR(255) NOT NULL,                -- Tên tỉnh
  code VARCHAR(255),                         -- Mã tỉnh (XSHCM, XSDT, ...)
  region VARCHAR(50) NOT NULL,               -- mien-bac, mien-trung, mien-nam
  region_type VARCHAR(2) NOT NULL,           -- M1, M2
  draw_days TEXT[] NOT NULL,                 -- Các ngày trong tuần có xổ số
  is_active BOOLEAN DEFAULT TRUE,            -- Trạng thái hoạt động
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Index cho trường thường được query
CREATE INDEX idx_provinces_region ON provinces(region);
CREATE INDEX idx_provinces_region_type ON provinces(region_type);

-- Bảng rules - lưu thông tin về luật chơi và tỷ lệ
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bet_type_id VARCHAR(50) UNIQUE NOT NULL,    -- dd, xc, b2, b3, b4, ...
  name VARCHAR(255) NOT NULL,                 -- Tên loại cược
  description TEXT,                           -- Mô tả về loại cược
  digit_count INT,                            -- Số chữ số cần cho cược (2, 3, 4)
  region_rules JSONB NOT NULL,                -- Lưu quy tắc theo từng miền
  variants JSONB,                             -- Các biến thể của loại cược
  winning_ratio JSONB NOT NULL,               -- Tỷ lệ thưởng
  is_active BOOLEAN DEFAULT TRUE,             -- Trạng thái hoạt động
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rules_bet_type_id ON rules(bet_type_id);

-- Bảng users - thông tin người dùng đơn giản
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Bảng results - lưu kết quả xổ số
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id VARCHAR(255) NOT NULL,          -- Liên kết với provinces.province_id
  date DATE NOT NULL,                         -- Ngày xổ số
  day_of_week VARCHAR(20) NOT NULL,           -- Thứ trong tuần
  special_prize TEXT[] NOT NULL,              -- Giải đặc biệt
  first_prize TEXT[] NOT NULL,                -- Giải nhất
  second_prize TEXT[] NOT NULL,               -- Giải nhì
  third_prize TEXT[] NOT NULL,                -- Giải ba
  fourth_prize TEXT[] NOT NULL,               -- Giải tư
  fifth_prize TEXT[] NOT NULL,                -- Giải năm
  sixth_prize TEXT[] NOT NULL,                -- Giải sáu
  seventh_prize TEXT[] NOT NULL,              -- Giải bảy
  eighth_prize TEXT[],                        -- Giải tám (chỉ có ở M1)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint để đảm bảo mỗi tỉnh chỉ có 1 kết quả trong ngày
  UNIQUE(province_id, date)
);

CREATE INDEX idx_results_province_id ON results(province_id);
CREATE INDEX idx_results_date ON results(date);

-- Bảng bets - lưu thông tin cược
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bet_date DATE NOT NULL,                     -- Ngày đặt cược
  draw_date DATE NOT NULL,                    -- Ngày xổ số
  region_type VARCHAR(2) NOT NULL,            -- M1 hoặc M2
  province_id VARCHAR(255) NOT NULL,          -- Liên kết với provinces.province_id
  bet_type VARCHAR(50) NOT NULL,              -- Loại cược (dd, xc, b2, ...)
  bet_variant VARCHAR(50),                    -- Biến thể của loại cược
  numbers TEXT[] NOT NULL,                    -- Các số đã đặt
  selection_method VARCHAR(50) NOT NULL,      -- Phương thức chọn số
  denomination DECIMAL(15, 2) NOT NULL,       -- Mệnh giá
  total_amount DECIMAL(15, 2) NOT NULL,       -- Tổng tiền đặt
  potential_win_amount DECIMAL(15, 2) NOT NULL, -- Tiền tiềm năng thắng
  status VARCHAR(20) DEFAULT 'pending',       -- pending, won, lost
  win_amount DECIMAL(15, 2),                  -- Số tiền thắng (nếu có)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_draw_date ON bets(draw_date);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_province_id ON bets(province_id);

-- Bảng transactions - lưu thông tin giao dịch
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(20) NOT NULL,                  -- deposit, withdrawal, bet, win
  status VARCHAR(20) NOT NULL,                -- pending, completed, failed
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_bet_id ON transactions(bet_id);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bảng crawler_config - lưu cấu hình crawling
CREATE TABLE crawler_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN DEFAULT TRUE,
  schedule JSONB DEFAULT '{"hour": 18, "minute": 30}',
  regions TEXT[] DEFAULT ARRAY['mien-bac', 'mien-trung', 'mien-nam'],
  retry_count INTEGER DEFAULT 3,
  delay_between_requests INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng crawler_logs - lưu log các lần crawl
CREATE TABLE crawler_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TIME WITHOUT TIME ZONE NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('auto', 'manual')),
  region VARCHAR(20) NOT NULL CHECK (region IN ('mien-bac', 'mien-trung', 'mien-nam')),
  status VARCHAR(10) NOT NULL CHECK (status IN ('success', 'error')),
  result_count INTEGER,
  error TEXT,
  result JSONB,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho các trường thường được query
CREATE INDEX idx_crawler_logs_date ON crawler_logs(date);
CREATE INDEX idx_crawler_logs_region ON crawler_logs(region);
CREATE INDEX idx_crawler_logs_status ON crawler_logs(status);
CREATE INDEX idx_crawler_logs_type ON crawler_logs(type);


-- Relationships
ALTER TABLE bets
ADD CONSTRAINT bets_province_id_fkey 
FOREIGN KEY (province_id) 
REFERENCES provinces (province_id);

-- Thêm trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crawler_config_updated_at
  BEFORE UPDATE ON crawler_config
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_crawler_logs_updated_at
  BEFORE UPDATE ON crawler_logs
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Đảm bảo RLS được bật cho tất cả bảng (thường đã được bật mặc định trong Supabase)
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho bảng provinces (cho phép tất cả)
CREATE POLICY "Public Access Provinces" ON provinces
    USING (true)
    WITH CHECK (true);

-- Tạo policy cho bảng rules (cho phép tất cả)
CREATE POLICY "Public Access Rules" ON rules
    USING (true)
    WITH CHECK (true);

-- Tạo policy cho bảng users (cho phép tất cả)
CREATE POLICY "Public Access Users" ON users
    USING (true)
    WITH CHECK (true);

-- Tạo policy cho bảng results (cho phép tất cả)
CREATE POLICY "Public Access Results" ON results
    USING (true)
    WITH CHECK (true);

-- Tạo policy cho bảng bets (cho phép tất cả)
CREATE POLICY "Public Access Bets" ON bets
    USING (true)
    WITH CHECK (true);

-- Tạo policy cho bảng transactions (cho phép tất cả)
CREATE POLICY "Public Access Transactions" ON transactions
    USING (true)
    WITH CHECK (true);

-- Bật RLS cho các bảng crawler
ALTER TABLE crawler_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawler_logs ENABLE ROW LEVEL SECURITY;

-- Policies cho bảng crawler_config
-- Policy đọc cấu hình (ai cũng có thể đọc)
CREATE POLICY "Public Read Crawler Config" ON crawler_config
    FOR SELECT
    USING (true);

-- Policy chỉ admin có thể thêm/sửa/xóa cấu hình
-- Trong môi trường demo, cho phép tất cả người dùng cập nhật
CREATE POLICY "Public Mutation Crawler Config" ON crawler_config
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Policies cho bảng crawler_logs
-- Policy đọc logs (ai cũng có thể đọc)
CREATE POLICY "Public Read Crawler Logs" ON crawler_logs
    FOR SELECT
    USING (true);

-- Policy thêm logs (cho phép API service thêm logs)
-- Trong môi trường demo, cho phép tất cả người dùng thêm logs
CREATE POLICY "Public Insert Crawler Logs" ON crawler_logs
    FOR INSERT
    WITH CHECK (true);

-- Policy cập nhật logs (chỉ admin có thể sửa)
-- Trong môi trường demo, cho phép tất cả người dùng cập nhật
CREATE POLICY "Public Update Crawler Logs" ON crawler_logs
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy xóa logs (chỉ admin có thể xóa)
-- Trong môi trường demo, cho phép tất cả người dùng xóa
CREATE POLICY "Public Delete Crawler Logs" ON crawler_logs
    FOR DELETE
    USING (true);

-- ========================================
-- Dữ liệu mẫu
-- ========================================

-- Đầu Đuôi (dd)
INSERT INTO rules (bet_type_id, name, description, digit_count, region_rules, variants, winning_ratio)
VALUES (
  'dd',
  'Đầu Đuôi',
  'Đặt cược dựa trên 2 chữ số (00-99)',
  2,
  '{
    "M1": {
      "betMultipliers": {"dd": 2, "dau": 1, "duoi": 1},
      "combinationCount": {"dd": 2, "dau": 1, "duoi": 1},
      "winningRules": {"dau": "Khớp với số ở giải 8", "duoi": "Khớp với 2 số cuối của giải Đặc Biệt"}
    },
    "M2": {
      "betMultipliers": {"dd": 5, "dau": 4, "duoi": 1},
      "combinationCount": {"dd": 5, "dau": 4, "duoi": 1},
      "winningRules": {"dau": "Khớp với số ở giải 7", "duoi": "Khớp với 2 số cuối của giải Đặc Biệt"}
    }
  }',
  '[
    {"id": "dd", "name": "Đầu Đuôi", "description": "Đặt cược cả đầu và đuôi"},
    {"id": "dau", "name": "Chỉ Đầu", "description": "Đặt cược chỉ ở đầu"},
    {"id": "duoi", "name": "Chỉ Đuôi", "description": "Đặt cược chỉ ở đuôi"}
  ]',
  '75'
);

-- Xỉu Chủ (xc)
INSERT INTO rules (bet_type_id, name, description, digit_count, region_rules, variants, winning_ratio)
VALUES (
  'xc',
  'Xỉu Chủ',
  'Đặt cược dựa trên 3 chữ số (000-999)',
  3,
  '{
    "M1": {
      "betMultipliers": {"xc": 2, "dau": 1, "duoi": 1},
      "combinationCount": {"xc": 2, "dau": 1, "duoi": 1},
      "winningRules": {"dau": "Khớp với số ở giải 7", "duoi": "Khớp với 3 số cuối của giải Đặc Biệt"}
    },
    "M2": {
      "betMultipliers": {"xc": 4, "dau": 3, "duoi": 1},
      "combinationCount": {"xc": 4, "dau": 3, "duoi": 1},
      "winningRules": {"dau": "Khớp với số ở giải 6", "duoi": "Khớp với 3 số cuối của giải Đặc Biệt"}
    }
  }',
  '[
    {"id": "xc", "name": "Xỉu Chủ Toàn Phần", "description": "Đặt cược cả đầu và đuôi"},
    {"id": "dau", "name": "Chỉ Đầu", "description": "Đặt cược chỉ ở đầu"},
    {"id": "duoi", "name": "Chỉ Đuôi", "description": "Đặt cược chỉ ở đuôi"}
  ]',
  '650'
);

-- Bao Lô N (b2, b3, b4)
INSERT INTO rules (bet_type_id, name, description, region_rules, variants, winning_ratio)
VALUES (
  'bao_lo',
  'Bao Lô N',
  'Đặt cược với N chữ số (N = 2, 3 hoặc 4)',
  '{
    "M1": {
      "betMultipliers": {"b2": 18, "b3": 17, "b4": 16},
      "combinationCount": {"b2": 18, "b3": 17, "b4": 16},
      "winningRules": "Số cược khớp với N số cuối của bất kỳ lô nào trong các giải"
    },
    "M2": {
      "betMultipliers": {"b2": 27, "b3": 23, "b4": 20},
      "combinationCount": {"b2": 27, "b3": 23, "b4": 20},
      "winningRules": "Số cược khớp với N số cuối của bất kỳ lô nào trong các giải"
    }
  }',
  '[
    {"id": "b2", "name": "Bao Lô 2", "digitCount": 2, "description": "Đặt cược với 2 chữ số"},
    {"id": "b3", "name": "Bao Lô 3", "digitCount": 3, "description": "Đặt cược với 3 chữ số"},
    {"id": "b4", "name": "Bao Lô 4", "digitCount": 4, "description": "Đặt cược với 4 chữ số"}
  ]',
  '{"b2": 75, "b3": 650, "b4": 5500}'
);

-- Bao 7 Lô (b7l)
INSERT INTO rules (bet_type_id, name, description, region_rules, variants, winning_ratio)
VALUES (
  'b7l',
  'Bao 7 Lô',
  'Tập hợp con của bao lô, áp dụng cho 7 lô nhất định ở M1',
  '{
    "M1": {
      "betMultipliers": {"b7l2": 7, "b7l3": 7, "b7l4": 7},
      "combinationCount": 7,
      "winningRules": "Số cược khớp với N số cuối của 7 lô đặc biệt (giải tám, giải bảy, giải sáu, giải năm, giải đặc biệt)"
    }
  }',
  '[
    {"id": "b7l2", "name": "Bao 7 Lô (2 chữ số)", "digitCount": 2, "description": "Đặt cược với 2 chữ số"},
    {"id": "b7l3", "name": "Bao 7 Lô (3 chữ số)", "digitCount": 3, "description": "Đặt cược với 3 chữ số"},
    {"id": "b7l4", "name": "Bao 7 Lô (4 chữ số)", "digitCount": 4, "description": "Đặt cược với 4 chữ số"}
  ]',
  '{"b7l2": 75, "b7l3": 650, "b7l4": 5500}'
);

-- Bao 8 Lô (b8l)
INSERT INTO rules (bet_type_id, name, description, region_rules, variants, winning_ratio)
VALUES (
  'b8l',
  'Bao 8 Lô',
  'Tập hợp con của bao lô, áp dụng cho 8 lô nhất định ở M2',
  '{
    "M2": {
      "betMultipliers": {"b8l2": 8, "b8l3": 8, "b8l4": 8},
      "combinationCount": 8,
      "winningRules": "Số cược khớp với N số cuối của 8 lô đặc biệt (giải đặc biệt, giải bảy, giải sáu, giải năm, giải tư, giải ba)"
    }
  }',
  '[
    {"id": "b8l2", "name": "Bao 8 Lô (2 chữ số)", "digitCount": 2, "description": "Đặt cược với 2 chữ số"},
    {"id": "b8l3", "name": "Bao 8 Lô (3 chữ số)", "digitCount": 3, "description": "Đặt cược với 3 chữ số"},
    {"id": "b8l4", "name": "Bao 8 Lô (4 chữ số)", "digitCount": 4, "description": "Đặt cược với 4 chữ số"}
  ]',
  '{"b8l2": 75, "b8l3": 650, "b8l4": 5500}'
);

-- Nhất To (nt)
INSERT INTO rules (bet_type_id, name, description, digit_count, region_rules, winning_ratio)
VALUES (
  'nt',
  'Nhất To',
  'Đặt cược dựa trên 2 số cuối của giải Nhất',
  2,
  '{
    "M2": {
      "betMultipliers": 1,
      "combinationCount": 1,
      "winningRules": "Số cược khớp với 2 số cuối của giải Nhất"
    }
  }',
  '75'
);

-- Xiên (x)
INSERT INTO rules (bet_type_id, name, description, digit_count, region_rules, variants, winning_ratio)
VALUES (
  'xien',
  'Xiên',
  'Đặt cược với nhiều cặp số 2 chữ số',
  2,
  '{
    "M2": {
      "betMultipliers": 27,
      "combinationCount": 27,
      "winningRules": "Tất cả các số được chọn phải xuất hiện trong kết quả (2 số cuối của các lô)"
    }
  }',
  '[
    {"id": "x2", "name": "Xiên 2", "description": "Chọn 2 cặp số", "numberCount": 2},
    {"id": "x3", "name": "Xiên 3", "description": "Chọn 3 cặp số", "numberCount": 3},
    {"id": "x4", "name": "Xiên 4", "description": "Chọn 4 cặp số", "numberCount": 4}
  ]',
  '{"x2": 75, "x3": 40, "x4": 250}'
);

-- Đá (da)
INSERT INTO rules (bet_type_id, name, description, digit_count, region_rules, variants, winning_ratio)
VALUES (
  'da',
  'Đá',
  'Đặt cược với nhiều cặp số, có nhiều trường hợp trúng',
  2,
  '{
    "M1": {
      "betMultipliers": {"da2": 1, "da3": 3, "da4": 6, "da5": 10},
      "combinationCount": {"da2": 1, "da3": 3, "da4": 6, "da5": 10},
      "winningRules": "Nhiều trường hợp trúng thưởng khác nhau dựa trên số lượng số trúng và số lần xuất hiện"
    }
  }',
  '[
    {"id": "da2", "name": "Đá 2", "description": "Chọn 2 cặp số", "numberCount": 2},
    {"id": "da3", "name": "Đá 3", "description": "Chọn 3 cặp số", "numberCount": 3},
    {"id": "da4", "name": "Đá 4", "description": "Chọn 4 cặp số", "numberCount": 4},
    {"id": "da5", "name": "Đá 5", "description": "Chọn 5 cặp số", "numberCount": 5}
  ]',
  '{
    "da2": {"2_numbers": 12.5},
    "da3": {
      "3_numbers": 37.5,
      "3_numbers_1_number_3_times": 112.5,
      "3_numbers_1_number_2_times": 75,
      "2_numbers_1_number_2_times": 43.75,
      "2_numbers_no_doubles": 25
    },
    "da4": {
      "4_numbers": 250,
      "3_numbers_1_number_3_times": 750,
      "3_numbers_1_number_2_times": 500,
      "2_numbers_2_number_2_times": 150,
      "2_numbers_1_number_2_times": 75
    },
    "da5": {
      "5_numbers": 1250,
      "4_numbers_1_number_3_times": 3750,
      "4_numbers_1_number_2_times": 2500,
      "3_numbers_2_number_2_times": 750,
      "3_numbers_1_number_2_times": 500
    }
  }'
);

-- Miền Bắc
INSERT INTO provinces (province_id, name, region, region_type, draw_days)
VALUES ('hanoi', 'Hà Nội', 'mien-bac', 'M2', ARRAY['thu-hai', 'thu-nam']);

INSERT INTO provinces (province_id, name, region, region_type, draw_days)
VALUES ('quangninh', 'Quảng Ninh', 'mien-bac', 'M2', ARRAY['thu-ba']);

INSERT INTO provinces (province_id, name, region, region_type, draw_days)
VALUES ('bacninh', 'Bắc Ninh', 'mien-bac', 'M2', ARRAY['thu-tu']);

INSERT INTO provinces (province_id, name, region, region_type, draw_days)
VALUES ('haiphong', 'Hải Phòng', 'mien-bac', 'M2', ARRAY['thu-sau']);

INSERT INTO provinces (province_id, name, region, region_type, draw_days)
VALUES ('namdinh', 'Nam Định', 'mien-bac', 'M2', ARRAY['thu-bay']);

INSERT INTO provinces (province_id, name, region, region_type, draw_days)
VALUES ('thaibinh', 'Thái Bình', 'mien-bac', 'M2', ARRAY['chu-nhat']);

-- Miền Trung
INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('phuyen', 'Phú Yên', 'XSPY', 'mien-trung', 'M1', ARRAY['thu-hai']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('thuathienhue', 'Thừa T. Huế', 'XSTTH', 'mien-trung', 'M1', ARRAY['thu-hai', 'chu-nhat']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('daklak', 'Đắk Lắk', 'XSDLK', 'mien-trung', 'M1', ARRAY['thu-ba']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('quangnam', 'Quảng Nam', 'XSQNM', 'mien-trung', 'M1', ARRAY['thu-ba']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('danang', 'Đà Nẵng', 'XSDNG', 'mien-trung', 'M1', ARRAY['thu-tu', 'thu-bay']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('khanhhoa', 'Khánh Hòa', 'XSKH', 'mien-trung', 'M1', ARRAY['thu-tu', 'chu-nhat']);

-- Miền Nam
INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('tphcm', 'TP. HCM', 'XSHCM', 'mien-nam', 'M1', ARRAY['thu-hai', 'thu-bay']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('dongthap', 'Đồng Tháp', 'XSDT', 'mien-nam', 'M1', ARRAY['thu-hai']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('camau', 'Cà Mau', 'XSCM', 'mien-nam', 'M1', ARRAY['thu-hai']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('bentre', 'Bến Tre', 'XSBTR', 'mien-nam', 'M1', ARRAY['thu-ba']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('vungtau', 'Vũng Tàu', 'XSVT', 'mien-nam', 'M1', ARRAY['thu-ba']);

INSERT INTO provinces (province_id, name, code, region, region_type, draw_days)
VALUES ('baclieu', 'Bạc Liêu', 'XSBL', 'mien-nam', 'M1', ARRAY['thu-ba']);

-- Thêm các tỉnh miền Trung còn thiếu
INSERT INTO provinces (province_id, name, code, region, region_type, draw_days, is_active)
VALUES 
  ('gialai', 'Gia Lai', 'XSGL', 'mien-trung', 'M1', ARRAY['thu-sau'], true),
  ('ninhthuan', 'Ninh Thuận', 'XSNT', 'mien-trung', 'M1', ARRAY['thu-sau'], true),
  ('quangtri', 'Quảng Trị', 'XSQT', 'mien-trung', 'M1', ARRAY['thu-nam'], true),
  ('quangbinh', 'Quảng Bình', 'XSQB', 'mien-trung', 'M1', ARRAY['thu-nam'], true),
  ('binhdinh', 'Bình Định', 'XSBDI', 'mien-trung', 'M1', ARRAY['thu-nam'], true),
  ('kontum', 'Kon Tum', 'XSKT', 'mien-trung', 'M1', ARRAY['chu-nhat'], true),
  ('daknong', 'Đắk Nông', 'XSDNO', 'mien-trung', 'M1', ARRAY['thu-bay'], true),
  ('quangngai', 'Quảng Ngãi', 'XSQNG', 'mien-trung', 'M1', ARRAY['thu-bay'], true);

-- Thêm các tỉnh miền Nam còn thiếu
INSERT INTO provinces (province_id, name, code, region, region_type, draw_days, is_active)
VALUES 
  ('vinhlong', 'Vĩnh Long', 'XSVL', 'mien-nam', 'M1', ARRAY['thu-sau'], true),
  ('binhduong', 'Bình Dương', 'XSBD', 'mien-nam', 'M1', ARRAY['thu-sau'], true),
  ('travinh', 'Trà Vinh', 'XSTV', 'mien-nam', 'M1', ARRAY['thu-sau'], true),
  ('dongnai', 'Đồng Nai', 'XSDN', 'mien-nam', 'M1', ARRAY['thu-tu'], true),
  ('cantho', 'Cần Thơ', 'XSCT', 'mien-nam', 'M1', ARRAY['thu-tu'], true),
  ('soctrang', 'Sóc Trăng', 'XSST', 'mien-nam', 'M1', ARRAY['thu-tu'], true),
  ('tayninh', 'Tây Ninh', 'XSTN', 'mien-nam', 'M1', ARRAY['thu-nam'], true),
  ('angiang', 'An Giang', 'XSAG', 'mien-nam', 'M1', ARRAY['thu-nam'], true),
  ('binhthuan', 'Bình Thuận', 'XSBTH', 'mien-nam', 'M1', ARRAY['thu-nam'], true),
  ('longan', 'Long An', 'XSLA', 'mien-nam', 'M1', ARRAY['thu-bay'], true),
  ('binhphuoc', 'Bình Phước', 'XSBP', 'mien-nam', 'M1', ARRAY['thu-bay'], true),
  ('haugiang', 'Hậu Giang', 'XSHG', 'mien-nam', 'M1', ARRAY['thu-bay'], true),
  ('tiengiang', 'Tiền Giang', 'XSTG', 'mien-nam', 'M1', ARRAY['chu-nhat'], true),
  ('kiengiang', 'Kiên Giang', 'XSKG', 'mien-nam', 'M1', ARRAY['chu-nhat'], true),
  ('dalat', 'Đà Lạt', 'XSDL', 'mien-nam', 'M1', ARRAY['chu-nhat'], true);

-- Kết quả Miền Bắc ngày 2025-03-21
INSERT INTO results (
  province_id, date, day_of_week,
  special_prize, first_prize, second_prize, third_prize,
  fourth_prize, fifth_prize, sixth_prize, seventh_prize
)
VALUES (
  'haiphong', '2025-03-21', 'Thứ sáu',
  ARRAY['04036'], ARRAY['71107'],
  ARRAY['92363', '65009'],
  ARRAY['22586', '01720', '39431', '58336', '83992', '46715'],
  ARRAY['1103', '2398', '8353', '3891'],
  ARRAY['3539', '5853', '6367', '8610', '5836', '4415'],
  ARRAY['522', '377', '348'],
  ARRAY['84', '80', '74', '44']
);

-- Kết quả Miền Trung ngày 2025-03-21 - Gia Lai
INSERT INTO results (
  province_id, date, day_of_week,
  special_prize, first_prize, second_prize, third_prize,
  fourth_prize, fifth_prize, sixth_prize, seventh_prize, eighth_prize
)
VALUES (
  'gialai', '2025-03-21', 'Thứ sáu',
  ARRAY['821813'], ARRAY['85011'],
  ARRAY['02380'],
  ARRAY['37028', '21958'],
  ARRAY['35266', '38271', '57378', '83511', '67515', '91066', '48214'],
  ARRAY['8629'],
  ARRAY['6974', '4645', '0656'],
  ARRAY['755'],
  ARRAY['96']
);

-- Kết quả Miền Nam ngày 2025-03-21 - Vĩnh Long
INSERT INTO results (
  province_id, date, day_of_week,
  special_prize, first_prize, second_prize, third_prize,
  fourth_prize, fifth_prize, sixth_prize, seventh_prize, eighth_prize
)
VALUES (
  'vinhlong', '2025-03-21', 'Thứ sáu',
  ARRAY['884933'], ARRAY['47822'],
  ARRAY['52562'],
  ARRAY['02697', '41921'],
  ARRAY['43112', '00396', '40790', '06774', '13233', '01640', '92891'],
  ARRAY['8740'],
  ARRAY['2134', '0135', '2862'],
  ARRAY['268'],
  ARRAY['43']
);

-- Thêm một số người dùng mẫu
INSERT INTO users (email, name, phone, balance)
VALUES 
  ('user1@example.com', 'Nguyễn Văn A', '0901234567', 1000000),
  ('user2@example.com', 'Trần Thị B', '0912345678', 2000000),
  ('user3@example.com', 'Lê Văn C', '0923456789', 1500000);

-- Thêm một số cược mẫu
INSERT INTO bets (
  user_id, bet_date, draw_date, region_type, province_id,
  bet_type, bet_variant, numbers, selection_method,
  denomination, total_amount, potential_win_amount, status
)
VALUES (
  (SELECT id FROM users WHERE email = 'user1@example.com'),
  '2025-03-20', '2025-03-21', 'M2', 'haiphong',
  'dd', 'dd', ARRAY['36', '84'], 'manual',
  10000, 50000, 750000, 'won'
);

INSERT INTO bets (
  user_id, bet_date, draw_date, region_type, province_id,
  bet_type, bet_variant, numbers, selection_method,
  denomination, total_amount, potential_win_amount, status
)
VALUES (
  (SELECT id FROM users WHERE email = 'user2@example.com'),
  '2025-03-20', '2025-03-21', 'M1', 'vinhlong',
  'bao_lo', 'b2', ARRAY['33', '43'], 'manual',
  20000, 720000, 1500000, 'pending'
);

-- Thêm giao dịch mẫu
INSERT INTO transactions (
  user_id, bet_id, amount, type, status, description
)
VALUES (
  (SELECT id FROM users WHERE email = 'user1@example.com'),
  (SELECT id FROM bets WHERE user_id = (SELECT id FROM users WHERE email = 'user1@example.com') LIMIT 1),
  50000, 'bet', 'completed', 'Đặt cược Đầu Đuôi ngày 2025-03-21'
);