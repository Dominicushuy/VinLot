// src/lib/utils/bet-result-processor.ts
/**
 * Kiểm tra kết quả cược và tính số tiền thắng
 * @param bet Thông tin cược
 * @param result Kết quả xổ số
 * @param betType Loại cược
 * @returns Chi tiết kết quả trúng thưởng
 */
export function checkBetResult(
  bet: any,
  result: any,
  betType: any
): {
  winAmount: number;
  winningDetails: {
    winning_numbers: string[];
    details: Array<{
      number: string;
      prize_type: string;
      prize_name: string;
      description: string;
      win_amount: number;
    }>;
  } | null;
} {
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
  let winningNumbers: string[] = [];
  let details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  switch (bet.bet_type) {
    case "dd": // Đầu Đuôi
      const ddResult = checkDauDuoiResultDetailed(
        bet,
        result,
        regionRules,
        winningRatio
      );
      winAmount = ddResult.winAmount;
      winningNumbers = ddResult.winningNumbers;
      details = ddResult.details;
      break;

    case "xc": // Xỉu Chủ
      const xcResult = checkXiuChuResultDetailed(
        bet,
        result,
        regionRules,
        winningRatio
      );
      winAmount = xcResult.winAmount;
      winningNumbers = xcResult.winningNumbers;
      details = xcResult.details;
      break;

    case "bao_lo": // Bao Lô
      const blResult = checkBaoLoResultDetailed(bet, result, winningRatio);
      winAmount = blResult.winAmount;
      winningNumbers = blResult.winningNumbers;
      details = blResult.details;
      break;

    case "b7l": // Bao 7 Lô
      const b7lResult = checkBao7LoResultDetailed(bet, result, winningRatio);
      winAmount = b7lResult.winAmount;
      winningNumbers = b7lResult.winningNumbers;
      details = b7lResult.details;
      break;

    case "b8l": // Bao 8 Lô
      const b8lResult = checkBao8LoResultDetailed(bet, result, winningRatio);
      winAmount = b8lResult.winAmount;
      winningNumbers = b8lResult.winningNumbers;
      details = b8lResult.details;
      break;

    case "nt": // Nhất To
      const ntResult = checkNhatToResultDetailed(bet, result, winningRatio);
      winAmount = ntResult.winAmount;
      winningNumbers = ntResult.winningNumbers;
      details = ntResult.details;
      break;

    case "xien": // Xiên
      const xienResult = checkXienResultDetailed(bet, result, winningRatio);
      winAmount = xienResult.winAmount;
      winningNumbers = xienResult.winningNumbers;
      details = xienResult.details;
      break;

    case "da": // Đá
      const daResult = checkDaResultDetailed(bet, result, winningRatio);
      winAmount = daResult.winAmount;
      winningNumbers = daResult.winningNumbers;
      details = daResult.details;
      break;

    default:
      console.log(`Loại cược không được hỗ trợ: ${bet.bet_type}`);
  }

  // Trả về kết quả chi tiết nếu có trúng, nếu không trả về null
  return {
    winAmount,
    winningDetails:
      winAmount > 0 ? { winning_numbers: winningNumbers, details } : null,
  };
}

