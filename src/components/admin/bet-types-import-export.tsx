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
import {
  Loader2,
  Download,
  Upload,
  Copy,
  AlertTriangle,
  FileUp,
  FileDown,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BetTypesImportExportProps {
  onImport: (data: any[]) => Promise<void>;
}

export function BetTypesImportExport({ onImport }: BetTypesImportExportProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { data: betTypes, isLoading } = useBetTypes();

  // Format for export (remove unnecessary fields)
  const formatForExport = (data: any[] | undefined): any[] => {
    if (!data) return [];

    return data.map((item) => {
      const { ...rest } = item;
      return rest;
    });
  };

  // Handle export
  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  // Handle import data change
  const handleImportDataChange = (value: string) => {
    setImportData(value);
    setJsonError(null);

    // Validate JSON
    if (value.trim()) {
      try {
        JSON.parse(value);
      } catch {
        setJsonError("JSON không hợp lệ. Vui lòng kiểm tra lại định dạng.");
      }
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "Dữ liệu trống",
        description: "Vui lòng nhập dữ liệu JSON",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImporting(true);
      const parsedData = JSON.parse(importData);

      if (!Array.isArray(parsedData)) {
        throw new Error("Dữ liệu không phải là mảng");
      }

      // Validate each item has required fields
      parsedData.forEach((item, index) => {
        if (!item.bet_type_id) {
          throw new Error(`Thiếu trường bet_type_id ở mục ${index + 1}`);
        }
        if (!item.name) {
          throw new Error(`Thiếu trường name ở mục ${index + 1}`);
        }
        if (!item.region_rules) {
          throw new Error(`Thiếu trường region_rules ở mục ${index + 1}`);
        }
      });

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

    toast({
      title: "Xuất dữ liệu thành công",
      description: "File JSON đã được tải xuống",
    });
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const data = formatForExport(betTypes);
    const jsonString = JSON.stringify(data, null, 2);

    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);

      toast({
        title: "Đã sao chép",
        description: "Dữ liệu đã được sao chép vào clipboard",
      });

      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Validate JSON
        JSON.parse(content);
        setImportData(content);
        setJsonError(null);
      } catch {
        setJsonError("File không chứa dữ liệu JSON hợp lệ");
        toast({
          title: "Lỗi đọc file",
          description: "File không chứa dữ liệu JSON hợp lệ",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-800">Nhập/Xuất cấu hình</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <p className="text-blue-700 text-sm flex-grow">
            Xuất dữ liệu cấu hình để sao lưu hoặc nhập dữ liệu từ file JSON để
            khôi phục hoặc chia sẻ giữa các hệ thống.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Xuất cấu hình
            </Button>

            <Dialog
              open={isImportDialogOpen}
              onOpenChange={setIsImportDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center bg-blue-600 hover:bg-blue-700">
                  <FileUp className="h-4 w-4 mr-2" />
                  Nhập cấu hình
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Nhập cấu hình loại cược</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors">
                        <Upload className="h-4 w-4 mr-2" />
                        Tải lên từ file
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <div className="text-sm text-gray-500">
                      Hoặc dán dữ liệu JSON vào ô bên dưới
                    </div>
                  </div>

                  {jsonError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Lỗi JSON</AlertTitle>
                      <AlertDescription>{jsonError}</AlertDescription>
                    </Alert>
                  )}

                  <Textarea
                    value={importData}
                    onChange={(e) => handleImportDataChange(e.target.value)}
                    rows={15}
                    placeholder='[{"bet_type_id": "dd", "name": "Đầu Đuôi", ...}]'
                    className="font-mono text-sm"
                  />

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Lưu ý</AlertTitle>
                    <AlertDescription>
                      Việc nhập dữ liệu sẽ thêm mới tất cả các loại cược trong
                      danh sách. Nếu ID trùng với loại cược đã tồn tại, hệ thống
                      sẽ từ chối.
                    </AlertDescription>
                  </Alert>
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
                    disabled={!importData.trim() || isImporting || !!jsonError}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang nhập...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Nhập dữ liệu
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isExportDialogOpen}
              onOpenChange={setIsExportDialogOpen}
            >
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Xuất cấu hình loại cược</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-700">
                      Dữ liệu cấu hình của {betTypes?.length || 0} loại cược đã
                      được định dạng dưới dạng JSON
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copied ? "Đã sao chép" : "Sao chép"}
                    </Button>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <Textarea
                      value={JSON.stringify(formatForExport(betTypes), null, 2)}
                      rows={15}
                      readOnly
                      className="font-mono text-sm bg-gray-50 border-0"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsExportDialogOpen(false)}
                  >
                    Đóng
                  </Button>
                  <Button
                    onClick={saveToFile}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống (.json)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
