// src/components/bet-form/bet-calculation-detail.tsx
import { useBetContext } from "@/contexts/BetContext";
import { useProvincesByRegion } from "@/lib/hooks/use-provinces";
import { useBetTypes } from "@/lib/hooks/use-bet-types";
import { formatCurrency } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calculator, Info } from "lucide-react";

interface Province {
  province_id: string;
  name: string;
  region_type: "M1" | "M2";
}

export function BetCalculationDetail() {
  const { methods, totalAmount, potentialWin } = useBetContext();

  const betType = methods.watch("betType");
  const betVariant = methods.watch("betVariant");
  const regionType = methods.watch("regionType");
  const denomination = methods.watch("denomination");
  const numbers = methods.watch("numbers") || [];
  const provinces = methods.watch("provinces") || [];

  const { data: provincesByRegion } = useProvincesByRegion();
  const { data: betTypes } = useBetTypes();

  // Skip if not enough data
  if (
    !betType ||
    !numbers.length ||
    !provinces.length ||
    !betTypes?.length ||
    !provincesByRegion
  ) {
    return null;
  }

  // Find current bet type data
  const currentBetTypeData = betTypes.find((bt) => bt.bet_type_id === betType);

  if (!currentBetTypeData) {
    return null;
  }

  // Parse region rules and winning ratio
  const regionRules =
    typeof currentBetTypeData.region_rules === "string"
      ? JSON.parse(currentBetTypeData.region_rules)
      : currentBetTypeData.region_rules;

  const winningRatio =
    typeof currentBetTypeData.winning_ratio === "string"
      ? JSON.parse(currentBetTypeData.winning_ratio)
      : currentBetTypeData.winning_ratio;

  // Get province details
  const getProvinceDetails = () => {
    // Create a properly typed array of provinces
    let allProvinces: Province[] = [];

    if (Array.isArray(provincesByRegion)) {
      allProvinces = provincesByRegion as Province[];
    } else {
      // If provincesByRegion is an object with region keys
      Object.values(provincesByRegion || {}).forEach((regionProvinces) => {
        if (Array.isArray(regionProvinces)) {
          allProvinces = [...allProvinces, ...(regionProvinces as Province[])];
        }
      });
    }

    return provinces.map((id) => {
      const province = allProvinces.find((p) => p.province_id === id);
      return {
        id,
        name: province ? province.name : id,
        regionType: province ? province.region_type : regionType,
      };
    });
  };

  const provinceDetails = getProvinceDetails();

  // Get bet multiplier for a province
  const getBetMultiplier = (provinceRegionType: string) => {
    if (!regionRules[provinceRegionType]) return "N/A";

    const betMultipliers = regionRules[provinceRegionType].betMultipliers;

    if (betVariant && typeof betMultipliers === "object") {
      return betMultipliers[betVariant];
    }

    return typeof betMultipliers === "number"
      ? betMultipliers
      : betMultipliers[Object.keys(betMultipliers)[0]];
  };

  // Get winning ratio
  const getWinningRatioValue = () => {
    if (typeof winningRatio === "number") {
      return winningRatio;
    }

    if (betVariant && typeof winningRatio === "object") {
      const ratio = winningRatio[betVariant];
      return typeof ratio === "number" ? ratio : Object.values(ratio)[0];
    }

    return "N/A";
  };

  // Calculate per province amounts
  const provinceCalculations = provinceDetails
    .map((province) => {
      const multiplier = getBetMultiplier(province.regionType);
      if (multiplier === "N/A") return null;

      const winRatio = getWinningRatioValue();
      if (winRatio === "N/A") return null;

      const betAmount = denomination * multiplier * numbers.length;
      const winAmount = denomination * (winRatio as number) * numbers.length;

      return {
        ...province,
        multiplier,
        betAmount,
        winAmount,
      };
    })
    .filter(Boolean);

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="calculation"
      className="w-full mt-4"
    >
      <AccordionItem value="calculation">
        <AccordionTrigger className="text-sm">
          <div className="flex items-center">
            <Calculator className="mr-2 h-4 w-4" />
            Chi tiết tính toán cược
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-md flex items-start">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
              <div>
                <p className="font-medium">Cách tính tổng tiền đặt cược:</p>
                <p className="mt-1">
                  Mệnh giá × Hệ số nhân × Số lượng số đặt = Tiền đặt cho mỗi đài
                </p>
                <p className="mt-1">
                  Tổng tiền = Tổng tiền đặt cho tất cả các đài
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-md flex items-start">
              <Info className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              <div>
                <p className="font-medium">Cách tính tiềm năng thắng:</p>
                <p className="mt-1">
                  Mệnh giá × Tỷ lệ thưởng × Số lượng số đặt = Tiềm năng thắng
                  cho mỗi đài
                </p>
                <p className="mt-1">
                  Tổng tiềm năng thắng = Tổng tiềm năng thắng cho tất cả các đài
                </p>
              </div>
            </div>

            <div className="border rounded-md p-3">
              <div className="font-medium mb-2">Thông số cơ bản:</div>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600">Mệnh giá:</span>
                  <span>{formatCurrency(denomination)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Số lượng số đặt:</span>
                  <span>{numbers.length} số</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Tỷ lệ thưởng:</span>
                  <span>1:{getWinningRatioValue()}</span>
                </li>
              </ul>
            </div>

            <div className="border rounded-md p-3">
              <div className="font-medium mb-2">Chi tiết theo từng đài:</div>
              <div className="space-y-3">
                {provinceCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="border-t pt-2 first:border-t-0 first:pt-0"
                  >
                    <div className="font-medium">
                      {calc.name} ({calc.regionType})
                    </div>
                    <ul className="space-y-1 mt-1">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Hệ số nhân:</span>
                        <span>{calc.multiplier}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Tiền đặt:</span>
                        <span>
                          {denomination.toLocaleString()} × {calc.multiplier} ×{" "}
                          {numbers.length} = {formatCurrency(calc.betAmount)}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Tiềm năng thắng:</span>
                        <span className="text-green-600">
                          {denomination.toLocaleString()} ×{" "}
                          {getWinningRatioValue()} × {numbers.length} ={" "}
                          {formatCurrency(calc.winAmount)}
                        </span>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="font-medium mb-2">Tổng cộng:</div>
              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền đặt:</span>
                  <span className="font-bold">
                    {formatCurrency(totalAmount)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Tổng tiềm năng thắng:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(potentialWin)}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
