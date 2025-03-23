"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  betTypeSchema,
  BetTypeFormValues,
} from "@/lib/validators/bet-types-validator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { BetTypeVariantsEditor } from "@/components/admin/bet-type-variants-editor";
import { BetTypeRegionRulesEditor } from "@/components/admin/bet-type-region-rules-editor";
import { BetTypeWinningRatioEditor } from "@/components/admin/bet-type-winning-ratio-editor";
import { useCreateBetType } from "@/lib/hooks/use-bet-types";
import { ArrowLeft, Loader2, PlusCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NewBetTypePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const createBetType = useCreateBetType();

  const form = useForm<BetTypeFormValues>({
    resolver: zodResolver(betTypeSchema),
    defaultValues: {
      bet_type_id: "",
      name: "",
      description: "",
      is_active: true,
      digit_count: 2,
      region_rules: {
        M1: {
          betMultipliers: 1,
          combinationCount: 1,
          winningRules: "Số cược khớp với số trong kết quả xổ số",
        },
        M2: {
          betMultipliers: 1,
          combinationCount: 1,
          winningRules: "Số cược khớp với số trong kết quả xổ số",
        },
      },
      variants: [],
      winning_ratio: 75,
    },
  });

  const onSubmit = async (data: BetTypeFormValues) => {
    try {
      await createBetType.mutateAsync(data);

      toast({
        title: "Thành công",
        description: "Tạo loại cược mới thành công",
      });

      // Redirect to the bet types list
      router.push("/admin/bet-types");
    } catch (error) {
      console.error("Error creating bet type:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tạo loại cược. Vui lòng thử lại!",
        variant: "destructive",
      });
    }
  };

  const betTypeIdValue = form.watch("bet_type_id");
  const nameValue = form.watch("name");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/bet-types")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Thêm loại cược mới</h1>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/bet-types")}
          >
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createBetType.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {createBetType.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Tạo loại cược
              </>
            )}
          </Button>
        </div>
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <AlertTitle className="text-blue-800">
          Hướng dẫn tạo loại cược mới
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          Điền thông tin cơ bản ở tab &quot;Thông tin chung&quot;, sau đó chuyển
          sang các tab khác để thiết lập biến thể, quy tắc theo miền và tỷ lệ
          thưởng. Mỗi loại cược cần có ít nhất một tỷ lệ thưởng.
        </AlertDescription>
      </Alert>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="general" className="text-base">
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger value="variants" className="text-base">
              Biến thể cược
            </TabsTrigger>
            <TabsTrigger value="regions" className="text-base">
              Quy tắc theo miền
            </TabsTrigger>
            <TabsTrigger value="winning_ratio" className="text-base">
              Tỷ lệ thưởng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bet_type_id" className="font-medium">
                      ID loại cược <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="bet_type_id"
                      {...form.register("bet_type_id")}
                      placeholder="dd, xc, b2..."
                      className="font-mono"
                    />
                    {form.formState.errors.bet_type_id && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.bet_type_id.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Mã ID ngắn gọn, không dấu, không khoảng trắng. VD: dd, xc,
                      b2, etc.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium">
                      Tên loại cược <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Đầu Đuôi, Xỉu Chủ..."
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Tên đầy đủ của loại cược. VD: Đầu Đuôi, Xỉu Chủ
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="digit_count" className="font-medium">
                      Số chữ số
                    </Label>
                    <Input
                      id="digit_count"
                      type="number"
                      min={1}
                      max={6}
                      {...form.register("digit_count", {
                        valueAsNumber: true,
                      })}
                    />
                    <p className="text-sm text-gray-500">
                      Số chữ số mặc định cho loại cược này. VD: 2 cho Đầu Đuôi,
                      3 cho Xỉu Chủ
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="is_active"
                      checked={form.watch("is_active")}
                      onCheckedChange={(checked) =>
                        form.setValue("is_active", checked)
                      }
                    />
                    <div>
                      <Label
                        htmlFor="is_active"
                        className="mb-1 block font-medium"
                      >
                        Kích hoạt
                      </Label>
                      <p className="text-sm text-gray-500">
                        Loại cược này sẽ hiển thị trên form đặt cược
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="description" className="font-medium">
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    rows={4}
                    placeholder="Nhập mô tả chi tiết về loại cược này..."
                  />
                  <p className="text-sm text-gray-500">
                    Mô tả cách thức hoạt động của loại cược này
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants">
            <BetTypeVariantsEditor
              value={form.watch("variants")}
              onChange={(variants) => form.setValue("variants", variants)}
            />

            {betTypeIdValue &&
              (betTypeIdValue === "dd" || betTypeIdValue === "xc") &&
              form.watch("variants").length === 0 && (
                <Alert className="mt-4 bg-amber-50 border-amber-200">
                  <AlertTitle className="text-amber-800">
                    Gợi ý cho loại cược {nameValue || betTypeIdValue}
                  </AlertTitle>
                  <AlertDescription className="text-amber-700">
                    {betTypeIdValue === "dd" ? (
                      <>
                        Loại cược Đầu Đuôi thường có các biến thể:
                        &quot;dd&quot; (đầu đuôi), &quot;dau&quot; (chỉ đầu),
                        &quot;duoi&quot; (chỉ đuôi).
                      </>
                    ) : (
                      <>
                        Loại cược Xỉu Chủ thường có các biến thể: &quot;xc&quot;
                        (xỉu chủ), &quot;dau&quot; (chỉ đầu), &quot;duoi&quot;
                        (chỉ đuôi).
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

            {betTypeIdValue &&
              betTypeIdValue === "bao_lo" &&
              form.watch("variants").length === 0 && (
                <Alert className="mt-4 bg-amber-50 border-amber-200">
                  <AlertTitle className="text-amber-800">
                    Gợi ý cho loại cược Bao Lô
                  </AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Loại cược Bao Lô thường có các biến thể: &quot;b2&quot; (bao
                    lô 2), &quot;b3&quot; (bao lô 3), &quot;b4&quot; (bao lô 4)
                    tương ứng với số chữ số.
                  </AlertDescription>
                </Alert>
              )}
          </TabsContent>

          <TabsContent value="regions">
            <BetTypeRegionRulesEditor
              value={form.watch("region_rules")}
              onChange={(rules) => form.setValue("region_rules", rules)}
              betTypeId={form.watch("bet_type_id")}
              variants={form.watch("variants")}
            />
          </TabsContent>

          <TabsContent value="winning_ratio">
            <BetTypeWinningRatioEditor
              value={form.watch("winning_ratio")}
              onChange={(ratio) => form.setValue("winning_ratio", ratio)}
              variants={form.watch("variants")}
              betTypeId={form.watch("bet_type_id")}
            />

            {betTypeIdValue && betTypeIdValue === "da" && (
              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertTitle className="text-amber-800">
                  Gợi ý cho tỷ lệ thưởng loại cược Đá
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  Loại cược Đá có tỷ lệ thưởng phức tạp với nhiều trường hợp.
                  Chuyển sang chế độ &quot;Phức tạp&quot; và thiết lập cho từng
                  biến thể (da2, da3, da4, da5) với các điều kiện như
                  &quot;2_numbers&quot;, &quot;3_numbers&quot;,
                  &quot;3_numbers_1_number_2_times&quot;, v.v.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6 space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/bet-types")}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={createBetType.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {createBetType.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Tạo loại cược
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
