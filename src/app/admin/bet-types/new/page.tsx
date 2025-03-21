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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Thêm loại cược mới</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/bet-types")}
          >
            Hủy
          </Button>
          <Button
            variant="lottery"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createBetType.isPending}
          >
            {createBetType.isPending ? "Đang lưu..." : "Tạo loại cược"}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="variants">Biến thể cược</TabsTrigger>
            <TabsTrigger value="regions">Quy tắc theo miền</TabsTrigger>
            <TabsTrigger value="winning_ratio">Tỷ lệ thưởng</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bet_type_id">ID loại cược</Label>
                    <Input id="bet_type_id" {...form.register("bet_type_id")} />
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
                    <Label htmlFor="name">Tên loại cược</Label>
                    <Input id="name" {...form.register("name")} />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="digit_count">Số chữ số</Label>
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
                    <Label htmlFor="is_active">Kích hoạt</Label>
                    <p className="text-sm text-gray-500 ml-2">
                      Loại cược này sẽ hiển thị trên form đặt cược
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
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
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