// Kiểm tra kết quả cược Đầu Đuôi với chi tiết
function checkDauDuoiResultDetailed(
  bet: any,
  result: any,
  regionRules: any,
  winningRatio: any
): {
  winAmount: number;
  winningNumbers: string[];
  details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }>;
} {
  let totalWinAmount = 0;
  const winningNumbers: string[] = [];
  const details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  const variant = bet.bet_variant || "dd";
  const ratio = typeof winningRatio === "number" ? winningRatio : 75; // Mặc định 75

  // Kiểm tra đầu
  if (variant === "dd" || variant === "dau") {
    const dauNumbers =
      bet.region_type === "M1"
        ? result.eighth_prize // Giải 8 cho M1
        : result.seventh_prize; // Giải 7 cho M2

    const prizeName = bet.region_type === "M1" ? "Giải 8" : "Giải 7";
    const prizeType =
      bet.region_type === "M1" ? "eighth_prize" : "seventh_prize";

    if (dauNumbers) {
      for (const number of bet.numbers) {
        if (dauNumbers.includes(number)) {
          winningNumbers.push(number);
          const winAmount = bet.denomination * ratio;
          totalWinAmount += winAmount;

          details.push({
            number,
            prize_type: prizeType,
            prize_name: prizeName,
            description: `Trùng với số ở ${prizeName}`,
            win_amount: winAmount,
          });
        }
      }
    }
  }

  // Kiểm tra đuôi
  if (variant === "dd" || variant === "duoi") {
    if (result.special_prize && result.special_prize.length > 0) {
      const dbPrize = result.special_prize[0];
      const duoiNumber = dbPrize.slice(-2); // 2 số cuối của giải đặc biệt

      for (const number of bet.numbers) {
        if (number === duoiNumber) {
          winningNumbers.push(number);
          const winAmount = bet.denomination * ratio;
          totalWinAmount += winAmount;

          details.push({
            number,
            prize_type: "special_prize",
            prize_name: "Giải đặc biệt",
            description: "Trùng với 2 số cuối của giải đặc biệt",
            win_amount: winAmount,
          });
        }
      }
    }
  }

  return {
    winAmount: totalWinAmount,
    winningNumbers,
    details,
  };
}

// Kiểm tra kết quả cược Xỉu Chủ với chi tiết
function checkXiuChuResultDetailed(
  bet: any,
  result: any,
  regionRules: any,
  winningRatio: any
): {
  winAmount: number;
  winningNumbers: string[];
  details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }>;
} {
  let totalWinAmount = 0;
  const winningNumbers: string[] = [];
  const details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  const variant = bet.bet_variant || "xc";
  const ratio = typeof winningRatio === "number" ? winningRatio : 650; // Mặc định 650

  // Kiểm tra đầu
  if (variant === "xc" || variant === "dau") {
    const dauNumbers =
      bet.region_type === "M1"
        ? result.seventh_prize // Giải 7 cho M1
        : result.sixth_prize; // Giải 6 cho M2

    const prizeName = bet.region_type === "M1" ? "Giải 7" : "Giải 6";
    const prizeType =
      bet.region_type === "M1" ? "seventh_prize" : "sixth_prize";

    if (dauNumbers) {
      for (const number of bet.numbers) {
        if (dauNumbers.includes(number)) {
          winningNumbers.push(number);
          const winAmount = bet.denomination * ratio;
          totalWinAmount += winAmount;

          details.push({
            number,
            prize_type: prizeType,
            prize_name: prizeName,
            description: `Trùng với số ở ${prizeName}`,
            win_amount: winAmount,
          });
        }
      }
    }
  }

  // Kiểm tra đuôi
  if (variant === "xc" || variant === "duoi") {
    if (result.special_prize && result.special_prize.length > 0) {
      const dbPrize = result.special_prize[0];
      const duoiNumber = dbPrize.slice(-3); // 3 số cuối của giải đặc biệt

      for (const number of bet.numbers) {
        if (number === duoiNumber) {
          winningNumbers.push(number);
          const winAmount = bet.denomination * ratio;
          totalWinAmount += winAmount;

          details.push({
            number,
            prize_type: "special_prize",
            prize_name: "Giải đặc biệt",
            description: "Trùng với 3 số cuối của giải đặc biệt",
            win_amount: winAmount,
          });
        }
      }
    }
  }

  return {
    winAmount: totalWinAmount,
    winningNumbers,
    details,
  };
}

