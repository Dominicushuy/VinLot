// src/components/admin/results/diagnostic-panel.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  SearchIcon,
  ArrowRightCircle,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

export function DiagnosticPanel() {
  const { toast } = useToast();
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [processResult, setProcessResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("diagnostics");

  // Chạy chẩn đoán để phát hiện vấn đề
  const runDiagnostics = async () => {
    try {
      setIsRunningDiagnostics(true);
      setDiagnosticResult(null);

      const response = await fetch("/api/admin/diagnose-bets");

      if (!response.ok) {
        throw new Error("Không thể chạy chẩn đoán");
      }

      const data = await response.json();
      setDiagnosticResult(data);

      toast({
        title: "Chẩn đoán hoàn tất",
        description: "Đã phân tích các phiếu cược đang chờ đối soát",
      });
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast({
        title: "Lỗi",
        description: "Không thể chạy chẩn đoán. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Đối soát nâng cao
  const runEnhancedProcessing = async () => {
    try {
      setIsProcessing(true);
      setProcessResult(null);

      const response = await fetch("/api/admin/process-enhanced", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Không thể đối soát kết quả");
      }

      const data = await response.json();
      setProcessResult(data);

      toast({
        title: "Đối soát hoàn tất",
        description: `Đã xử lý ${data.processed} cược, ${data.won} thắng, ${
          data.lost
        } thua, ${data.errors || 0} lỗi`,
      });
    } catch (error) {
      console.error("Error running enhanced processing:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đối soát. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format thời gian timestamp
  const formatDateTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, "HH:mm:ss dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return timestamp;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Khắc phục sự cố đối soát</CardTitle>
        <CardDescription>
          Công cụ chẩn đoán và khắc phục các vấn đề trong quá trình đối soát kết
          quả
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="diagnostics"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="diagnostics">Chẩn đoán</TabsTrigger>
            <TabsTrigger value="process">Đối soát nâng cao</TabsTrigger>
            {processResult && (
              <TabsTrigger value="results">Kết quả đối soát</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="diagnostics" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">
                  Chẩn đoán sự cố đối soát
                </h3>
                <p className="text-sm text-gray-500">
                  Kiểm tra các phiếu cược đang chờ đối soát và tìm lỗi tiềm ẩn
                </p>
              </div>
              <Button
                onClick={runDiagnostics}
                disabled={isRunningDiagnostics}
                className="flex items-center"
              >
                {isRunningDiagnostics ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="mr-2 h-4 w-4" />
                )}
                {isRunningDiagnostics ? "Đang chẩn đoán..." : "Chạy chẩn đoán"}
              </Button>
            </div>

            {!diagnosticResult && !isRunningDiagnostics && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Chưa có kết quả chẩn đoán</AlertTitle>
                <AlertDescription>
                  Nhấn "Chạy chẩn đoán" để phân tích các vấn đề trong quá trình
                  đối soát
                </AlertDescription>
              </Alert>
            )}

            {isRunningDiagnostics && (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" />
                <span>Đang phân tích dữ liệu...</span>
              </div>
            )}

            {diagnosticResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">
                        Tổng số phiếu chờ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {diagnosticResult.diagnostics?.total_pending || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">
                        Số kết quả khả dụng
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {diagnosticResult.diagnostics?.results_available || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">
                        Vấn đề phát hiện
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">
                        {diagnosticResult.diagnostics?.issues?.length || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {diagnosticResult.diagnostics?.issues?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Các vấn đề đã phát hiện:</h4>
                    {diagnosticResult.diagnostics.issues.map((issue, index) => (
                      <Alert
                        key={index}
                        variant={
                          issue.type.includes("error")
                            ? "destructive"
                            : "default"
                        }
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{issue.context}</AlertTitle>
                        <AlertDescription className="text-sm">
                          {typeof issue.detail === "string"
                            ? issue.detail
                            : JSON.stringify(issue.detail)}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {diagnosticResult.suggestions?.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h4 className="font-medium">Đề xuất giải pháp:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {diagnosticResult.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button onClick={() => setActiveTab("process")}>
                    Chuyển đến đối soát nâng cao
                    <ArrowRightCircle className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="process" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Đối soát nâng cao</h3>
                <p className="text-sm text-gray-500">
                  Sử dụng thuật toán nâng cao để đối soát các phiếu cược khó xử
                  lý
                </p>
              </div>
              <Button
                onClick={runEnhancedProcessing}
                disabled={isProcessing}
                variant="lottery"
                className="flex items-center"
              >
                {isProcessing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {isProcessing ? "Đang đối soát..." : "Đối soát nâng cao"}
              </Button>
            </div>

            {processResult && (
              <Alert
                variant={processResult.success ? "default" : "destructive"}
              >
                {processResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {processResult.success
                    ? "Đối soát thành công"
                    : "Đối soát thất bại"}
                </AlertTitle>
                <AlertDescription>
                  {processResult.success
                    ? `Đã xử lý ${processResult.processed} phiếu, ${
                        processResult.won
                      } thắng, ${processResult.lost} thua, ${
                        processResult.errors || 0
                      } lỗi.`
                    : processResult.message ||
                      "Không thể đối soát. Vui lòng kiểm tra nhật ký lỗi."}
                </AlertDescription>
              </Alert>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" />
                <span>Đang đối soát kết quả...</span>
              </div>
            )}

            {!processResult && !isProcessing && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sẵn sàng đối soát nâng cao</AlertTitle>
                <AlertDescription>
                  Hệ thống sẽ sử dụng thuật toán mạnh mẽ hơn để đối soát các
                  phiếu cược có vấn đề
                </AlertDescription>
              </Alert>
            )}

            {processResult && (
              <div className="flex justify-end mt-4">
                <Button onClick={() => setActiveTab("results")}>
                  Xem kết quả chi tiết
                  <ArrowRightCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          {processResult && (
            <TabsContent value="results" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">
                    Kết quả đối soát chi tiết
                  </h3>
                  <p className="text-sm text-gray-500">
                    Chi tiết về quá trình đối soát và các cược đã xử lý
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Đã xử lý</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {processResult.processed || 0}
                    </div>
                    <p className="text-xs text-gray-500">
                      Trên tổng số {processResult.total_pending || 0} phiếu chờ
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Thắng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {processResult.won || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Thua</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {processResult.lost || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Thống kê xử lý</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Thời gian xử lý:</span>
                        <span className="font-mono">
                          {processResult.processing_time_ms} ms
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Phiếu cập nhật thành công:</span>
                        <span className="font-medium">
                          {processResult.updated || 0}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Phiếu gặp lỗi:</span>
                        <span className="font-medium">
                          {processResult.errors || 0}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Phiếu còn lại:</span>
                        <span className="font-medium">
                          {(processResult.total_pending || 0) -
                            (processResult.processed || 0)}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Trạng thái lỗi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {processResult.error_details &&
                    processResult.error_details.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 mb-2">
                          {processResult.error_details.length} phiếu gặp lỗi khi
                          xử lý
                        </p>
                        <div className="max-h-40 overflow-y-auto">
                          {processResult.error_details.map((error, index) => (
                            <div
                              key={index}
                              className="text-xs border-b pb-1 mb-1 last:border-0"
                            >
                              <div className="flex items-center">
                                <XCircle className="h-3 w-3 mr-1 text-red-500" />
                                <span className="font-mono mr-1">
                                  {error.id.slice(0, 8)}...
                                </span>
                                <Badge variant="outline" className="ml-auto">
                                  {error.error}
                                </Badge>
                              </div>
                              {error.details && (
                                <div className="ml-4 mt-1 text-gray-500">
                                  {typeof error.details === "string"
                                    ? error.details
                                    : JSON.stringify(error.details)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full py-4">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-gray-600">
                          Không có lỗi xử lý
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-gray-50/50 flex justify-between">
        <span className="text-xs text-gray-500">
          Công cụ chẩn đoán và sửa lỗi đối soát kết quả
        </span>
        <span className="text-xs text-gray-500">
          {new Date().toLocaleString("vi-VN")}
        </span>
      </CardFooter>
    </Card>
  );
}
