// src/lib/utils/improved-bet-result-processor.ts

/**
 * Phiên bản cải tiến của hàm kiểm tra kết quả cược
 * - Thêm logging chi tiết
 * - Xử lý lỗi nghiêm ngặt hơn
 * - Trả về thêm thông tin lỗi
 */
export function checkBetResultEnhanced(
  bet: any,
  result: any,
  betType: any
): {
  isWinning: boolean;
  winAmount: number;
  details?: any;
  error?: string;
} {
  try {
    console.log(`Bắt đầu đối soát cược ID: ${bet.id}`);
    console.log(`Thông tin cược:`, {
      bet_type: bet.bet_type,
      bet_variant: bet.bet_variant,
      region_type: bet.region_type,
      numbers: bet.numbers,
      province_id: bet.province_id,
      draw_date: bet.draw_date,
    });

    // Kiểm tra xem có kết quả xổ số không
    if (!result) {
      console.warn(`Không tìm thấy kết quả xổ số cho cược ID: ${bet.id}`);
      return {
        isWinning: false,
        winAmount: 0,
        error: "NO_RESULT",
      };
    }

    console.log(
      `Kết quả xổ số ID: ${result.id}, ngày: ${result.date}, tỉnh: ${result.province_id}`
    );

    // Parse dữ liệu JSONB từ betType (nếu cần)
    let regionRules, winningRatio, variants;

    try {
      regionRules =
        typeof betType.region_rules === "string"
          ? JSON.parse(betType.region_rules)
          : betType.region_rules;

      console.log(`Đã parse region_rules thành công cho ${bet.bet_type}`);
    } catch (error) {
      console.error(`Lỗi khi parse region_rules cho ${bet.bet_type}:`, error);
      return {
        isWinning: false,
        winAmount: 0,
        error: "INVALID_REGION_RULES",
      };
    }

    try {
      winningRatio =
        typeof betType.winning_ratio === "string"
          ? JSON.parse(betType.winning_ratio)
          : betType.winning_ratio;

      console.log(`Đã parse winning_ratio thành công cho ${bet.bet_type}`);
    } catch (error) {
      console.error(`Lỗi khi parse winning_ratio cho ${bet.bet_type}:`, error);
      return {
        isWinning: false,
        winAmount: 0,
        error: "INVALID_WINNING_RATIO",
      };
    }

    if (betType.variants) {
      try {
        variants =
          typeof betType.variants === "string"
            ? JSON.parse(betType.variants)
            : betType.variants;

        console.log(`Đã parse variants thành công cho ${bet.bet_type}`);
      } catch (error) {
        console.error(`Lỗi khi parse variants cho ${bet.bet_type}:`, error);
        return {
          isWinning: false,
          winAmount: 0,
          error: "INVALID_VARIANTS",
        };
      }
    }

    // Kiểm tra xem loại cược có hỗ trợ vùng miền không
    if (!regionRules[bet.region_type]) {
      console.error(
        `Loại cược ${bet.bet_type} không hỗ trợ miền ${bet.region_type}`
      );
      return {
        isWinning: false,
        winAmount: 0,
        error: "UNSUPPORTED_REGION",
      };
    }

    // Kiểm tra xem biến thể cược có hợp lệ không
    if (bet.bet_variant && variants) {
      const validVariant = Array.isArray(variants)
        ? variants.some((v) => v.id === bet.bet_variant)
        : false;

      if (!validVariant) {
        console.error(
          `Biến thể ${bet.bet_variant} không hợp lệ cho loại cược ${bet.bet_type}`
        );
        return {
          isWinning: false,
          winAmount: 0,
          error: "INVALID_VARIANT",
        };
      }
    }

    // Đối soát kết quả dựa trên loại cược
    let matches = 0;
    let matchDetails = [];
    let winAmount = 0;

    switch (bet.bet_type) {
      case "dd": // Đầu Đuôi
        console.log(`Đối soát Đầu Đuôi`);
        const ddResult = checkDauDuoiEnhanced(
          bet,
          result,
          bet.bet_variant || "dd"
        );
        matches = ddResult.matches;
        matchDetails = ddResult.details;
        break;

      case "xc": // Xỉu Chủ
        console.log(`Đối soát Xỉu Chủ`);
        const xcResult = checkXiuChuEnhanced(
          bet,
          result,
          bet.bet_variant || "xc"
        );
        matches = xcResult.matches;
        matchDetails = xcResult.details;
        break;

      case "bao_lo": // Bao Lô
        console.log(`Đối soát Bao Lô ${bet.bet_variant}`);
        const baoLoResult = checkBaoLoEnhanced(
          bet,
          result,
          bet.bet_variant || "b2"
        );
        matches = baoLoResult.matches;
        matchDetails = baoLoResult.details;
        break;

      // Thêm các loại cược khác...
      default:
        console.warn(
          `Loại cược ${bet.bet_type} chưa được xử lý trong phiên bản cải tiến`
        );
        return {
          isWinning: false,
          winAmount: 0,
          error: "UNIMPLEMENTED_BET_TYPE",
        };
    }

    console.log(`Kết quả đối soát: tìm thấy ${matches} lần trùng`);

    // Tính tiền thắng
    if (matches > 0) {
      // Xác định tỷ lệ thắng
      let ratio;

      if (typeof winningRatio === "number") {
        ratio = winningRatio;
      } else if (
        bet.bet_variant &&
        typeof winningRatio[bet.bet_variant] === "number"
      ) {
        ratio = winningRatio[bet.bet_variant];
      } else if (
        bet.bet_variant &&
        typeof winningRatio[bet.bet_variant] === "object"
      ) {
        // Trường hợp đặc biệt cho cược "đá" - có nhiều tỷ lệ khác nhau
        // Tạm thời lấy tỷ lệ đầu tiên
        ratio = Object.values(winningRatio[bet.bet_variant])[0] as number;
      } else {
        console.error(
          `Không thể xác định tỷ lệ thắng cho ${bet.bet_type}/${bet.bet_variant}`
        );
        return {
          isWinning: false,
          winAmount: 0,
          error: "UNDEFINED_WINNING_RATIO",
        };
      }

      winAmount = matches * bet.denomination * ratio;
      console.log(
        `Tiền thắng: ${winAmount} (${matches} lần × ${bet.denomination} × tỷ lệ ${ratio})`
      );

      return {
        isWinning: true,
        winAmount,
        details: {
          matches,
          matchDetails,
          ratio,
        },
      };
    }

    return {
      isWinning: false,
      winAmount: 0,
      details: {
        matches: 0,
        matchDetails: [],
      },
    };
  } catch (error) {
    console.error(`Lỗi không xác định khi đối soát cược ID ${bet.id}:`, error);
    return {
      isWinning: false,
      winAmount: 0,
      error: `UNEXPECTED_ERROR: ${error.message}`,
    };
  }
}

