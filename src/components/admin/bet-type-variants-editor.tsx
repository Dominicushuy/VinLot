"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  betTypeVariantSchema,
  BetTypeVariantFormValues,
} from "@/lib/validators/bet-types-validator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Edit, Plus, Trash2 } from "lucide-react";

interface BetTypeVariantsEditorProps {
  value: any[];
  onChange: (variants: any[]) => void;
}

export function BetTypeVariantsEditor({
  value = [],
  onChange,
}: BetTypeVariantsEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<number | null>(null);

  const form = useForm<BetTypeVariantFormValues>({
    resolver: zodResolver(betTypeVariantSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      digit_count: undefined,
      number_count: undefined,
      is_active: true,
    },
  });

  const handleEdit = (index: number) => {
    const variant = value[index];
    form.reset({
      id: variant.id,
      name: variant.name,
      description: variant.description || "",
      digit_count: variant.digit_count,
      number_count: variant.number_count,
      is_active: variant.is_active !== false,
    });
    setEditingVariant(index);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    form.reset({
      id: "",
      name: "",
      description: "",
      digit_count: undefined,
      number_count: undefined,
      is_active: true,
    });
    setEditingVariant(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const newVariants = [...value];
    newVariants.splice(index, 1);
    onChange(newVariants);
    toast({
      title: "Đã xóa biến thể",
      description: "Biến thể đã được xóa thành công.",
    });
  };

  const handleToggleStatus = (index: number) => {
    const newVariants = [...value];
    newVariants[index] = {
      ...newVariants[index],
      is_active: newVariants[index].is_active === false ? true : false,
    };
    onChange(newVariants);
  };

  const onSubmit = (data: BetTypeVariantFormValues) => {
    if (editingVariant !== null) {
      // Edit existing variant
      const newVariants = [...value];
      newVariants[editingVariant] = data;
      onChange(newVariants);
      toast({
        title: "Đã cập nhật biến thể",
        description: "Biến thể đã được cập nhật thành công.",
      });
    } else {
      // Add new variant
      // Check for duplicate IDs
      if (value.some((v) => v.id === data.id)) {
        toast({
          title: "ID đã tồn tại",
          description: "Biến thể với ID này đã tồn tại, vui lòng chọn ID khác.",
          variant: "destructive",
        });
        return;
      }

      onChange([...value, data]);
      toast({
        title: "Đã thêm biến thể",
        description: "Biến thể mới đã được thêm thành công.",
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="bg-purple-50 border-b flex flex-row items-center justify-between">
          <CardTitle>Biến thể cược</CardTitle>
          <Button
            variant="default"
            size="sm"
            onClick={handleAddNew}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm biến thể
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {value.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Chưa có biến thể nào
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Biến thể giúp phân loại các cách cược khác nhau trong cùng một
                loại cược. Ví dụ: biến thể &quot;dau&quot;, &quot;duoi&quot;
                trong loại cược &quot;Đầu Đuôi&quot;.
              </p>
              <Button
                onClick={handleAddNew}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm biến thể đầu tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Tên biến thể</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead className="w-[100px] text-center">
                      Số chữ số
                    </TableHead>
                    <TableHead className="w-[100px] text-center">
                      Số lượng
                    </TableHead>
                    <TableHead className="w-[100px] text-center">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {value.map((variant, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-purple-700">
                        {variant.id}
                      </TableCell>
                      <TableCell>{variant.name}</TableCell>
                      <TableCell className="text-gray-600 text-sm max-w-xs truncate">
                        {variant.description}
                      </TableCell>
                      <TableCell className="text-center">
                        {variant.digit_count || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {variant.number_count || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={variant.is_active !== false}
                            onCheckedChange={() => handleToggleStatus(index)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(index)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(index)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingVariant !== null ? "Sửa biến thể" : "Thêm biến thể mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID biến thể</Label>
                <Input
                  id="id"
                  {...form.register("id")}
                  disabled={editingVariant !== null}
                />
                {form.formState.errors.id && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.id.message}
                  </p>
                )}
                {!editingVariant && (
                  <p className="text-xs text-gray-500">
                    Đặt ID ngắn gọn, không dấu và không khoảng trắng (VD: dau,
                    duoi, b2)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên biến thể</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.name.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Tên đầy đủ để hiển thị cho người dùng
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="digit_count">Số chữ số</Label>
                <Input
                  id="digit_count"
                  type="number"
                  {...form.register("digit_count", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-gray-500">
                  Số chữ số cho mỗi số cược
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_count">Số lượng</Label>
                <Input
                  id="number_count"
                  type="number"
                  {...form.register("number_count", {
                    valueAsNumber: true,
                  })}
                />
                <p className="text-xs text-gray-500">
                  Số lượng số cần chọn (nếu có)
                </p>
              </div>

              <div className="flex items-center justify-start pt-8">
                <Switch
                  id="is_active"
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_active", checked)
                  }
                />
                <Label htmlFor="is_active" className="ml-2">
                  Kích hoạt
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                rows={3}
                placeholder="Nhập mô tả chi tiết về biến thể cược này..."
              />
              <p className="text-xs text-gray-500">
                Mô tả sẽ hiển thị cho người dùng khi họ chọn biến thể này
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {editingVariant !== null ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
