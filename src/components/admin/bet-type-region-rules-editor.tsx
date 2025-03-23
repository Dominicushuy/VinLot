"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, PlusCircle, Trash2 } from "lucide-react";

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
  const [newRuleKey, setNewRuleKey] = useState("");

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

  const handleAddWinningRule = (region: string) => {
    if (!newRuleKey.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên quy tắc không được để trống",
        variant: "destructive",
      });
      return;
    }

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
      const originalRule = newRules[region].winningRules;
      newRules[region].winningRules = { default: originalRule };
    }

    // Add new rule
    newRules[region].winningRules[newRuleKey] = "";
    onChange(newRules);
    setNewRuleKey("");

    toast({
      title: "Thành công",
      description: `Đã thêm quy tắc "${newRuleKey}" cho miền ${region}`,
    });
  };

  const handleRemoveWinningRule = (region: string, key: string) => {
    const newRules = { ...currentValue };
    if (!newRules[region] || typeof newRules[region].winningRules !== "object")
      return;

    delete newRules[region].winningRules[key];

    // If only one rule left, convert back to string
    const remainingRules = Object.keys(newRules[region].winningRules);
    if (remainingRules.length === 1 && remainingRules[0] === "default") {
      newRules[region].winningRules = newRules[region].winningRules.default;
    }

    onChange(newRules);
    toast({
      title: "Thành công",
      description: `Đã xóa quy tắc "${key}" khỏi miền ${region}`,
    });
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

  const regionLabels = {
    M1: "Miền Nam & Trung",
    M2: "Miền Bắc",
  };

  const variantsList = getVariantsList();

  return (
    <Card>
      <CardHeader className="bg-green-50 border-b">
        <CardTitle>Quy tắc cược theo miền</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeRegion} onValueChange={setActiveRegion}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="M1" className="text-base">
              M1 (Miền Nam & Trung)
            </TabsTrigger>
            <TabsTrigger value="M2" className="text-base">
              M2 (Miền Bắc)
            </TabsTrigger>
          </TabsList>

          {["M1", "M2"].map((region) => (
            <TabsContent key={region} value={region}>
              <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <InfoIcon className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    Thiết lập cấu hình cho{" "}
                    {regionLabels[region as keyof typeof regionLabels]}
                  </AlertTitle>
                  <AlertDescription className="text-green-700 text-sm">
                    Quy tắc sẽ được áp dụng riêng cho tất cả các tỉnh thuộc miền{" "}
                    {regionLabels[region as keyof typeof regionLabels]}.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Hệ số nhân</h3>

                    {/* Simple multiplier option */}
                    <div className="border rounded-md p-4 bg-white">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Hệ số nhân chung
                        </Label>
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
                            className="flex-1"
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
                            className="whitespace-nowrap"
                          >
                            Chi tiết theo biến thể
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Nhập một giá trị chung nếu tất cả các biến thể có cùng
                          hệ số nhân
                        </p>
                      </div>
                    </div>

                    {/* Detailed multipliers */}
                    {typeof currentValue[region]?.betMultipliers ===
                      "object" && (
                      <div className="border rounded-md p-4 bg-white">
                        <h4 className="font-medium mb-4">
                          Hệ số theo biến thể
                        </h4>
                        <div className="space-y-4">
                          {variantsList.map((variant) => (
                            <div
                              key={variant.id}
                              className="grid grid-cols-2 gap-4 items-center"
                            >
                              <div>
                                <Label
                                  htmlFor={`multiplier-${region}-${variant.id}`}
                                  className="text-sm font-medium"
                                >
                                  {variant.name}
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
                                  className="text-sm font-medium"
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
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Quy tắc thắng</h3>

                    {/* Simple winning rule */}
                    <div className="border rounded-md p-4 bg-white">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">
                            Quy tắc thắng chung
                          </Label>
                          {typeof currentValue[region]?.winningRules ===
                          "string" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newRules = { ...currentValue };
                                if (newRules[region]) {
                                  newRules[region].winningRules = {
                                    default:
                                      newRules[region].winningRules || "",
                                  };
                                }
                                onChange(newRules);
                              }}
                              className="text-xs"
                            >
                              Chuyển sang chi tiết
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newRules = { ...currentValue };
                                if (
                                  newRules[region] &&
                                  typeof newRules[region].winningRules ===
                                    "object"
                                ) {
                                  newRules[region].winningRules =
                                    newRules[region].winningRules.default ||
                                    "Số cược khớp với giải";
                                }
                                onChange(newRules);
                              }}
                              className="text-xs"
                            >
                              Chuyển sang mô tả chung
                            </Button>
                          )}
                        </div>

                        {typeof currentValue[region]?.winningRules ===
                        "string" ? (
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
                          <div className="border rounded p-2 bg-gray-50 text-sm text-gray-600">
                            Đang sử dụng quy tắc chi tiết
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed winning rules */}
                    {typeof currentValue[region]?.winningRules === "object" && (
                      <div className="border rounded-md p-4 bg-white">
                        <h4 className="font-medium mb-3">
                          Chi tiết quy tắc thắng
                        </h4>

                        <div className="space-y-4">
                          {/* Default rule */}
                          {currentValue[region]?.winningRules?.default && (
                            <div className="space-y-2">
                              <Label
                                htmlFor={`rule-default-${region}`}
                                className="text-sm font-medium"
                              >
                                Quy tắc mặc định
                              </Label>
                              <Textarea
                                id={`rule-default-${region}`}
                                value={
                                  currentValue[region]?.winningRules?.default ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleChangeWinningRule(
                                    region,
                                    "default",
                                    e.target.value
                                  )
                                }
                                placeholder="Mô tả quy tắc thắng mặc định"
                                rows={2}
                              />
                            </div>
                          )}

                          {/* Đầu rule */}
                          {["dd", "xc"].includes(betTypeId) && (
                            <div className="space-y-2">
                              <Label
                                htmlFor={`rule-dau-${region}`}
                                className="text-sm font-medium"
                              >
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
                          )}

                          {/* Đuôi rule */}
                          {["dd", "xc"].includes(betTypeId) && (
                            <div className="space-y-2">
                              <Label
                                htmlFor={`rule-duoi-${region}`}
                                className="text-sm font-medium"
                              >
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
                          )}

                          {/* Custom rules */}
                          {currentValue[region]?.winningRules &&
                            Object.keys(currentValue[region].winningRules)
                              .filter(
                                (key) =>
                                  !["dau", "duoi", "default"].includes(key)
                              )
                              .map((key) => (
                                <div
                                  key={key}
                                  className="space-y-2 border-t pt-4"
                                >
                                  <div className="flex justify-between items-center">
                                    <Label
                                      htmlFor={`rule-${key}-${region}`}
                                      className="text-sm font-medium"
                                    >
                                      Quy tắc: {key}
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveWinningRule(region, key)
                                      }
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Textarea
                                    id={`rule-${key}-${region}`}
                                    value={
                                      currentValue[region]?.winningRules?.[
                                        key
                                      ] || ""
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

                          {/* Add new rule */}
                          <div className="space-y-2 border-t pt-4">
                            <Label
                              htmlFor={`rule-custom-${region}`}
                              className="text-sm font-medium"
                            >
                              Thêm quy tắc mới
                            </Label>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Tên quy tắc mới"
                                value={newRuleKey}
                                onChange={(e) => setNewRuleKey(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleAddWinningRule(region)}
                                className="whitespace-nowrap"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Thêm
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