/**
 * Kiểm tra kết quả đầu đuôi
 */
function checkDauDuoiEnhanced(bet: any, result: any, variant: string) {
  const details = [];
  let matches = 0;

  // Kiểm tra phần đầu
  if (variant === "dd" || variant === "dau") {
    // Xác định giải để kiểm tra dựa vào miền
    const dauNumbers =
      bet.region_type === "M1"
        ? result.eighth_prize // Giải 8 cho M1
        : result.seventh_prize; // Giải 7 cho M2

    console.log(
      `Kiểm tra đầu với ${dauNumbers?.length || 0} số của giải ${
        bet.region_type === "M1" ? "8" : "7"
      }`
    );

    if (dauNumbers) {
      for (const number of bet.numbers) {
        for (const prizeNumber of dauNumbers) {
          if (prizeNumber === number) {
            matches++;
            details.push({
              type: "dau",
              bet_number: number,
              result_number: prizeNumber,
              prize: bet.region_type === "M1" ? "Giải 8" : "Giải 7",
            });
            console.log(`Trùng đầu: ${number} = ${prizeNumber}`);
          }
        }
      }
    } else {
      console.warn(
        `Không tìm thấy số giải ${
          bet.region_type === "M1" ? "8" : "7"
        } trong kết quả`
      );
    }
  }

  // Kiểm tra phần đuôi
  if (variant === "dd" || variant === "duoi") {
    if (result.special_prize && result.special_prize.length > 0) {
      const dbPrize = result.special_prize[0];
      const duoiNumber = dbPrize.slice(-2); // 2 số cuối của giải đặc biệt

      console.log(
        `Kiểm tra đuôi với số ${duoiNumber} từ giải đặc biệt ${dbPrize}`
      );

      for (const number of bet.numbers) {
        if (number === duoiNumber) {
          matches++;
          details.push({
            type: "duoi",
            bet_number: number,
            result_number: duoiNumber,
            prize: "Giải đặc biệt",
          });
          console.log(`Trùng đuôi: ${number} = ${duoiNumber}`);
        }
      }
    } else {
      console.warn("Không tìm thấy giải đặc biệt trong kết quả");
    }
  }

  return { matches, details };
}

