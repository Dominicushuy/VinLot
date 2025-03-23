// src/components/bet-form/bet-type-selection.tsx
"use client";

import { useEffect, useState } from "react";
import { useBetTypes } from "@/lib/hooks/use-bet-types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BetNumberInput } from "./bet-number-input";
import { ZodiacSelection } from "./zodiac-selection";
import { PermutationSelection } from "./permutation-selection";
import { HighLowEvenOddSelection } from "./highlow-evenodd-selection";
import { SequenceSelection } from "./sequence-selection";
import { useBetContext } from "@/contexts/BetContext";

export function BetTypeSelection() {
  const { methods } = useBetContext();

  const regionType = methods.watch("regionType");
  const betType = methods.watch("betType");
  const betVariant = methods.watch("betVariant");
  const denomination = methods.watch("denomination") || 10000;
  const selectionMethod = methods.watch("selectionMethod") || "manual";

  // State để lưu trữ các biến thể của loại cược đang chọn
  const [availableVariants, setAvailableVariants] = useState<any[]>([]);
  const [currentBetTypeData, setCurrentBetTypeData] = useState<any>(null);
  const [digitCount, setDigitCount] = useState<number>(2);

  // Lấy danh sách loại cược từ API
  const { data: betTypes, isLoading } = useBetTypes();

  // Lọc danh sách loại cược theo miền
  const filteredBetTypes = betTypes?.filter((bet) => {
    // Parse region_rules từ JSON nếu cần
    const regionRules =
      typeof bet.region_rules === "string"
        ? JSON.parse(bet.region_rules)
        : bet.region_rules;

    // Kiểm tra nếu loại cược hỗ trợ miền đã chọn
    return regionRules && regionRules[regionType];
  });

  // Cập nhật danh sách biến thể khi loại cược thay đổi
  useEffect(() => {
    if (!betType || !betTypes) {
      setAvailableVariants([]);
      setCurrentBetTypeData(null);
      return;
    }

    const selectedBetType = betTypes.find((bet) => bet.bet_type_id === betType);
    if (!selectedBetType) {
      setAvailableVariants([]);
      setCurrentBetTypeData(null);
      return;
    }

    setCurrentBetTypeData(selectedBetType);

    // Parse variants từ JSON nếu cần
    const variants =
      typeof selectedBetType.variants === "string"
        ? JSON.parse(selectedBetType.variants)
        : selectedBetType.variants || [];

    setAvailableVariants(variants);

    // Reset betVariant nếu không có trong danh sách mới
    if (
      variants.length > 0 &&
      !variants.some((v: any) => v.id === betVariant)
    ) {
      methods.setValue("betVariant", variants[0].id);
    } else if (variants.length === 0) {
      methods.setValue("betVariant", undefined);
    }

    // Reset numbers khi đổi loại cược
    methods.resetField("numbers");
  }, [betType, betTypes, methods, betVariant]);

  // Cập nhật số chữ số khi loại cược hoặc biến thể thay đổi
  useEffect(() => {
    if (!currentBetTypeData) return;

    let newDigitCount = currentBetTypeData.digit_count || 2;

    // Kiểm tra nếu có biến thể với digit_count riêng
    if (betVariant && availableVariants.length > 0) {
      const variant = availableVariants.find((v: any) => v.id === betVariant);
      if (variant && variant.digitCount) {
        newDigitCount = variant.digitCount;
      }
    }

    setDigitCount(newDigitCount);
  }, [currentBetTypeData, betVariant, availableVariants]);

  // Phần return giữ nguyên như code cũ
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Chọn loại cược và số tiền</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại cược
          </label>
          {isLoading ? (
            <p className="text-sm italic">Đang tải dữ liệu...</p>
          ) : (
            <Select
              value={betType}
              onValueChange={(value) => methods.setValue("betType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại cược" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {filteredBetTypes?.map((bet) => (
                    <SelectItem key={bet.bet_type_id} value={bet.bet_type_id}>
                      {bet.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          {betType && filteredBetTypes && (
            <div className="mt-2 text-sm text-gray-500">
              {
                filteredBetTypes.find((bet) => bet.bet_type_id === betType)
                  ?.description
              }
            </div>
          )}
        </div>

        {availableVariants.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biến thể cược
            </label>
            <Select
              value={betVariant}
              onValueChange={(value) => methods.setValue("betVariant", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn biến thể" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableVariants.map((variant: any) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {betVariant && (
              <div className="mt-2 text-sm text-gray-500">
                {
                  availableVariants.find((v: any) => v.id === betVariant)
                    ?.description
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phần mệnh giá */}
      <div>
        <Label
          htmlFor="denomination"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Mệnh giá (VNĐ)
        </Label>
        <div className="flex space-x-2">
          <Input
            id="denomination"
            type="number"
            min={1000}
            step={1000}
            value={denomination}
            onChange={(e) =>
              methods.setValue("denomination", Number(e.target.value))
            }
            className="flex-1"
          />
          <div className="flex space-x-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => methods.setValue("denomination", 5000)}
            >
              5k
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => methods.setValue("denomination", 10000)}
            >
              10k
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => methods.setValue("denomination", 50000)}
            >
              50k
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => methods.setValue("denomination", 100000)}
            >
              100k
            </Button>
          </div>
        </div>
      </div>

      {/* Phần chọn phương thức nhập số */}
      {betType && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Phương thức chọn số
          </Label>
          <Tabs
            value={selectionMethod}
            onValueChange={(value) =>
              methods.setValue("selectionMethod", value)
            }
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="manual">Nhập trực tiếp</TabsTrigger>
              <TabsTrigger value="zodiac">12 Con Giáp</TabsTrigger>
              <TabsTrigger value="permutation">Đảo Số</TabsTrigger>
              <TabsTrigger value="highlow">Tài/Xỉu & Chẵn/Lẻ</TabsTrigger>
              <TabsTrigger value="sequence">Kéo Số</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <Card>
                <CardContent className="pt-6">
                  <BetNumberInput digitCount={digitCount} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zodiac">
              <Card>
                <CardContent className="pt-6">
                  <ZodiacSelection />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permutation">
              <Card>
                <CardContent className="pt-6">
                  <PermutationSelection digitCount={digitCount} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="highlow">
              <Card>
                <CardContent className="pt-6">
                  <HighLowEvenOddSelection />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sequence">
              <Card>
                <CardContent className="pt-6">
                  <SequenceSelection />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
