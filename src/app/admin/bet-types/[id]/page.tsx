"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBetTypeDetails, useUpdateBetType } from "@/lib/hooks/use-bet-types";
import {
  betTypeSchema,
  BetTypeFormValues,
  winningRatioValidator,
} from "@/lib/validators/bet-types-validator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BetTypeVariantsEditor } from "@/components/admin/bet-type-variants-editor";
import { BetTypeRegionRulesEditor } from "@/components/admin/bet-type-region-rules-editor";
import { BetTypeWinningRatioEditor } from "@/components/admin/bet-type-winning-ratio-editor";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function BetTypeEditPage() {
  // Sử dụng useParams hook để lấy tham số URL
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");

  const { data: betType, isLoading } = useBetTypeDetails(id);
  const updateBetType = useUpdateBetType();

  const form = useForm<BetTypeFormValues>({
    resolver: zodResolver(betTypeSchema),
    defaultValues: {
      id: "",
      bet_type_id: "",
      name: "",
      description: "",
      is_active: true,
      digit_count: undefined,
      region_rules: {},
      variants: [],
      winning_ratio: {},
    },
  });

  // Populate form when bet type data is loaded
  useEffect(() => {
    if (betType) {
      form.reset({
        id: betType.id,
        bet_type_id: betType.bet_type_id,
        name: betType.name,
        description: betType.description || "",
        is_active: betType.is_active !== false,
        digit_count: betType.digit_count,
        region_rules: betType.region_rules,
        variants: betType.variants || [],
        winning_ratio: betType.winning_ratio,
      });
    }
  }, [betType, form]);

  const onSubmit = async (data: BetTypeFormValues) => {
    try {
      // Validate winning ratio
      if (!winningRatioValidator(data.winning_ratio)) {
        toast({
          title: "Lỗi",
          description: "Tỷ lệ thưởng không hợp lệ. Vui lòng kiểm tra lại.",
          variant: "destructive",
        });
        return;
      }

      await updateBetType.mutateAsync(data);

      toast({
        title: "Thành công",
        description: "Cập nhật loại cược thành công",
      });

      // Redirect to the bet types list
      router.push("/admin/bet-types");
    } catch (error) {
      console.error("Error updating bet type:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật loại cược. Vui lòng thử lại!",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Chỉnh sửa loại cược: {betType?.name}
        </h1>
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
            disabled={updateBetType.isPending}
          >
            {updateBetType.isPending ? "Đang lưu..." : "Lưu thay đổi"}
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
                    <Input
                      id="bet_type_id"
                      {...form.register("bet_type_id")}
                      disabled={params.id !== "new"}
                    />
                    {form.formState.errors.bet_type_id && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.bet_type_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Tên loại cược</Label>
                    <Input id="name" {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="digit_count">Số chữ số</Label>
                    <Input
                      id="digit_count"
                      type="number"
                      {...form.register("digit_count", {
                        valueAsNumber: true,
                      })}
                    />
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
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    rows={4}
                  />
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
