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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberGrid } from "./number-grid";
import { ZodiacSelection } from "./zodiac-selection";
import { PermutationSelection } from "./permutation-selection";
import { HighLowEvenOddSelection } from "./highlow-evenodd-selection";
import { SequenceSelection } from "./sequence-selection";
import { useBetContext } from "@/contexts/BetContext";
import { AlertCircle, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "../ui/badge";

export function BetTypeSelection() {
  const { methods } = useBetContext();

  const regionType = methods.watch("regionType");
  const betType = methods.watch("betType");
  const betVariant = methods.watch("betVariant");
  const denomination = methods.watch("denomination") || 10000;
  const selectionMethod = methods.watch("selectionMethod") || "manual";
  const numbers = methods.watch("numbers") || [];

  // State để lưu trữ các biến thể của loại cược đang chọn
  const [availableVariants, setAvailableVariants] = useState<any[]>([]);
  const [currentBetTypeData, setCurrentBetTypeData] = useState<any>(null);
  const [digitCount, setDigitCount] = useState<number>(2);
  const [showHelpCard, setShowHelpCard] = useState(false);

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

  // Lấy mô tả loại cược
  const getBetTypeDescription = () => {
    if (!betType || !filteredBetTypes) return "";

    const betTypeInfo = filteredBetTypes.find(
      (bet) => bet.bet_type_id === betType
    );

    return betTypeInfo?.description || "";
  };

  // Lấy mô tả biến thể
  const getVariantDescription = () => {
    if (!betVariant || availableVariants.length === 0) return "";

    const variant = availableVariants.find((v: any) => v.id === betVariant);
    return variant?.description || "";
  };

  // Lấy tỷ lệ thưởng
  const getWinningRatio = () => {
    if (!currentBetTypeData) return "N/A";

    // Parse winning_ratio từ JSON nếu cần
    const winningRatio =
      typeof currentBetTypeData.winning_ratio === "string"
        ? JSON.parse(currentBetTypeData.winning_ratio)
        : currentBetTypeData.winning_ratio;

    if (typeof winningRatio === "number") {
      return `1:${winningRatio}`;
    } else if (betVariant && typeof winningRatio === "object") {
      const ratio = winningRatio[betVariant];
      if (typeof ratio === "number") {
        return `1:${ratio}`;
      } else if (typeof ratio === "object") {
        // Đối với cược có nhiều tỷ lệ (như đá)
        return "Nhiều tỷ lệ";
      }
    }

    return "N/A";
  };

  // Render card trợ giúp cho loại cược
  const renderHelpCard = () => {
    if (!betType || !currentBetTypeData) return null;

    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-700 text-base">
              Thông tin {currentBetTypeData.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-blue-700"
              onClick={() => setShowHelpCard(false)}
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-blue-600">
            Cách thức và quy tắc đặt cược
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>{getBetTypeDescription()}</p>
          {betVariant && (
            <div className="pt-1">
              <p className="font-medium">
                Biến thể{" "}
                {availableVariants.find((v: any) => v.id === betVariant)?.name}:
              </p>
              <p>{getVariantDescription()}</p>
            </div>
          )}
          <div className="pt-1">
            <p className="font-medium">Tỷ lệ thưởng: {getWinningRatio()}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Thay đổi danh sách số được chọn
  const handleNumbersChange = (newNumbers: string[]) => {
    methods.setValue("numbers", newNumbers);
  };

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
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm text-gray-500 truncate">
                {getBetTypeDescription().substring(0, 40)}
                {getBetTypeDescription().length > 40 ? "..." : ""}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowHelpCard(!showHelpCard)}
              >
                <HelpCircle className="h-3 w-3 mr-1" /> Chi tiết
              </Button>
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
              <div className="mt-2 text-sm text-gray-500 truncate">
                {getVariantDescription().substring(0, 60)}
                {getVariantDescription().length > 60 ? "..." : ""}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card thông tin trợ giúp */}
      {showHelpCard && renderHelpCard()}

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

      {/* Bảng số (hiển thị chung) */}
      {betType && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-gray-700">
              Chọn số cược ({digitCount} chữ số)
            </Label>
            {numbers.length > 0 && (
              <Badge variant="outline" className="bg-gray-50">
                Đã chọn {numbers.length} số
              </Badge>
            )}
          </div>

          {/* Hiển thị bảng số chung */}
          <Card>
            <CardContent className="p-4">
              <NumberGrid
                selectedNumbers={numbers}
                onChange={handleNumbersChange}
                digitCount={digitCount}
              />
            </CardContent>
          </Card>

          {/* Phần trợ giúp chọn số */}
          <Card>
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-base">
                Công cụ hỗ trợ chọn số
              </CardTitle>
              <CardDescription>
                Chọn phương pháp để nhanh chóng thêm nhiều số cùng lúc
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-4">
              <Tabs
                value={selectionMethod}
                onValueChange={(value) =>
                  methods.setValue("selectionMethod", value)
                }
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="zodiac">12 Con Giáp</TabsTrigger>
                  <TabsTrigger value="permutation">Đảo Số</TabsTrigger>
                  <TabsTrigger value="highlow">Tài/Xỉu & Chẵn/Lẻ</TabsTrigger>
                  <TabsTrigger value="sequence">Kéo Số</TabsTrigger>
                </TabsList>

                <TabsContent value="zodiac">
                  <ZodiacSelection />
                </TabsContent>

                <TabsContent value="permutation">
                  <PermutationSelection digitCount={digitCount} />
                </TabsContent>

                <TabsContent value="highlow">
                  <HighLowEvenOddSelection />
                </TabsContent>

                <TabsContent value="sequence">
                  <SequenceSelection />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t px-4 py-3 bg-gray-50">
              <Alert className="w-full" variant="default">
                <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                <AlertDescription className="text-xs text-gray-600">
                  Các công cụ hỗ trợ sẽ thêm số vào bảng số ở trên. Bạn có thể
                  kết hợp nhiều phương pháp chọn số.
                </AlertDescription>
              </Alert>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