// Kiểm tra kết quả cược Bao Lô với chi tiết
function checkBaoLoResultDetailed(
  bet: any,
  result: any,
  winningRatio: any
): {
  winAmount: number;
  winningNumbers: string[];
  details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }>;
} {
  let totalWinAmount = 0;
  let winningNumbers: string[] = [];
  const details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  // Xác định số chữ số dựa vào biến thể
  const variant = bet.bet_variant || "b2";
  let digitCount = 2;
  if (variant === "b3") digitCount = 3;
  else if (variant === "b4") digitCount = 4;

  // Xác định tỷ lệ thưởng
  let ratio;
  if (typeof winningRatio === "object") {
    ratio =
      winningRatio[variant] ||
      (variant === "b2" ? 75 : variant === "b3" ? 650 : 5500);
  } else {
    ratio = variant === "b2" ? 75 : variant === "b3" ? 650 : 5500;
  }

  // Lấy tất cả các prize để kiểm tra
  const allPrizes: Array<{ value: string; type: string; name: string }> = [];

  // Map giải thưởng sang tên và loại
  const prizeMapping = [
    {
      array: result.special_prize,
      type: "special_prize",
      name: "Giải đặc biệt",
    },
    { array: result.first_prize, type: "first_prize", name: "Giải nhất" },
    { array: result.second_prize, type: "second_prize", name: "Giải nhì" },
    { array: result.third_prize, type: "third_prize", name: "Giải ba" },
    { array: result.fourth_prize, type: "fourth_prize", name: "Giải tư" },
    { array: result.fifth_prize, type: "fifth_prize", name: "Giải năm" },
    { array: result.sixth_prize, type: "sixth_prize", name: "Giải sáu" },
    { array: result.seventh_prize, type: "seventh_prize", name: "Giải bảy" },
    { array: result.eighth_prize, type: "eighth_prize", name: "Giải tám" },
  ];

  // Thêm tất cả các giải vào mảng
  prizeMapping.forEach((mapping) => {
    if (mapping.array) {
      mapping.array.forEach((prize: string) => {
        if (prize) {
          allPrizes.push({
            value: prize,
            type: mapping.type,
            name: mapping.name,
          });
        }
      });
    }
  });

  // Kiểm tra từng số cược
  for (const number of bet.numbers) {
    for (const prize of allPrizes) {
      if (prize.value.slice(-number.length) === number) {
        winningNumbers.push(number);
        const winAmount = bet.denomination * ratio;
        totalWinAmount += winAmount;

        details.push({
          number,
          prize_type: prize.type,
          prize_name: prize.name,
          description: `${digitCount} số cuối trùng với ${prize.name} (${prize.value})`,
          win_amount: winAmount,
        });
      }
    }
  }

  // Loại bỏ các số trùng lặp trong winningNumbers
  winningNumbers = [...new Set(winningNumbers)];

  return {
    winAmount: totalWinAmount,
    winningNumbers,
    details,
  };
}

// Kiểm tra kết quả cược Bao 7 Lô với chi tiết
function checkBao7LoResultDetailed(
  bet: any,
  result: any,
  winningRatio: any
): {
  winAmount: number;
  winningNumbers: string[];
  details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }>;
} {
  let totalWinAmount = 0;
  let winningNumbers: string[] = [];
  const details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  // Xác định số chữ số dựa vào biến thể (b7l2, b7l3, b7l4)
  const variant = bet.bet_variant || "b7l2";
  let digitCount = 2;
  if (variant === "b7l3") digitCount = 3;
  else if (variant === "b7l4") digitCount = 4;

  // Xác định tỷ lệ thưởng
  let ratio;
  if (typeof winningRatio === "object") {
    ratio =
      winningRatio[variant] ||
      (variant === "b7l2" ? 75 : variant === "b7l3" ? 650 : 5500);
  } else {
    ratio = variant === "b7l2" ? 75 : variant === "b7l3" ? 650 : 5500;
  }

  // 7 lô đặc biệt cho M1
  const specialPrizes: Array<{ value: string; type: string; name: string }> =
    [];

  // Map giải thưởng đặc biệt cho Bao 7 Lô
  const specialPrizeMapping = [
    { array: result.eighth_prize, type: "eighth_prize", name: "Giải tám" },
    { array: result.seventh_prize, type: "seventh_prize", name: "Giải bảy" },
    { array: result.sixth_prize, type: "sixth_prize", name: "Giải sáu" },
    { array: result.fifth_prize, type: "fifth_prize", name: "Giải năm" },
    {
      array: result.special_prize,
      type: "special_prize",
      name: "Giải đặc biệt",
    },
  ];

  // Thêm tất cả các giải đặc biệt vào mảng
  specialPrizeMapping.forEach((mapping) => {
    if (mapping.array) {
      mapping.array.forEach((prize: string) => {
        if (prize) {
          specialPrizes.push({
            value: prize,
            type: mapping.type,
            name: mapping.name,
          });
        }
      });
    }
  });

  // Kiểm tra từng số cược
  for (const number of bet.numbers) {
    for (const prize of specialPrizes) {
      if (prize.value.slice(-number.length) === number) {
        winningNumbers.push(number);
        const winAmount = bet.denomination * ratio;
        totalWinAmount += winAmount;

        details.push({
          number,
          prize_type: prize.type,
          prize_name: prize.name,
          description: `${digitCount} số cuối trùng với ${prize.name} (${prize.value})`,
          win_amount: winAmount,
        });
      }
    }
  }

  // Loại bỏ các số trùng lặp trong winningNumbers
  winningNumbers = [...new Set(winningNumbers)];

  return {
    winAmount: totalWinAmount,
    winningNumbers,
    details,
  };
}

