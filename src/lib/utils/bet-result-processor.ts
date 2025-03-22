// src/lib/utils/bet-result-processor.ts
/**
 * Kiểm tra kết quả cược và tính số tiền thắng
 * @param bet Thông tin cược
 * @param result Kết quả xổ số
 * @param betType Loại cược
 * @returns Số tiền thắng (0 nếu thua)
 */
export function checkBetResult(bet: any, result: any, betType: any): number {
  // Parse dữ liệu JSONB
  const regionRules =
    typeof betType.region_rules === "string"
      ? JSON.parse(betType.region_rules)
      : betType.region_rules;

  const winningRatio =
    typeof betType.winning_ratio === "string"
      ? JSON.parse(betType.winning_ratio)
      : betType.winning_ratio;

  // Tùy theo loại cược, kiểm tra theo luật khác nhau
  let winAmount = 0;

  switch (bet.bet_type) {
    case "dd": // Đầu Đuôi
      winAmount = checkDauDuoiResult(bet, result, regionRules, winningRatio);
      break;

    case "xc": // Xỉu Chủ
      winAmount = checkXiuChuResult(bet, result, regionRules, winningRatio);
      break;

    case "bao_lo": // Bao Lô
      winAmount = checkBaoLoResult(bet, result, winningRatio);
      break;

    case "b7l": // Bao 7 Lô
      winAmount = checkBao7LoResult(bet, result, winningRatio);
      break;

    case "b8l": // Bao 8 Lô
      winAmount = checkBao8LoResult(bet, result, winningRatio);
      break;

    case "nt": // Nhất To
      winAmount = checkNhatToResult(bet, result, winningRatio);
      break;

    case "xien": // Xiên
      winAmount = checkXienResult(bet, result, winningRatio);
      break;

    case "da": // Đá
      winAmount = checkDaResult(bet, result, winningRatio);
      break;

    default:
      console.log(`Loại cược không được hỗ trợ: ${bet.bet_type}`);
  }

  return winAmount;
}

// Triển khai các hàm kiểm tra riêng cho từng loại cược
function checkDauDuoiResult(
  bet: any,
  result: any,
  regionRules: any,
  winningRatio: any
): number {
  let matches = 0;
  const variant = bet.bet_variant || "dd";

  // Kiểm tra theo từng biến thể
  if (variant === "dd" || variant === "dau") {
    // Kiểm tra đầu
    const dauNumbers =
      bet.region_type === "M1"
        ? result.eighth_prize // Giải 8 cho M1
        : result.seventh_prize; // Giải 7 cho M2

    for (const number of bet.numbers) {
      if (dauNumbers.includes(number)) {
        matches++;
      }
    }
  }

  if (variant === "dd" || variant === "duoi") {
    // Kiểm tra đuôi
    const dbPrize = result.special_prize[0];
    const duoiNumber = dbPrize.slice(-2); // 2 số cuối của giải đặc biệt

    for (const number of bet.numbers) {
      if (number === duoiNumber) {
        matches++;
      }
    }
  }

  // Tính tiền thắng dựa trên số lần khớp
  let ratio = typeof winningRatio === "number" ? winningRatio : 75; // Mặc định 75
  return matches * bet.denomination * ratio;
}

// Triển khai tương tự cho các loại cược khác
function checkXiuChuResult(
  bet: any,
  result: any,
  regionRules: any,
  winningRatio: any
): number {
  // Tương tự như Đầu Đuôi nhưng với 3 chữ số
  let matches = 0;
  const variant = bet.bet_variant || "xc";

  if (variant === "xc" || variant === "dau") {
    // Kiểm tra đầu
    const dauNumbers =
      bet.region_type === "M1"
        ? result.seventh_prize // Giải 7 cho M1
        : result.sixth_prize; // Giải 6 cho M2

    for (const number of bet.numbers) {
      if (dauNumbers.includes(number)) {
        matches++;
      }
    }
  }

  if (variant === "xc" || variant === "duoi") {
    // Kiểm tra đuôi
    const dbPrize = result.special_prize[0];
    const duoiNumber = dbPrize.slice(-3); // 3 số cuối của giải đặc biệt

    for (const number of bet.numbers) {
      if (number === duoiNumber) {
        matches++;
      }
    }
  }

  // Tính tiền thắng dựa trên số lần khớp
  let ratio = typeof winningRatio === "number" ? winningRatio : 650; // Mặc định 650
  return matches * bet.denomination * ratio;
}

function checkBaoLoResult(bet: any, result: any, winningRatio: any): number {
  // Kiểm tra Bao Lô
  const variant = bet.bet_variant || "b2";
  let digitCount = 2;

  // Xác định số chữ số dựa vào biến thể
  if (variant === "b3") digitCount = 3;
  else if (variant === "b4") digitCount = 4;

  // Lấy tất cả các prize để kiểm tra
  const allPrizes = [
    ...result.special_prize,
    ...result.first_prize,
    ...result.second_prize,
    ...result.third_prize,
    ...result.fourth_prize,
    ...result.fifth_prize,
    ...result.sixth_prize,
    ...result.seventh_prize,
  ];

  // Nếu có giải 8 (M1), thêm vào
  if (result.eighth_prize) {
    allPrizes.push(...result.eighth_prize);
  }

  // Đếm số lần khớp
  let matches = 0;

  for (const number of bet.numbers) {
    for (const prize of allPrizes) {
      if (prize.endsWith(number)) {
        matches++;
      }
    }
  }

  // Tính tiền thắng
  let ratio;
  if (typeof winningRatio === "object") {
    ratio = winningRatio[variant] || 75;
  } else {
    // Mặc định nếu không tìm thấy
    ratio = variant === "b2" ? 75 : variant === "b3" ? 650 : 5500;
  }

  return matches * bet.denomination * ratio;
}

// Tiếp tục triển khai cho các loại cược khác...
function checkBao7LoResult(bet: any, result: any, winningRatio: any): number {
  // Tương tự Bao Lô nhưng chỉ kiểm tra với 7 lô đặc biệt
  // TODO: Triển khai đầy đủ
  return 0;
}

function checkBao8LoResult(bet: any, result: any, winningRatio: any): number {
  // Tương tự Bao Lô nhưng chỉ kiểm tra với 8 lô đặc biệt
  // TODO: Triển khai đầy đủ
  return 0;
}

function checkNhatToResult(bet: any, result: any, winningRatio: any): number {
  // Kiểm tra Nhất To - 2 số cuối của giải Nhất
  const firstPrize = result.first_prize[0];
  const lastTwoDigits = firstPrize.slice(-2);

  let matches = 0;
  for (const number of bet.numbers) {
    if (number === lastTwoDigits) {
      matches++;
    }
  }

  let ratio = typeof winningRatio === "number" ? winningRatio : 75;
  return matches * bet.denomination * ratio;
}

function checkXienResult(bet: any, result: any, winningRatio: any): number {
  // TODO: Triển khai đầy đủ
  return 0;
}

function checkDaResult(bet: any, result: any, winningRatio: any): number {
  // TODO: Triển khai đầy đủ
  return 0;
}
