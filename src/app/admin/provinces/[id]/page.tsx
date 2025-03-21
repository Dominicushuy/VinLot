// src/app/admin/provinces/[id]/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  useProvinceDetails,
  useUpdateProvince,
} from "@/lib/hooks/use-provinces";
import {
  provinceSchema,
  ProvinceFormValues,
} from "@/lib/validators/province-validator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProvinceDaysSelector } from "@/components/admin/province-days-selector";
import { Province } from "@/types";

export default function ProvinceEditPage() {
  // Sử dụng useParams hook để lấy tham số URL
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: province, isLoading } = useProvinceDetails(id);
  const updateProvince = useUpdateProvince();

  const form = useForm<ProvinceFormValues>({
    resolver: zodResolver(provinceSchema),
    defaultValues: {
      id: "",
      province_id: "",
      name: "",
      code: "",
      region: "mien-bac",
      region_type: "M2",
      draw_days: [],
      is_active: true,
    },
  });

  // Populate form when province data is loaded
  useEffect(() => {
    if (province) {
      form.reset({
        id: province.id,
        province_id: province.province_id,
        name: province.name,
        code: province.code || "",
        region: province.region,
        region_type: province.region_type,
        draw_days: province.draw_days,
        is_active: province.is_active !== false,
      });
    }
  }, [province, form]);

  const onSubmit = async (data: ProvinceFormValues) => {
    try {
      await updateProvince.mutateAsync(data as Province);

      toast({
        title: "Thành công",
        description: "Cập nhật đài xổ số thành công",
      });

      // Redirect to the provinces list
      router.push("/admin/provinces");
    } catch (error) {
      console.error("Error updating province:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật đài xổ số. Vui lòng thử lại!",
        variant: "destructive",
      });
    }
  };

  // Handle region type change based on region
  const handleRegionChange = (region: string) => {
    form.setValue("region", region as "mien-bac" | "mien-trung" | "mien-nam");

    if (region === "mien-bac") {
      form.setValue("region_type", "M2");
    } else {
      form.setValue("region_type", "M1");
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
          Chỉnh sửa đài xổ số: {province?.name}
        </h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/provinces")}
          >
            Hủy
          </Button>
          <Button
            variant="lottery"
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateProvince.isPending}
          >
            {updateProvince.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province_id">ID đài xổ số</Label>
                <Input
                  id="province_id"
                  {...form.register("province_id")}
                  disabled={params.id !== "new"}
                />
                {form.formState.errors.province_id && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.province_id.message}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  ID dùng để liên kết, không dấu, không khoảng trắng. VD: hanoi,
                  tphcm
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên đài xổ số</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.name.message}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Tên đầy đủ của đài xổ số. VD: Hà Nội, TP. HCM
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã đài (nếu có)</Label>
                <Input id="code" {...form.register("code")} />
                <p className="text-sm text-gray-500">
                  Mã đài xổ số nếu có. VD: XSHCM, XSHN
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
                  Đài xổ số này sẽ hiển thị trên form đặt cược
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Miền</Label>
                <Select
                  value={form.watch("region")}
                  onValueChange={handleRegionChange}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Chọn miền" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mien-bac">Miền Bắc</SelectItem>
                    <SelectItem value="mien-trung">Miền Trung</SelectItem>
                    <SelectItem value="mien-nam">Miền Nam</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.region && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.region.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region_type">Loại miền</Label>
                <Select
                  value={form.watch("region_type")}
                  onValueChange={(value) =>
                    form.setValue("region_type", value as "M1" | "M2")
                  }
                >
                  <SelectTrigger id="region_type">
                    <SelectValue placeholder="Chọn loại miền" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M1">M1 (Miền Nam & Trung)</SelectItem>
                    <SelectItem value="M2">M2 (Miền Bắc)</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.region_type && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.region_type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ngày xổ số trong tuần</Label>
              <ProvinceDaysSelector
                value={form.watch("draw_days")}
                onChange={(days) => form.setValue("draw_days", days)}
              />
              {form.formState.errors.draw_days && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.draw_days.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