// Kiểm tra kết quả cược Bao 8 Lô với chi tiết
function checkBao8LoResultDetailed(
  bet: any,
  result: any,
  winningRatio: any
): {
  winAmount: number;
  winningNumbers: string[];
  details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }>;
} {
  let totalWinAmount = 0;
  let winningNumbers: string[] = [];
  const details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  // Xác định số chữ số dựa vào biến thể (b8l2, b8l3, b8l4)
  const variant = bet.bet_variant || "b8l2";
  let digitCount = 2;
  if (variant === "b8l3") digitCount = 3;
  else if (variant === "b8l4") digitCount = 4;

  // Xác định tỷ lệ thưởng
  let ratio;
  if (typeof winningRatio === "object") {
    ratio =
      winningRatio[variant] ||
      (variant === "b8l2" ? 75 : variant === "b8l3" ? 650 : 5500);
  } else {
    ratio = variant === "b8l2" ? 75 : variant === "b8l3" ? 650 : 5500;
  }

  // 8 lô đặc biệt cho M2
  const specialPrizes: Array<{ value: string; type: string; name: string }> =
    [];

  // Map giải thưởng đặc biệt cho Bao 8 Lô
  const specialPrizeMapping = [
    {
      array: result.special_prize,
      type: "special_prize",
      name: "Giải đặc biệt",
    },
    { array: result.seventh_prize, type: "seventh_prize", name: "Giải bảy" },
    { array: result.sixth_prize, type: "sixth_prize", name: "Giải sáu" },
    { array: result.fifth_prize, type: "fifth_prize", name: "Giải năm" },
    { array: result.fourth_prize, type: "fourth_prize", name: "Giải tư" },
    { array: result.third_prize, type: "third_prize", name: "Giải ba" },
  ];

  // Thêm tất cả các giải đặc biệt vào mảng
  specialPrizeMapping.forEach((mapping) => {
    if (mapping.array) {
      mapping.array.forEach((prize: string) => {
        if (prize) {
          specialPrizes.push({
            value: prize,
            type: mapping.type,
            name: mapping.name,
          });
        }
      });
    }
  });

  // Kiểm tra từng số cược
  for (const number of bet.numbers) {
    for (const prize of specialPrizes) {
      if (prize.value.slice(-number.length) === number) {
        winningNumbers.push(number);
        const winAmount = bet.denomination * ratio;
        totalWinAmount += winAmount;

        details.push({
          number,
          prize_type: prize.type,
          prize_name: prize.name,
          description: `${digitCount} số cuối trùng với ${prize.name} (${prize.value})`,
          win_amount: winAmount,
        });
      }
    }
  }

  // Loại bỏ các số trùng lặp trong winningNumbers
  winningNumbers = [...new Set(winningNumbers)];

  return {
    winAmount: totalWinAmount,
    winningNumbers,
    details,
  };
}

