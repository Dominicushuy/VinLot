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

// Kiểm tra kết quả cược Đầu Đuôi
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

    if (dauNumbers) {
      for (const number of bet.numbers) {
        if (dauNumbers.includes(number)) {
          matches++;
        }
      }
    }
  }

  if (variant === "dd" || variant === "duoi") {
    // Kiểm tra đuôi
    if (result.special_prize && result.special_prize.length > 0) {
      const dbPrize = result.special_prize[0];
      const duoiNumber = dbPrize.slice(-2); // 2 số cuối của giải đặc biệt

      for (const number of bet.numbers) {
        if (number === duoiNumber) {
          matches++;
        }
      }
    }
  }

  // Tính tiền thắng dựa trên số lần khớp
  let ratio = typeof winningRatio === "number" ? winningRatio : 75; // Mặc định 75
  return matches * bet.denomination * ratio;
}

// Kiểm tra kết quả cược Xỉu Chủ
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

    if (dauNumbers) {
      for (const number of bet.numbers) {
        if (dauNumbers.includes(number)) {
          matches++;
        }
      }
    }
  }

  if (variant === "xc" || variant === "duoi") {
    // Kiểm tra đuôi
    if (result.special_prize && result.special_prize.length > 0) {
      const dbPrize = result.special_prize[0];
      const duoiNumber = dbPrize.slice(-3); // 3 số cuối của giải đặc biệt

      for (const number of bet.numbers) {
        if (number === duoiNumber) {
          matches++;
        }
      }
    }
  }

  // Tính tiền thắng dựa trên số lần khớp
  const ratio = typeof winningRatio === "number" ? winningRatio : 650; // Mặc định 650
  return matches * bet.denomination * ratio;
}

