// src/components/bet-form/bet-review.tsx
import { useBetContext } from "@/contexts/BetContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useProvincesByRegion } from "@/lib/hooks/use-provinces";
import { useBetTypes } from "@/lib/hooks/use-bet-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";

export function BetReview() {
  const { methods, totalAmount, potentialWin, isBalanceEnough } =
    useBetContext();

  //   console.log({ result: useBetContext() });

  const [isExpanded, setIsExpanded] = useState(true);

  const betDate = methods.watch("betDate");
  const drawDate = methods.watch("drawDate");
  const regionType = methods.watch("regionType");
  const provinces = methods.watch("provinces") || [];
  const betType = methods.watch("betType");
  const betVariant = methods.watch("betVariant");
  const numbers = methods.watch("numbers") || [];
  const denomination = methods.watch("denomination");

  // Fetch province and bet type data
  const { data: provincesByRegion } = useProvincesByRegion();
  const { data: betTypes } = useBetTypes();

  // Get province names based on IDs
  const getProvinceNames = () => {
    if (!provincesByRegion) return [];

    // Handle both array and object structures
    const allProvinces = Array.isArray(provincesByRegion)
      ? provincesByRegion
      : [];

    return provinces.map((id) => {
      const province = allProvinces.find((p) => p.province_id === id);
      return province ? province.name : id;
    });
  };

  // Get bet type and variant info
  const getBetTypeInfo = () => {
    if (!betTypes) return { name: betType, variantName: betVariant };

    const betTypeInfo = betTypes.find((bt) => bt.bet_type_id === betType);
    if (!betTypeInfo) return { name: betType, variantName: betVariant };

    const variantInfo =
      betVariant && betTypeInfo.variants
        ? (typeof betTypeInfo.variants === "string"
            ? JSON.parse(betTypeInfo.variants)
            : betTypeInfo.variants
          ).find((v: any) => v.id === betVariant)
        : null;

    return {
      name: betTypeInfo.name,
      variantName: variantInfo ? variantInfo.name : undefined,
    };
  };

  const provinceNames = getProvinceNames();
  const { name: betTypeName, variantName } = getBetTypeInfo();

  const hasData =
    betDate &&
    drawDate &&
    provinces.length > 0 &&
    betType &&
    numbers.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Tóm tắt cược</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0 md:hidden"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>

      <div className={`space-y-4 ${!isExpanded ? "hidden md:block" : ""}`}>
        {!hasData ? (
          <div className="text-gray-500 text-sm py-2 text-center">
            Chưa có thông tin cược
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500">
                Thông tin cơ bản
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {betDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ngày đặt:</span>
                    <span>{format(betDate, "dd/MM/yyyy", { locale: vi })}</span>
                  </div>
                )}
                {drawDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ngày xổ:</span>
                    <span>
                      {format(drawDate, "dd/MM/yyyy", { locale: vi })}
                    </span>
                  </div>
                )}
                {regionType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Miền:</span>
                    <span>
                      {regionType === "M1" ? "Miền Nam/Trung" : "Miền Bắc"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {provinces.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">
                  Đài xổ số ({provinces.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {provinceNames.map((name, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-50">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {betType && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Loại cược</h4>
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Loại cược:</span>
                    <span className="font-medium">{betTypeName}</span>
                  </div>
                  {variantName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Biến thể:</span>
                      <span>{variantName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mệnh giá:</span>
                    <span>{formatCurrency(denomination)}</span>
                  </div>
                </div>
              </div>
            )}

            {numbers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">
                  Số đã chọn ({numbers.length})
                </h4>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {numbers.map((number, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-50">
                      {number}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tổng tiền đặt:</span>
                <span className="font-bold text-lottery-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Tiềm năng thắng:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(potentialWin)}
                </span>
              </div>

              {!isBalanceEnough && (
                <div className="bg-red-50 border border-red-200 p-2 rounded-md mt-2 flex items-start">
                  <Info className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                  <p className="text-red-600 text-xs">
                    Số dư không đủ để đặt cược
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