// Kiểm tra kết quả cược Nhất To với chi tiết
function checkNhatToResultDetailed(
  bet: any,
  result: any,
  winningRatio: any
): {
  winAmount: number;
  winningNumbers: string[];
  details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }>;
} {
  let totalWinAmount = 0;
  const winningNumbers: string[] = [];
  const details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  const ratio = typeof winningRatio === "number" ? winningRatio : 75;

  // Kiểm tra Nhất To - 2 số cuối của giải Nhất
  if (!result.first_prize || result.first_prize.length === 0) {
    return { winAmount: 0, winningNumbers: [], details: [] };
  }

  const firstPrize = result.first_prize[0];
  const lastTwoDigits = firstPrize.slice(-2);

  for (const number of bet.numbers) {
    if (number === lastTwoDigits) {
      winningNumbers.push(number);
      const winAmount = bet.denomination * ratio;
      totalWinAmount += winAmount;

      details.push({
        number,
        prize_type: "first_prize",
        prize_name: "Giải nhất",
        description: `Trùng với 2 số cuối của giải nhất (${firstPrize})`,
        win_amount: winAmount,
      });
    }
  }

  return {
    winAmount: totalWinAmount,
    winningNumbers,
    details,
  };
}

// Kiểm tra kết quả cược Xiên với chi tiết
function checkXienResultDetailed(
  bet: any,
  result: any,
  winningRatio: any
): {
  winAmount: number;
  winningNumbers: string[];
  details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }>;
} {
  // Xác định biến thể Xiên (x2, x3, x4)
  const variant = bet.bet_variant || "x2";

  // Lấy tất cả các số 2 chữ số từ các lô
  const allLastTwoDigits: string[] = [];
  const allPrizes: Array<{
    value: string;
    lastTwo: string;
    type: string;
    name: string;
  }> = [];

  // Map giải thưởng sang tên và loại
  const prizeMapping = [
    {
      array: result.special_prize,
      type: "special_prize",
      name: "Giải đặc biệt",
    },
    { array: result.first_prize, type: "first_prize", name: "Giải nhất" },
    { array: result.second_prize, type: "second_prize", name: "Giải nhì" },
    { array: result.third_prize, type: "third_prize", name: "Giải ba" },
    { array: result.fourth_prize, type: "fourth_prize", name: "Giải tư" },
    { array: result.fifth_prize, type: "fifth_prize", name: "Giải năm" },
    { array: result.sixth_prize, type: "sixth_prize", name: "Giải sáu" },
    { array: result.seventh_prize, type: "seventh_prize", name: "Giải bảy" },
  ];

  // Thêm tất cả các giải vào mảng và lấy 2 số cuối
  prizeMapping.forEach((mapping) => {
    if (mapping.array) {
      mapping.array.forEach((prize: string) => {
        if (prize) {
          const lastTwo = prize.slice(-2);
          allLastTwoDigits.push(lastTwo);
          allPrizes.push({
            value: prize,
            lastTwo,
            type: mapping.type,
            name: mapping.name,
          });
        }
      });
    }
  });

  // Kiểm tra xem TẤT CẢ các số cược có trong kết quả không
  const matchedNumbers: string[] = [];
  const matchedDetails: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  // Tìm thông tin trúng thưởng cho từng số
  for (const number of bet.numbers) {
    for (const prize of allPrizes) {
      if (prize.lastTwo === number) {
        matchedNumbers.push(number);
        matchedDetails.push({
          number,
          prize_type: prize.type,
          prize_name: prize.name,
          description: `Trùng với 2 số cuối của ${prize.name} (${prize.value})`,
          win_amount: 0, // Sẽ cập nhật sau nếu tất cả các số trúng
        });
        break; // Đã tìm thấy kết quả cho số này
      }
    }
  }

  // Với Xiên, chỉ thắng khi TẤT CẢ các số đều trúng
  const allNumbersMatched = bet.numbers.every((number: string) =>
    matchedNumbers.includes(number)
  );

  if (!allNumbersMatched) {
    return { winAmount: 0, winningNumbers: [], details: [] };
  }

  // Tính tiền thắng nếu tất cả các số đều trúng
  let ratio;
  if (typeof winningRatio === "object") {
    ratio = winningRatio[variant] || 0;
  } else {
    ratio = variant === "x2" ? 75 : variant === "x3" ? 40 : 250;
  }

  const winAmount = bet.denomination * ratio;

  // Cập nhật win_amount cho từng chi tiết
  const details = matchedDetails.map((detail) => ({
    ...detail,
    win_amount: winAmount / matchedDetails.length, // Chia đều tiền thắng cho các số
  }));

  return {
    winAmount,
    winningNumbers: matchedNumbers,
    details,
  };
}

