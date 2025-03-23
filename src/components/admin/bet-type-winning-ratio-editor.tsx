"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, PlusCircle, Trash2 } from "lucide-react";

interface BetTypeWinningRatioEditorProps {
  value: any;
  onChange: (value: any) => void;
  variants: any[];
  betTypeId: string;
}

export function BetTypeWinningRatioEditor({
  value = {},
  onChange,
  variants = [],
  betTypeId,
}: BetTypeWinningRatioEditorProps) {
  const [winningRatioType, setWinningRatioType] = useState<
    "simple" | "complex"
  >(typeof value === "number" ? "simple" : "complex");
  const [selectedVariant, setSelectedVariant] = useState<string>(
    variants.length > 0 ? variants[0].id : betTypeId
  );
  const [newConditionName, setNewConditionName] = useState("");
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  // Update selected variant when variants change
  useEffect(() => {
    if (
      variants.length > 0 &&
      !variants.find((v) => v.id === selectedVariant)
    ) {
      setSelectedVariant(variants[0].id);
    }
  }, [variants, selectedVariant]);

  // Function to handle changing simple winning ratio
  const handleSimpleRatioChange = (newValue: string) => {
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue);
      setWinningRatioType("simple");
    }
  };

  // Function to handle changing to complex ratio
  const handleSwitchToComplex = () => {
    // If we're coming from a simple ratio, convert to complex
    if (typeof value === "number") {
      const complexValue: any = {};

      // If we have variants, set up an object for each variant
      if (variants.length > 0) {
        variants.forEach((variant) => {
          complexValue[variant.id] = value;
        });
      } else {
        // No variants, just use the betTypeId
        complexValue[betTypeId] = value;
      }

      onChange(complexValue);
    }

    setWinningRatioType("complex");
  };

  // Function to handle changing variant-specific ratio
  const handleVariantRatioChange = (variantId: string, newValue: string) => {
    const numValue = parseFloat(newValue);
    if (isNaN(numValue) || numValue <= 0) return;

    const newRatio = { ...value };
    newRatio[variantId] = numValue;
    onChange(newRatio);
  };

  // Function to handle changing condition-specific ratio
  const handleConditionRatioChange = (
    variantId: string,
    conditionId: string,
    newValue: string
  ) => {
    const numValue = parseFloat(newValue);
    if (isNaN(numValue) || numValue <= 0) return;

    const newRatio = { ...value };

    // If the variant value is a number, convert it to an object
    if (typeof newRatio[variantId] === "number") {
      const oldValue = newRatio[variantId];
      newRatio[variantId] = {
        default: oldValue,
      };
    } else if (!newRatio[variantId]) {
      newRatio[variantId] = {};
    }

    newRatio[variantId][conditionId] = numValue;
    onChange(newRatio);
  };

  // Function to add a new condition to a variant
  const handleAddCondition = (variantId: string) => {
    if (!newConditionName.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên điều kiện không được để trống",
        variant: "destructive",
      });
      return;
    }

    const newRatio = { ...value };

    // If the variant value is a number, convert it to an object
    if (typeof newRatio[variantId] === "number") {
      const oldValue = newRatio[variantId];
      newRatio[variantId] = {
        default: oldValue,
      };
    } else if (!newRatio[variantId]) {
      newRatio[variantId] = {};
    }

    // Add new condition
    newRatio[variantId][newConditionName] = 0;
    onChange(newRatio);
    setNewConditionName("");

    // Set the expanded variant
    setExpandedVariant(variantId);

    toast({
      title: "Thành công",
      description: `Đã thêm điều kiện "${newConditionName}" cho biến thể ${variantId}`,
    });
  };

  // Function to remove a condition
  const handleRemoveCondition = (variantId: string, conditionId: string) => {
    const newRatio = { ...value };

    if (typeof newRatio[variantId] === "object") {
      delete newRatio[variantId][conditionId];

      // If only one condition left, and it's "default", convert back to number
      const conditions = Object.keys(newRatio[variantId]);
      if (conditions.length === 1 && conditions[0] === "default") {
        newRatio[variantId] = newRatio[variantId].default;
      }

      onChange(newRatio);

      toast({
        title: "Thành công",
        description: `Đã xóa điều kiện "${conditionId}" khỏi biến thể ${variantId}`,
      });
    }
  };

  // Get list of variants
  const getVariantsList = () => {
    if (variants.length > 0) {
      return variants;
    }

    // If no variants provided but we have complex ratio, extract from there
    if (typeof value === "object") {
      return Object.keys(value).map((key) => ({
        id: key,
        name: key,
      }));
    }

    // Fallback to betTypeId
    return [{ id: betTypeId, name: betTypeId }];
  };

  const variantsList = getVariantsList();

  // Function to get variant display name
  const getVariantDisplayName = (variantId: string) => {
    const variant = variantsList.find((v) => v.id === variantId);
    return variant ? variant.name : variantId;
  };

  // For complex ratio view
  const renderComplexRatioView = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Chọn biến thể</Label>
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn biến thể" />
              </SelectTrigger>
              <SelectContent>
                {variantsList.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Thêm điều kiện mới</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Tên điều kiện (ví dụ: 3_numbers)"
                value={newConditionName}
                onChange={(e) => setNewConditionName(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => handleAddCondition(selectedVariant)}
                className="whitespace-nowrap"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Thêm
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Đặt tên theo định dạng ngắn gọn, có gạch dưới (VD: 3_numbers,
              all_matched)
            </p>
          </div>
        </div>

        {betTypeId === "da" && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-700">
              Lưu ý cho loại cược Đá (da)
            </AlertTitle>
            <AlertDescription className="text-blue-600 text-sm">
              Tỷ lệ thưởng phức tạp với nhiều trường hợp dựa vào số trúng và số
              lần xuất hiện. Đặt tên điều kiện theo cấu trúc: số_trúng + tùy
              chọn chi tiết (VD: 2_numbers, 3_numbers_1_number_2_times).
            </AlertDescription>
          </Alert>
        )}

        <Accordion
          type="single"
          collapsible
          className="w-full border rounded-md"
          value={expandedVariant || undefined}
          onValueChange={(value) => setExpandedVariant(value)}
        >
          {variantsList.map((variant) => (
            <AccordionItem
              key={variant.id}
              value={variant.id}
              className="border-b last:border-0"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 font-medium text-gray-800">
                <div className="flex items-center space-x-2">
                  <span>Tỷ lệ thưởng: {getVariantDisplayName(variant.id)}</span>
                  {typeof value[variant.id] === "object" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                      {Object.keys(value[variant.id]).length} điều kiện
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-4">
                <div className="space-y-4">
                  {/* If variant ratio is a simple number */}
                  {typeof value[variant.id] === "number" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`ratio-${variant.id}`}
                          className="text-sm font-medium"
                        >
                          Tỷ lệ cơ bản (1:X)
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id={`ratio-${variant.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={value[variant.id] || ""}
                            onChange={(e) =>
                              handleVariantRatioChange(
                                variant.id,
                                e.target.value
                              )
                            }
                            placeholder="Nhập tỷ lệ thưởng"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleAddCondition(variant.id)}
                            className="whitespace-nowrap"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Thêm điều kiện
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          VD: Giá trị 75 tương ứng tỷ lệ 1:75
                        </p>
                      </div>
                    </div>
                  )}

                  {/* If variant ratio is an object with conditions */}
                  {typeof value[variant.id] === "object" && (
                    <div className="space-y-4">
                      <div className="rounded-md border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                Điều kiện
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-1">
                                Tỷ lệ thưởng (1:X)
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Object.keys(value[variant.id]).map(
                              (conditionId) => (
                                <tr
                                  key={conditionId}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {conditionId === "default"
                                      ? "Tỷ lệ cơ bản"
                                      : conditionId}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    <Input
                                      id={`ratio-${variant.id}-${conditionId}`}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={
                                        value[variant.id][conditionId] || ""
                                      }
                                      onChange={(e) =>
                                        handleConditionRatioChange(
                                          variant.id,
                                          conditionId,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Nhập tỷ lệ thưởng"
                                    />
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                    {conditionId !== "default" && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleRemoveCondition(
                                            variant.id,
                                            conditionId
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAddCondition(variant.id)}
                          className="whitespace-nowrap"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Thêm điều kiện
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* If this variant has no ratio set yet */}
                  {!value[variant.id] && (
                    <div className="flex space-x-4 items-center">
                      <div className="flex-1">
                        <Label
                          htmlFor={`ratio-${variant.id}`}
                          className="text-sm font-medium"
                        >
                          Tỷ lệ cơ bản (1:X)
                        </Label>
                        <Input
                          id={`ratio-${variant.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          onChange={(e) =>
                            handleVariantRatioChange(variant.id, e.target.value)
                          }
                          placeholder="Nhập tỷ lệ thưởng"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle>Tỷ lệ thưởng</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Loại tỷ lệ thưởng</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={
                    winningRatioType === "simple" ? "default" : "outline"
                  }
                  onClick={() => setWinningRatioType("simple")}
                  className="flex-1 md:flex-none"
                >
                  Đơn giản (1:X)
                </Button>
                <Button
                  type="button"
                  variant={
                    winningRatioType === "complex" ? "default" : "outline"
                  }
                  onClick={handleSwitchToComplex}
                  className="flex-1 md:flex-none"
                >
                  Phức tạp (theo biến thể/điều kiện)
                </Button>
              </div>
            </div>
          </div>

          {winningRatioType === "simple" ? (
            <div className="space-y-4 bg-white p-4 rounded-md border">
              <div className="space-y-2">
                <Label htmlFor="simple-ratio" className="text-sm font-medium">
                  Tỷ lệ thưởng cơ bản (1:X)
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="simple-ratio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={typeof value === "number" ? value : ""}
                    onChange={(e) => handleSimpleRatioChange(e.target.value)}
                    placeholder="Nhập tỷ lệ thưởng"
                    className="w-full md:w-1/3"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Ví dụ: Nếu nhập 75, tỷ lệ thưởng sẽ là 1:75
                </p>
              </div>
            </div>
          ) : (
            renderComplexRatioView()
          )}
        </div>
      </CardContent>
    </Card>
  );
}
