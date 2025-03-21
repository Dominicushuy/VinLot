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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Biến thể cược</CardTitle>
          <Button variant="lottery" onClick={handleAddNew}>
            Thêm biến thể
          </Button>
        </CardHeader>
        <CardContent>
          {value.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Chưa có biến thể nào được thêm. Nhấn &quot;Thêm biến thể&quot; để
              bắt đầu.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Tên biến thể</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="w-[100px]">Số chữ số</TableHead>
                  <TableHead className="w-[100px]">Số lượng</TableHead>
                  <TableHead className="w-[100px] text-center">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {value.map((variant, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{variant.id}</TableCell>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>{variant.description}</TableCell>
                    <TableCell>{variant.digit_count || "-"}</TableCell>
                    <TableCell>{variant.number_count || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={variant.is_active !== false}
                        onCheckedChange={() => handleToggleStatus(index)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(index)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(index)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên biến thể</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.name.message}
                  </p>
                )}
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
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" variant="lottery">
                {editingVariant !== null ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