// Kiểm tra kết quả cược Đá với chi tiết
function checkDaResultDetailed(
  bet: any,
  result: any,
  winningRatio: any
): {
  winAmount: number;
  winningNumbers: string[];
  details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }>;
} {
  // Xác định biến thể Đá (da2, da3, da4, da5)
  const variant = bet.bet_variant || "da2";

  // Lấy tất cả các số 2 chữ số từ các lô
  const allLastTwoDigits: string[] = [];
  const allPrizes: Array<{
    value: string;
    lastTwo: string;
    type: string;
    name: string;
  }> = [];

  // Map giải thưởng sang tên và loại
  const prizeMapping = [
    {
      array: result.special_prize,
      type: "special_prize",
      name: "Giải đặc biệt",
    },
    { array: result.first_prize, type: "first_prize", name: "Giải nhất" },
    { array: result.second_prize, type: "second_prize", name: "Giải nhì" },
    { array: result.third_prize, type: "third_prize", name: "Giải ba" },
    { array: result.fourth_prize, type: "fourth_prize", name: "Giải tư" },
    { array: result.fifth_prize, type: "fifth_prize", name: "Giải năm" },
    { array: result.sixth_prize, type: "sixth_prize", name: "Giải sáu" },
    { array: result.seventh_prize, type: "seventh_prize", name: "Giải bảy" },
    { array: result.eighth_prize, type: "eighth_prize", name: "Giải tám" },
  ];

  // Thêm tất cả các giải vào mảng và lấy 2 số cuối
  prizeMapping.forEach((mapping) => {
    if (mapping.array) {
      mapping.array.forEach((prize: string) => {
        if (prize) {
          const lastTwo = prize.slice(-2);
          allLastTwoDigits.push(lastTwo);
          allPrizes.push({
            value: prize,
            lastTwo,
            type: mapping.type,
            name: mapping.name,
          });
        }
      });
    }
  });

  // Đếm số lần xuất hiện của mỗi số trong kết quả
  const matchCounts: Record<string, number> = {};
  const matchedDetails: Record<
    string,
    Array<{
      prize_type: string;
      prize_name: string;
      prize_value: string;
    }>
  > = {};

  for (const number of bet.numbers) {
    matchCounts[number] = 0;
    matchedDetails[number] = [];

    for (const prize of allPrizes) {
      if (prize.lastTwo === number) {
        matchCounts[number]++;
        matchedDetails[number].push({
          prize_type: prize.type,
          prize_name: prize.name,
          prize_value: prize.value,
        });
      }
    }
  }

  // Đếm số lượng số trúng (ít nhất 1 lần)
  const matchedNumbers = Object.keys(matchCounts).filter(
    (num) => matchCounts[num] > 0
  );

  if (matchedNumbers.length === 0) {
    return { winAmount: 0, winningNumbers: [], details: [] };
  }

  // Phân tích kết quả để xác định trường hợp trúng
  let winCase = "";
  let ratio = 0;

  // Đếm số lần xuất hiện của mỗi số
  const doubleCount = Object.values(matchCounts).filter(
    (count) => count === 2
  ).length;
  const tripleCount = Object.values(matchCounts).filter(
    (count) => count >= 3
  ).length;

  // Xác định trường hợp trúng dựa vào biến thể và số lượng số trúng
  switch (variant) {
    case "da2":
      if (matchedNumbers.length === 2) {
        winCase = "2_numbers";
        ratio =
          typeof winningRatio === "object" && winningRatio[variant]
            ? winningRatio[variant]["2_numbers"] || 12.5
            : 12.5;
      }
      break;

    case "da3":
      if (matchedNumbers.length === 3) {
        // Kiểm tra có số nào xuất hiện 3 lần
        if (tripleCount > 0) {
          winCase = "3_numbers_1_number_3_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["3_numbers_1_number_3_times"] || 112.5
              : 112.5;
        } else {
          // Kiểm tra có số nào xuất hiện 2 lần
          if (doubleCount > 0) {
            winCase = "3_numbers_1_number_2_times";
            ratio =
              typeof winningRatio === "object" && winningRatio[variant]
                ? winningRatio[variant]["3_numbers_1_number_2_times"] || 75
                : 75;
          } else {
            winCase = "3_numbers";
            ratio =
              typeof winningRatio === "object" && winningRatio[variant]
                ? winningRatio[variant]["3_numbers"] || 37.5
                : 37.5;
          }
        }
      } else if (matchedNumbers.length === 2) {
        // Kiểm tra có số nào xuất hiện 2 lần
        if (doubleCount > 0) {
          winCase = "2_numbers_1_number_2_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["2_numbers_1_number_2_times"] || 43.75
              : 43.75;
        } else {
          winCase = "2_numbers_no_doubles";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["2_numbers_no_doubles"] || 25
              : 25;
        }
      }
      break;

    case "da4":
      if (matchedNumbers.length === 4) {
        winCase = "4_numbers";
        ratio =
          typeof winningRatio === "object" && winningRatio[variant]
            ? winningRatio[variant]["4_numbers"] || 250
            : 250;
      } else if (matchedNumbers.length === 3) {
        // Kiểm tra có số nào xuất hiện 3 lần
        if (tripleCount > 0) {
          winCase = "3_numbers_1_number_3_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["3_numbers_1_number_3_times"] || 750
              : 750;
        } else if (doubleCount > 0) {
          winCase = "3_numbers_1_number_2_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["3_numbers_1_number_2_times"] || 500
              : 500;
        }
      } else if (matchedNumbers.length === 2) {
        // Kiểm tra số lượng số xuất hiện 2 lần
        if (doubleCount >= 2) {
          winCase = "2_numbers_2_number_2_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["2_numbers_2_number_2_times"] || 150
              : 150;
        } else if (doubleCount === 1) {
          winCase = "2_numbers_1_number_2_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["2_numbers_1_number_2_times"] || 75
              : 75;
        }
      }
      break;

    case "da5":
      if (matchedNumbers.length === 5) {
        winCase = "5_numbers";
        ratio =
          typeof winningRatio === "object" && winningRatio[variant]
            ? winningRatio[variant]["5_numbers"] || 1250
            : 1250;
      } else if (matchedNumbers.length === 4) {
        // Kiểm tra có số nào xuất hiện 3 lần
        if (tripleCount > 0) {
          winCase = "4_numbers_1_number_3_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["4_numbers_1_number_3_times"] || 3750
              : 3750;
        } else if (doubleCount > 0) {
          winCase = "4_numbers_1_number_2_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["4_numbers_1_number_2_times"] || 2500
              : 2500;
        }
      } else if (matchedNumbers.length === 3) {
        // Kiểm tra số lượng số xuất hiện 2 lần
        if (doubleCount >= 2) {
          winCase = "3_numbers_2_number_2_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["3_numbers_2_number_2_times"] || 750
              : 750;
        } else if (doubleCount === 1) {
          winCase = "3_numbers_1_number_2_times";
          ratio =
            typeof winningRatio === "object" && winningRatio[variant]
              ? winningRatio[variant]["3_numbers_1_number_2_times"] || 500
              : 500;
        }
      }
      break;
  }

  // Nếu không xác định được trường hợp trúng
  if (!winCase || ratio === 0) {
    return { winAmount: 0, winningNumbers: [], details: [] };
  }

  // Tính tiền thắng
  const winAmount = bet.denomination * ratio;

  // Tạo chi tiết cho từng số trúng
  const details: Array<{
    number: string;
    prize_type: string;
    prize_name: string;
    description: string;
    win_amount: number;
  }> = [];

  // Chia đều tiền thắng cho các số trúng
  const winAmountPerNumber = winAmount / matchedNumbers.length;

  for (const number of matchedNumbers) {
    // Lấy chi tiết giải đầu tiên mà số này trúng
    const firstMatch = matchedDetails[number][0];
    if (firstMatch) {
      details.push({
        number,
        prize_type: firstMatch.prize_type,
        prize_name: firstMatch.prize_name,
        description: `Trúng ${matchCounts[number]} lần, phần của trường hợp ${winCase}`,
        win_amount: winAmountPerNumber,
      });
    }
  }

  return {
    winAmount,
    winningNumbers: matchedNumbers,
    details,
  };
}