/**
 * Kiểm tra kết quả xỉu chủ
 */
function checkXiuChuEnhanced(bet: any, result: any, variant: string) {
  const details = [];
  let matches = 0;

  // Kiểm tra phần đầu
  if (variant === "xc" || variant === "dau") {
    // Xác định giải để kiểm tra dựa vào miền
    const dauNumbers =
      bet.region_type === "M1"
        ? result.seventh_prize // Giải 7 cho M1
        : result.sixth_prize; // Giải 6 cho M2

    console.log(
      `Kiểm tra đầu với ${dauNumbers?.length || 0} số của giải ${
        bet.region_type === "M1" ? "7" : "6"
      }`
    );

    if (dauNumbers) {
      for (const number of bet.numbers) {
        for (const prizeNumber of dauNumbers) {
          if (prizeNumber === number) {
            matches++;
            details.push({
              type: "dau",
              bet_number: number,
              result_number: prizeNumber,
              prize: bet.region_type === "M1" ? "Giải 7" : "Giải 6",
            });
            console.log(`Trùng đầu: ${number} = ${prizeNumber}`);
          }
        }
      }
    } else {
      console.warn(
        `Không tìm thấy số giải ${
          bet.region_type === "M1" ? "7" : "6"
        } trong kết quả`
      );
    }
  }

  // Kiểm tra phần đuôi
  if (variant === "xc" || variant === "duoi") {
    if (result.special_prize && result.special_prize.length > 0) {
      const dbPrize = result.special_prize[0];
      const duoiNumber = dbPrize.slice(-3); // 3 số cuối của giải đặc biệt

      console.log(
        `Kiểm tra đuôi với số ${duoiNumber} từ giải đặc biệt ${dbPrize}`
      );

      for (const number of bet.numbers) {
        if (number === duoiNumber) {
          matches++;
          details.push({
            type: "duoi",
            bet_number: number,
            result_number: duoiNumber,
            prize: "Giải đặc biệt",
          });
          console.log(`Trùng đuôi: ${number} = ${duoiNumber}`);
        }
      }
    } else {
      console.warn("Không tìm thấy giải đặc biệt trong kết quả");
    }
  }

  return { matches, details };
}

/**
 * Kiểm tra kết quả bao lô
 */
function checkBaoLoEnhanced(bet: any, result: any, variant: string) {
  const details = [];
  let matches = 0;

  // Xác định số chữ số dựa vào biến thể
  let digitCount = 2;
  if (variant === "b3") digitCount = 3;
  else if (variant === "b4") digitCount = 4;

  console.log(`Kiểm tra bao lô ${variant} với ${digitCount} chữ số`);

  // Lấy tất cả các giải để kiểm tra
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

  // Thêm giải 8 cho M1
  if (bet.region_type === "M1" && result.eighth_prize) {
    allPrizes.push(...result.eighth_prize);
  }

  console.log(`Tìm thấy tổng cộng ${allPrizes.length} số trong các giải`);

  // Kiểm tra từng số cược
  for (const number of bet.numbers) {
    for (const prize of allPrizes) {
      if (prize) {
        const lastDigits = prize.slice(-number.length);
        if (lastDigits === number) {
          matches++;
          details.push({
            bet_number: number,
            result_number: prize,
            matched_part: lastDigits,
          });
          console.log(
            `Trùng bao lô: ${number} là ${digitCount} số cuối của ${prize}`
          );
        }
      }
    }
  }

  return { matches, details };
}
