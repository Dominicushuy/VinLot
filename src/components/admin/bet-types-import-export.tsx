"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useBetTypes } from "@/lib/hooks/use-bet-types";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BetTypesImportExportProps {
  onImport: (data: any[]) => Promise<void>;
}

export function BetTypesImportExport({ onImport }: BetTypesImportExportProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const { data: betTypes, isLoading } = useBetTypes();

  // Format for export (remove unnecessary fields)
  const formatForExport = (data: any[]) => {
    if (!data) return [];

    return data.map((item) => {
      const { id, created_at, updated_at, ...rest } = item;
      return rest;
    });
  };

  // Handle export
  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  // Handle import
  const handleImport = async () => {
    setIsImporting(true);

    try {
      const parsedData = JSON.parse(importData);

      if (!Array.isArray(parsedData)) {
        throw new Error("Dữ liệu không phải là mảng");
      }

      await onImport(parsedData);

      toast({
        title: "Nhập dữ liệu thành công",
        description: `Đã nhập ${parsedData.length} loại cược`,
      });

      setIsImportDialogOpen(false);
      setImportData("");
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Lỗi nhập dữ liệu",
        description:
          error instanceof Error ? error.message : "Dữ liệu không hợp lệ",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Save export to file
  const saveToFile = () => {
    const data = formatForExport(betTypes);
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bet-types-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExportDialogOpen(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Nhập/Xuất cấu hình</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={handleExport} disabled={isLoading}>
            {isLoading ? "Đang tải..." : "Xuất cấu hình (Export)"}
          </Button>

          <Dialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>Nhập cấu hình (Import)</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nhập cấu hình loại cược</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-500">
                  Dán dữ liệu JSON cấu hình loại cược vào ô bên dưới. Dữ liệu
                  phải ở định dạng mảng các đối tượng loại cược.
                </p>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={12}
                  placeholder='[{"bet_type_id": "dd", "name": "Đầu Đuôi", ...}]'
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsImportDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importData.trim() || isImporting}
                >
                  {isImporting ? "Đang nhập..." : "Nhập dữ liệu"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Xuất cấu hình loại cược</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-500">
                  Dữ liệu cấu hình loại cược đã được định dạng dưới dạng JSON.
                  Bạn có thể sao chép hoặc tải về.
                </p>
                <Textarea
                  value={JSON.stringify(formatForExport(betTypes), null, 2)}
                  rows={12}
                  readOnly
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsExportDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button onClick={saveToFile}>Tải xuống (.json)</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