// Kiểm tra kết quả cược Bao Lô
function checkBaoLoResult(bet: any, result: any, winningRatio: any): number {
  // Kiểm tra Bao Lô
  const variant = bet.bet_variant || "b2";
  let digitCount = 2;

  // Xác định số chữ số dựa vào biến thể
  if (variant === "b3") digitCount = 3;
  else if (variant === "b4") digitCount = 4;

  // Lấy tất cả các prize để kiểm tra
  const allPrizes = [
    ...(result.special_prize || []),
    ...(result.first_prize || []),
    ...(result.second_prize || []),
    ...(result.third_prize || []),
    ...(result.fourth_prize || []),
    ...(result.fifth_prize || []),
    ...(result.sixth_prize || []),
    ...(result.seventh_prize || []),
  ];

  // Nếu có giải 8 (M1), thêm vào
  if (result.eighth_prize) {
    allPrizes.push(...result.eighth_prize);
  }

  // Đếm số lần khớp
  let matches = 0;

  for (const number of bet.numbers) {
    for (const prize of allPrizes) {
      if (prize && prize.slice(-number.length) === number) {
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

// Kiểm tra kết quả cược Bao 7 Lô
function checkBao7LoResult(bet: any, result: any, winningRatio: any): number {
  // Xác định số chữ số dựa vào biến thể (b7l2, b7l3, b7l4)
  const variant = bet.bet_variant || "b7l2";

  // 7 lô đặc biệt cho M1: giải tám, giải bảy, giải sáu, giải năm, giải đặc biệt
  const specialPrizes = [
    ...(result.eighth_prize || []),
    ...(result.seventh_prize || []),
    ...(result.sixth_prize || []),
    ...(result.fifth_prize || []),
    ...(result.special_prize || []),
  ];

  // Đếm số lần khớp
  let matches = 0;

  for (const number of bet.numbers) {
    for (const prize of specialPrizes) {
      if (prize && prize.slice(-number.length) === number) {
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
    ratio = variant === "b7l2" ? 75 : variant === "b7l3" ? 650 : 5500;
  }

  return matches * bet.denomination * ratio;
}

// Kiểm tra kết quả cược Bao 8 Lô
function checkBao8LoResult(bet: any, result: any, winningRatio: any): number {
  // Xác định số chữ số dựa vào biến thể (b8l2, b8l3, b8l4)
  const variant = bet.bet_variant || "b8l2";

  // 8 lô đặc biệt cho M2: giải đặc biệt, giải bảy, giải sáu, giải năm, giải tư, giải ba
  const specialPrizes = [
    ...(result.special_prize || []),
    ...(result.seventh_prize || []),
    ...(result.sixth_prize || []),
    ...(result.fifth_prize || []),
    ...(result.fourth_prize || []),
    ...(result.third_prize || []),
  ];

  // Đếm số lần khớp
  let matches = 0;

  for (const number of bet.numbers) {
    for (const prize of specialPrizes) {
      if (prize && prize.slice(-number.length) === number) {
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
    ratio = variant === "b8l2" ? 75 : variant === "b8l3" ? 650 : 5500;
  }

  return matches * bet.denomination * ratio;
}

// Kiểm tra kết quả cược Nhất To
function checkNhatToResult(bet: any, result: any, winningRatio: any): number {
  // Kiểm tra Nhất To - 2 số cuối của giải Nhất
  if (!result.first_prize || result.first_prize.length === 0) {
    return 0;
  }

  const firstPrize = result.first_prize[0];
  const lastTwoDigits = firstPrize.slice(-2);

  let matches = 0;
  for (const number of bet.numbers) {
    if (number === lastTwoDigits) {
      matches++;
    }
  }

  const ratio = typeof winningRatio === "number" ? winningRatio : 75;
  return matches * bet.denomination * ratio;
}

// Kiểm tra kết quả cược Xiên
function checkXienResult(bet: any, result: any, winningRatio: any): number {
  // Xác định biến thể Xiên (x2, x3, x4)
  const variant = bet.bet_variant || "x2";

  // Lấy tất cả các số 2 chữ số từ các lô
  const allLastTwoDigits: string[] = [];

  // Lấy tất cả các prize trong result
  const allPrizes = [
    ...(result.special_prize || []),
    ...(result.first_prize || []),
    ...(result.second_prize || []),
    ...(result.third_prize || []),
    ...(result.fourth_prize || []),
    ...(result.fifth_prize || []),
    ...(result.sixth_prize || []),
    ...(result.seventh_prize || []),
  ];

  // Lấy 2 số cuối của tất cả các prize
  for (const prize of allPrizes) {
    if (prize) {
      allLastTwoDigits.push(prize.slice(-2));
    }
  }

  // Kiểm tra xem TẤT CẢ các số cược có trong kết quả không
  const allNumbersMatched = bet.numbers.every((number: string) =>
    allLastTwoDigits.includes(number)
  );

  // Với Xiên, chỉ thắng khi TẤT CẢ các số đều trúng
  if (!allNumbersMatched) {
    return 0;
  }

  // Tính tiền thắng
  let ratio;
  if (typeof winningRatio === "object") {
    ratio = winningRatio[variant] || 0;
  } else {
    // Mặc định nếu không tìm thấy
    ratio = variant === "x2" ? 75 : variant === "x3" ? 40 : 250;
  }

  return bet.denomination * ratio;
}

function checkDaResult(bet: any, result: any, winningRatio: any): number {
  // Xác định biến thể Đá (da2, da3, da4, da5)
  const variant = bet.bet_variant || "da2";

  // Lấy tất cả các số 2 chữ số từ các lô
  const allLastTwoDigits: string[] = [];

  // Lấy tất cả các prize trong result
  const allPrizes = [
    ...(result.special_prize || []),
    ...(result.first_prize || []),
    ...(result.second_prize || []),
    ...(result.third_prize || []),
    ...(result.fourth_prize || []),
    ...(result.fifth_prize || []),
    ...(result.sixth_prize || []),
    ...(result.seventh_prize || []),
    ...(result.eighth_prize || []),
  ];

  // Lấy 2 số cuối của tất cả các prize
  for (const prize of allPrizes) {
    if (prize) {
      allLastTwoDigits.push(prize.slice(-2));
    }
  }

  console.log(`Đối soát cược Đá ${variant} với ${bet.numbers.length} số`);
  console.log(`Tìm thấy ${allLastTwoDigits.length} số 2 chữ số từ kết quả`);

  // Đếm số lần xuất hiện của mỗi số trong kết quả
  const matchCounts: Record<string, number> = {};
  for (const number of bet.numbers) {
    matchCounts[number] = 0;
    for (const lastTwo of allLastTwoDigits) {
      if (number === lastTwo) {
        matchCounts[number]++;
      }
    }
  }

  console.log("Match counts:", matchCounts);

  // Đếm số lượng số trúng (ít nhất 1 lần)
  const matchedNumbers = Object.keys(matchCounts).filter(
    (num) => matchCounts[num] > 0
  );

  console.log(`Số lượng số trúng: ${matchedNumbers.length}`);

  // Nếu không có số nào trúng
  if (matchedNumbers.length === 0) {
    return 0;
  }

  // Phân tích kết quả để xác định trường hợp trúng
  let winCase = "";

  // Tùy thuộc vào biến thể và kết quả trúng, xác định trường hợp trúng
  switch (variant) {
    case "da2":
      if (matchedNumbers.length === 2) {
        winCase = "2_numbers";
      }
      break;

    case "da3":
      if (matchedNumbers.length === 3) {
        // Kiểm tra có số nào xuất hiện 3 lần
        const hasTriple = Object.values(matchCounts).some(
          (count) => count >= 3
        );
        if (hasTriple) {
          winCase = "3_numbers_1_number_3_times";
        } else {
          // Kiểm tra có số nào xuất hiện 2 lần
          const hasDouble = Object.values(matchCounts).some(
            (count) => count >= 2
          );
          if (hasDouble) {
            winCase = "3_numbers_1_number_2_times";
          } else {
            winCase = "3_numbers";
          }
        }
      } else if (matchedNumbers.length === 2) {
        // Kiểm tra có số nào xuất hiện 2 lần
        const hasDouble = Object.values(matchCounts).some(
          (count) => count >= 2
        );
        if (hasDouble) {
          winCase = "2_numbers_1_number_2_times";
        } else {
          winCase = "2_numbers_no_doubles";
        }
      }
      break;

    case "da4":
      if (matchedNumbers.length === 4) {
        winCase = "4_numbers";
      } else if (matchedNumbers.length === 3) {
        // Kiểm tra có số nào xuất hiện 3 lần
        const hasTriple = Object.values(matchCounts).some(
          (count) => count >= 3
        );
        if (hasTriple) {
          winCase = "3_numbers_1_number_3_times";
        } else {
          // Kiểm tra có số nào xuất hiện 2 lần
          const hasDouble = Object.values(matchCounts).some(
            (count) => count >= 2
          );
          if (hasDouble) {
            winCase = "3_numbers_1_number_2_times";
          }
        }
      } else if (matchedNumbers.length === 2) {
        // Đếm số lượng số xuất hiện 2 lần
        const doubleCount = Object.values(matchCounts).filter(
          (count) => count >= 2
        ).length;
        if (doubleCount >= 2) {
          winCase = "2_numbers_2_number_2_times";
        } else if (doubleCount === 1) {
          winCase = "2_numbers_1_number_2_times";
        }
      }
      break;

    case "da5":
      if (matchedNumbers.length === 5) {
        winCase = "5_numbers";
      } else if (matchedNumbers.length === 4) {
        // Kiểm tra có số nào xuất hiện 3 lần
        const hasTriple = Object.values(matchCounts).some(
          (count) => count >= 3
        );
        if (hasTriple) {
          winCase = "4_numbers_1_number_3_times";
        } else {
          // Kiểm tra có số nào xuất hiện 2 lần
          const hasDouble = Object.values(matchCounts).some(
            (count) => count >= 2
          );
          if (hasDouble) {
            winCase = "4_numbers_1_number_2_times";
          }
        }
      } else if (matchedNumbers.length === 3) {
        // Đếm số lượng số xuất hiện 2 lần
        const doubleCount = Object.values(matchCounts).filter(
          (count) => count >= 2
        ).length;
        if (doubleCount >= 2) {
          winCase = "3_numbers_2_number_2_times";
        } else if (doubleCount === 1) {
          winCase = "3_numbers_1_number_2_times";
        }
      }
      break;
  }

  console.log(`Trường hợp trúng: ${winCase}`);

  // Nếu không xác định được trường hợp trúng
  if (!winCase) {
    return 0;
  }

  // Tính tiền thắng
  let ratio = 0;
  if (typeof winningRatio === "object" && winningRatio[variant]) {
    if (typeof winningRatio[variant] === "object") {
      ratio = winningRatio[variant][winCase] || 0;
    } else {
      ratio = winningRatio[variant];
    }
  }

  console.log(`Tỷ lệ thưởng: ${ratio}`);
  return bet.denomination * ratio;
}
