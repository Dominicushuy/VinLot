"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface BetTypeRegionRulesEditorProps {
  value: any;
  onChange: (value: any) => void;
  betTypeId: string;
  variants: any[];
}

export function BetTypeRegionRulesEditor({
  value = {},
  onChange,
  betTypeId,
  variants = [],
}: BetTypeRegionRulesEditorProps) {
  const [activeRegion, setActiveRegion] = useState(
    Object.keys(value)[0] || "M1"
  );

  // Ensure we have both regions in the value object
  const currentValue = { ...value };
  if (!currentValue.M1) {
    currentValue.M1 = {
      betMultipliers: {},
      combinationCount: {},
      winningRules: {},
    };
  }

  if (!currentValue.M2) {
    currentValue.M2 = {
      betMultipliers: {},
      combinationCount: {},
      winningRules: {},
    };
  }

  const handleChangeMultiplier = (
    region: string,
    variantId: string,
    newValue: string
  ) => {
    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) return;

    const newRules = { ...currentValue };
    if (!newRules[region]) {
      newRules[region] = {
        betMultipliers: {},
        combinationCount: {},
        winningRules: {},
      };
    }

    if (typeof newRules[region].betMultipliers === "number") {
      // Convert from number to object if it was a single value
      newRules[region].betMultipliers = {
        [betTypeId]: newRules[region].betMultipliers,
      };
    }

    newRules[region].betMultipliers[variantId] = numValue;
    onChange(newRules);
  };

  const handleChangeCombinationCount = (
    region: string,
    variantId: string,
    newValue: string
  ) => {
    const numValue = parseInt(newValue, 10);
    if (isNaN(numValue)) return;

    const newRules = { ...currentValue };
    if (!newRules[region]) {
      newRules[region] = {
        betMultipliers: {},
        combinationCount: {},
        winningRules: {},
      };
    }

    if (typeof newRules[region].combinationCount === "number") {
      // Convert from number to object if it was a single value
      newRules[region].combinationCount = {
        [betTypeId]: newRules[region].combinationCount,
      };
    }

    newRules[region].combinationCount[variantId] = numValue;
    onChange(newRules);
  };

  const handleChangeWinningRule = (
    region: string,
    key: string,
    newValue: string
  ) => {
    const newRules = { ...currentValue };
    if (!newRules[region]) {
      newRules[region] = {
        betMultipliers: {},
        combinationCount: {},
        winningRules: {},
      };
    }

    if (typeof newRules[region].winningRules === "string") {
      // Convert from string to object
      newRules[region].winningRules = {};
    }

    newRules[region].winningRules[key] = newValue;
    onChange(newRules);
  };

  const handleSetSingleMultiplier = (region: string, newValue: string) => {
    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) return;

    const newRules = { ...currentValue };
    if (!newRules[region]) {
      newRules[region] = {
        betMultipliers: numValue,
        combinationCount: numValue,
        winningRules: "Số cược khớp với giải",
      };
    } else {
      newRules[region].betMultipliers = numValue;
      newRules[region].combinationCount = numValue;
    }

    onChange(newRules);
  };

  const getVariantsList = () => {
    // If we have explicit variants, use them
    if (variants.length > 0) {
      return variants.map((v) => ({
        id: v.id,
        name: v.name,
      }));
    }

    // Otherwise, try to extract from multipliers
    const result = [];
    const region = currentValue[activeRegion];

    if (region && typeof region.betMultipliers === "object") {
      Object.keys(region.betMultipliers).forEach((key) => {
        if (key !== betTypeId) {
          result.push({
            id: key,
            name: key, // We don't have the name, so use the ID
          });
        }
      });
    }

    // Add the main bet type ID if no variants
    if (result.length === 0 && betTypeId) {
      result.push({
        id: betTypeId,
        name: betTypeId,
      });
    }

    return result;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quy tắc cược theo miền</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeRegion} onValueChange={setActiveRegion}>
          <TabsList className="mb-6">
            <TabsTrigger value="M1">M1 (Miền Nam & Trung)</TabsTrigger>
            <TabsTrigger value="M2">M2 (Miền Bắc)</TabsTrigger>
          </TabsList>

          {["M1", "M2"].map((region) => (
            <TabsContent key={region} value={region}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hệ số nhân chung</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={
                          typeof currentValue[region]?.betMultipliers ===
                          "number"
                            ? currentValue[region].betMultipliers
                            : ""
                        }
                        onChange={(e) =>
                          handleSetSingleMultiplier(region, e.target.value)
                        }
                        placeholder="Hệ số nhân chung"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newRules = { ...currentValue };
                          if (newRules[region]) {
                            newRules[region].betMultipliers = {};
                            newRules[region].combinationCount = {};
                          }
                          onChange(newRules);
                        }}
                      >
                        Chuyển sang chi tiết
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Nhập một giá trị chung nếu tất cả các biến thể có cùng hệ
                      số nhân.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Quy tắc thắng chung</Label>
                    {typeof currentValue[region]?.winningRules === "string" ? (
                      <Textarea
                        value={currentValue[region]?.winningRules || ""}
                        onChange={(e) => {
                          const newRules = { ...currentValue };
                          if (!newRules[region]) {
                            newRules[region] = {
                              betMultipliers: 1,
                              combinationCount: 1,
                              winningRules: e.target.value,
                            };
                          } else {
                            newRules[region].winningRules = e.target.value;
                          }
                          onChange(newRules);
                        }}
                        placeholder="Mô tả quy tắc thắng"
                        rows={3}
                      />
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newRules = { ...currentValue };
                            if (newRules[region]) {
                              newRules[region].winningRules =
                                "Số cược khớp với giải";
                            }
                            onChange(newRules);
                          }}
                        >
                          Chuyển sang chuỗi chung
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chi tiết hệ số nhân và quy tắc theo biến thể */}
                {typeof currentValue[region]?.betMultipliers === "object" && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">
                      Chi tiết hệ số theo biến thể
                    </h3>
                    <div className="space-y-4">
                      {getVariantsList().map((variant) => (
                        <div
                          key={variant.id}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <div>
                            <Label>Biến thể {variant.name}</Label>
                          </div>
                          <div>
                            <Label
                              htmlFor={`multiplier-${region}-${variant.id}`}
                            >
                              Hệ số nhân
                            </Label>
                            <Input
                              id={`multiplier-${region}-${variant.id}`}
                              type="number"
                              step="0.1"
                              value={
                                currentValue[region]?.betMultipliers?.[
                                  variant.id
                                ] || ""
                              }
                              onChange={(e) =>
                                handleChangeMultiplier(
                                  region,
                                  variant.id,
                                  e.target.value
                                )
                              }
                              placeholder="Hệ số nhân"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`combination-${region}-${variant.id}`}
                            >
                              Số lần kết hợp
                            </Label>
                            <Input
                              id={`combination-${region}-${variant.id}`}
                              type="number"
                              value={
                                currentValue[region]?.combinationCount?.[
                                  variant.id
                                ] || ""
                              }
                              onChange={(e) =>
                                handleChangeCombinationCount(
                                  region,
                                  variant.id,
                                  e.target.value
                                )
                              }
                              placeholder="Số lần kết hợp"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chi tiết quy tắc thắng */}
                {typeof currentValue[region]?.winningRules === "object" && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-4">Chi tiết quy tắc thắng</h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`rule-dau-${region}`}>
                            Quy tắc đầu
                          </Label>
                          <Textarea
                            id={`rule-dau-${region}`}
                            value={
                              currentValue[region]?.winningRules?.dau || ""
                            }
                            onChange={(e) =>
                              handleChangeWinningRule(
                                region,
                                "dau",
                                e.target.value
                              )
                            }
                            placeholder="Mô tả quy tắc thắng cho đầu"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`rule-duoi-${region}`}>
                            Quy tắc đuôi
                          </Label>
                          <Textarea
                            id={`rule-duoi-${region}`}
                            value={
                              currentValue[region]?.winningRules?.duoi || ""
                            }
                            onChange={(e) =>
                              handleChangeWinningRule(
                                region,
                                "duoi",
                                e.target.value
                              )
                            }
                            placeholder="Mô tả quy tắc thắng cho đuôi"
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`rule-custom-${region}`}>
                          Thêm quy tắc
                        </Label>
                        <div className="flex space-x-2">
                          <Input placeholder="Tên quy tắc" id="new-rule-key" />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const keyInput = document.getElementById(
                                "new-rule-key"
                              ) as HTMLInputElement;
                              if (keyInput && keyInput.value) {
                                const key = keyInput.value;
                                handleChangeWinningRule(region, key, "");
                                keyInput.value = "";
                                toast({
                                  title: "Đã thêm quy tắc",
                                  description: `Đã thêm quy tắc "${key}"`,
                                });
                              }
                            }}
                          >
                            Thêm
                          </Button>
                        </div>
                      </div>

                      {/* Hiển thị các quy tắc tùy chỉnh khác */}
                      {currentValue[region]?.winningRules &&
                        Object.keys(currentValue[region].winningRules)
                          .filter((key) => key !== "dau" && key !== "duoi")
                          .map((key) => (
                            <div key={key} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label htmlFor={`rule-${key}-${region}`}>
                                  Quy tắc: {key}
                                </Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newRules = { ...currentValue };
                                    if (newRules[region]?.winningRules) {
                                      delete newRules[region].winningRules[key];
                                      onChange(newRules);
                                    }
                                  }}
                                >
                                  Xóa
                                </Button>
                              </div>
                              <Textarea
                                id={`rule-${key}-${region}`}
                                value={
                                  currentValue[region]?.winningRules?.[key] ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleChangeWinningRule(
                                    region,
                                    key,
                                    e.target.value
                                  )
                                }
                                placeholder={`Mô tả quy tắc thắng cho ${key}`}
                                rows={2}
                              />
                            </div>
                          ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
