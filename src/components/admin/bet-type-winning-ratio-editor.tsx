"use client";

import { useState } from "react";
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

  // For complex ratio view
  const renderComplexRatioView = () => {
    return (
      <div className="space-y-6">
        <div className="flex space-x-4 items-center">
          <div className="w-full md:w-1/3">
            <Label>Chọn biến thể</Label>
            <Select value={selectedVariant} onValueChange={setSelectedVariant}>
              <SelectTrigger>
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

          <div className="flex-1">
            <Label>Thêm điều kiện mới</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Tên điều kiện (ví dụ: 3_numbers)"
                value={newConditionName}
                onChange={(e) => setNewConditionName(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => handleAddCondition(selectedVariant)}
              >
                Thêm
              </Button>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {variantsList.map((variant) => (
            <AccordionItem key={variant.id} value={variant.id}>
              <AccordionTrigger className="font-medium">
                Tỷ lệ thưởng cho biến thể: {variant.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-2">
                  {/* If variant ratio is a simple number */}
                  {typeof value[variant.id] === "number" && (
                    <div className="flex space-x-4 items-center">
                      <div className="flex-1">
                        <Label htmlFor={`ratio-${variant.id}`}>
                          Tỷ lệ cơ bản (1:X)
                        </Label>
                        <Input
                          id={`ratio-${variant.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={value[variant.id] || ""}
                          onChange={(e) =>
                            handleVariantRatioChange(variant.id, e.target.value)
                          }
                          placeholder="Nhập tỷ lệ thưởng"
                        />
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddCondition(variant.id)}
                        >
                          Thêm điều kiện
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* If variant ratio is an object with conditions */}
                  {typeof value[variant.id] === "object" && (
                    <div className="space-y-4">
                      {Object.keys(value[variant.id]).map((conditionId) => (
                        <div
                          key={conditionId}
                          className="flex space-x-4 items-center"
                        >
                          <div className="w-1/3">
                            <Label
                              htmlFor={`ratio-${variant.id}-${conditionId}`}
                            >
                              {conditionId === "default"
                                ? "Tỷ lệ cơ bản"
                                : `Điều kiện: ${conditionId}`}
                            </Label>
                          </div>
                          <div className="flex-1">
                            <Input
                              id={`ratio-${variant.id}-${conditionId}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={value[variant.id][conditionId] || ""}
                              onChange={(e) =>
                                handleConditionRatioChange(
                                  variant.id,
                                  conditionId,
                                  e.target.value
                                )
                              }
                              placeholder="Nhập tỷ lệ thưởng"
                            />
                          </div>
                          {conditionId !== "default" && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleRemoveCondition(variant.id, conditionId)
                              }
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* If this variant has no ratio set yet */}
                  {!value[variant.id] && (
                    <div className="flex space-x-4 items-center">
                      <div className="flex-1">
                        <Label htmlFor={`ratio-${variant.id}`}>
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
      <CardHeader>
        <CardTitle>Tỷ lệ thưởng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại tỷ lệ thưởng</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={
                    winningRatioType === "simple" ? "default" : "outline"
                  }
                  onClick={() => setWinningRatioType("simple")}
                >
                  Đơn giản (1:X)
                </Button>
                <Button
                  type="button"
                  variant={
                    winningRatioType === "complex" ? "default" : "outline"
                  }
                  onClick={handleSwitchToComplex}
                >
                  Phức tạp (theo biến thể/điều kiện)
                </Button>
              </div>
            </div>
          </div>

          {winningRatioType === "simple" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="simple-ratio">Tỷ lệ thưởng cơ bản (1:X)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="simple-ratio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={typeof value === "number" ? value : ""}
                    onChange={(e) => handleSimpleRatioChange(e.target.value)}
                    placeholder="Nhập tỷ lệ thưởng"
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
