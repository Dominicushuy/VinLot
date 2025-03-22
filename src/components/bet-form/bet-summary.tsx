// src/components/bet-form/bet-summary.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { BetFormValues } from "@/lib/validators/bet-form-validator";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useProvincesByRegion } from "@/lib/hooks/use-provinces";
import { useBetTypes } from "@/lib/hooks/use-bet-types";

interface BetSummaryProps {
  totalAmount: number;
  potentialWin: number;
  isBalanceEnough: boolean;
}

export function BetSummary({
  totalAmount,
  potentialWin,
  isBalanceEnough,
}: BetSummaryProps) {
  const { watch } = useFormContext<BetFormValues>();

  const betDate = watch("betDate");
  const drawDate = watch("drawDate");
  const regionType = watch("regionType");
  const provinces = watch("provinces") || [];
  const betType = watch("betType");
  const betVariant = watch("betVariant");
  const numbers = watch("numbers") || [];
  const denomination = watch("denomination");

  // Lấy thông tin tỉnh
  const { data: provincesByRegion } = useProvincesByRegion();

  // Lấy thông tin loại cược
  const { data: betTypes } = useBetTypes();

  // Tìm tên tỉnh dựa trên ID
  const getProvinceNames = () => {
    if (!provincesByRegion) return [];

    // Flatten the array of provinces
    const allProvinces = Object.values(provincesByRegion).flat();

    return provinces.map((id) => {
      const province = allProvinces.find((p) => p.province_id === id);
      return province ? province.name : id;
    });
  };

  // Tìm thông tin loại cược
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

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold border-b pb-4">Tóm tắt cược</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Thông tin chung</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Ngày đặt cược:</span>
              <span className="font-medium">
                {format(betDate, "dd/MM/yyyy", { locale: vi })}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Ngày xổ số:</span>
              <span className="font-medium">
                {format(drawDate, "dd/MM/yyyy", { locale: vi })}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Miền:</span>
              <span className="font-medium">
                {regionType === "M1" ? "Miền Nam/Trung" : "Miền Bắc"}
              </span>
            </li>
            <li className="flex flex-col">
              <span className="text-gray-600 mb-1">Đài xổ số:</span>
              <div className="font-medium flex flex-wrap gap-1 justify-end">
                {provinceNames.map((name, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 px-2 py-0.5 rounded text-xs"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-2">Thông tin cược</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Loại cược:</span>
              <span className="font-medium">{betTypeName}</span>
            </li>
            {variantName && (
              <li className="flex justify-between">
                <span className="text-gray-600">Biến thể:</span>
                <span className="font-medium">{variantName}</span>
              </li>
            )}
            <li className="flex justify-between">
              <span className="text-gray-600">Số lượng số:</span>
              <span className="font-medium">{numbers.length} số</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Mệnh giá:</span>
              <span className="font-medium">
                {formatCurrency(denomination)}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-700 mb-2">Thông tin thanh toán</h3>
        <ul className="space-y-2">
          <li className="flex justify-between text-sm">
            <span className="text-gray-600">Tổng tiền đặt:</span>
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </li>
          <li className="flex justify-between text-sm">
            <span className="text-gray-600">Tiềm năng thắng:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(potentialWin)}
            </span>
          </li>
          <li className="flex justify-between items-center mt-4 pt-2 border-t">
            <span className="font-medium">Tổng cần thanh toán:</span>
            <span className="text-xl font-bold text-lottery-primary">
              {formatCurrency(totalAmount)}
            </span>
          </li>
        </ul>
      </div>

      {!isBalanceEnough && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
          <p className="text-red-600 text-sm">
            Số dư hiện tại không đủ để đặt cược. Vui lòng nạp thêm tiền.
          </p>
        </div>
      )}
    </div>
  );
}
