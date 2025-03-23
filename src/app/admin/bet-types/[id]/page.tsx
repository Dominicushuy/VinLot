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
import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function BetTypeEditPage() {
  // Sử dụng useParams hook để lấy tham số URL
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  // Reset success state when form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setSaveSuccess(false);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: BetTypeFormValues) => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);

      // Validate winning ratio
      if (!winningRatioValidator(data.winning_ratio)) {
        toast({
          title: "Lỗi",
          description: "Tỷ lệ thưởng không hợp lệ. Vui lòng kiểm tra lại.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      await updateBetType.mutateAsync(data);

      setSaveSuccess(true);
      toast({
        title: "Thành công",
        description: "Cập nhật loại cược thành công",
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error updating bet type:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật loại cược. Vui lòng thử lại!",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Chỉnh sửa loại cược
            </h1>
            <div className="flex items-center mt-1">
              <Badge
                variant="outline"
                className="mr-2 bg-blue-50 text-blue-700 border-blue-200"
              >
                {betType?.bet_type_id}
              </Badge>
              <span className="text-gray-500 text-sm">{betType?.name}</span>
            </div>
          </div>
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
            disabled={isSaving || saveSuccess}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Đã lưu
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Đã lưu thành công</AlertTitle>
          <AlertDescription className="text-green-700">
            Thông tin loại cược đã được cập nhật thành công và đã có hiệu lực
            trên hệ thống.
          </AlertDescription>
        </Alert>
      )}

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
                    <Label htmlFor="bet_type_id">ID loại cược</Label>
                    <Input
                      id="bet_type_id"
                      {...form.register("bet_type_id")}
                      disabled={params.id !== "new"}
                      className="font-mono"
                    />
                    {form.formState.errors.bet_type_id && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.bet_type_id.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      ID duy nhất để phân biệt loại cược này
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
                      Tên hiển thị đầy đủ của loại cược
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="digit_count">Số chữ số</Label>
                    <Input
                      id="digit_count"
                      type="number"
                      {...form.register("digit_count", {
                        valueAsNumber: true,
                      })}
                    />
                    <p className="text-sm text-gray-500">
                      Số chữ số mặc định cho loại cược này (2, 3, 4, ...)
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
                      <Label htmlFor="is_active" className="mb-1 block">
                        Kích hoạt
                      </Label>
                      <p className="text-sm text-gray-500">
                        Khi tắt, loại cược này sẽ không hiển thị cho người dùng
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    rows={4}
                    placeholder="Nhập mô tả chi tiết về loại cược này..."
                  />
                  <p className="text-sm text-gray-500">
                    Mô tả chi tiết giúp người dùng hiểu rõ cách thức hoạt động
                    của loại cược
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
            disabled={isSaving || saveSuccess}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Đã lưu
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
