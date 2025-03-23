// src/app/(user)/history/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePDF } from "@/lib/hooks/use-pdf";
import { BetDetail } from "@/components/history/bet-detail";
import { CheckBetButton } from "@/components/history/check-bet-button";
import Link from "next/link";
import { BetReceiptDialog } from "@/components/history/bet-receipt-dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, AlertCircle, Share2 } from "lucide-react";

// Định nghĩa type cho bet status
type BetStatus = "pending" | "won" | "lost";

// Map các trạng thái sang Việt ngữ và màu sắc
const statusMap: Record<
  BetStatus,
  { text: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  pending: {
    text: "Đang chờ",
    color: "text-yellow-800",
    bgColor: "bg-yellow-50",
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  },
  won: {
    text: "Đã thắng",
    color: "text-green-800",
    bgColor: "bg-green-50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-500"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  lost: {
    text: "Đã thua",
    color: "text-red-800",
    bgColor: "bg-red-50",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-500"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
};

// Type định nghĩa cho Bet
interface Bet {
  id: string;
  user_id: string;
  bet_date: string;
  draw_date: string;
  region_type: "M1" | "M2";
  province_id: string;
  bet_type: string;
  bet_variant?: string;
  numbers: string[];
  selection_method: string;
  denomination: number;
  total_amount: number;
  potential_win_amount: number;
  status: BetStatus;
  win_amount?: number;
}

// Type cho Province
interface Province {
  id: string;
  province_id: string;
  name: string;
  code?: string;
  region: string;
  region_type: string;
  draw_days: string[];
  is_active: boolean;
}

// Type cho BetType
interface BetType {
  id: string;
  bet_type_id: string;
  name: string;
  description?: string;
  digit_count?: number;
  region_rules: any;
  variants: any;
  winning_ratio: any;
}

export default function BetDetailPage() {
  const params = useParams();
  const betId = params.id as string;

  const [bet, setBet] = useState<Bet | null>(null);
  const [province, setProvince] = useState<Province | null>(null);
  const [betType, setBetType] = useState<BetType | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  const {
    generateBetReceipt,
    previewOpen,
    setPreviewOpen,
    currentBet,
    handlePrint,
  } = usePDF();

  useEffect(() => {
    async function fetchBetDetails() {
      try {
        setLoading(true);

        // Lấy thông tin cược
        const { data: betData, error: betError } = await supabase
          .from("bets")
          .select("*")
          .eq("id", betId)
          .single();

        if (betError) throw betError;
        if (!betData) throw new Error("Không tìm thấy cược");

        setBet(betData as Bet);

        // Lấy thông tin tỉnh
        const { data: provinceData } = await supabase
          .from("provinces")
          .select("*")
          .eq("province_id", betData.province_id)
          .single();

        setProvince(provinceData as Province);

        // Lấy thông tin loại cược
        const { data: betTypeData } = await supabase
          .from("rules")
          .select("*")
          .eq("bet_type_id", betData.bet_type)
          .single();

        // Parse các trường JSONB nếu cần
        if (betTypeData) {
          if (typeof betTypeData.variants === "string") {
            try {
              betTypeData.variants = JSON.parse(betTypeData.variants);
            } catch (e) {
              console.error("Error parsing variants:", e);
              betTypeData.variants = [];
            }
          }

          if (typeof betTypeData.region_rules === "string") {
            try {
              betTypeData.region_rules = JSON.parse(betTypeData.region_rules);
            } catch (e) {
              console.error("Error parsing region_rules:", e);
              betTypeData.region_rules = {};
            }
          }

          if (typeof betTypeData.winning_ratio === "string") {
            try {
              betTypeData.winning_ratio = JSON.parse(betTypeData.winning_ratio);
            } catch (e) {
              console.error("Error parsing winning_ratio:", e);
              betTypeData.winning_ratio = {};
            }
          }
        }

        setBetType(betTypeData as BetType);

        // Lấy kết quả xổ số (nếu có)
        if (betData.status !== "pending") {
          const { data: resultsData } = await supabase
            .from("results")
            .select("*")
            .eq("province_id", betData.province_id)
            .eq("date", betData.draw_date)
            .single();

          setResults(resultsData);
        }
      } catch (error) {
        console.error("Error fetching bet details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (betId) {
      fetchBetDetails();
    }
  }, [betId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lottery-primary"></div>
            <p className="text-gray-500">Đang tải thông tin cược...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-700 font-medium mb-4">
            Không tìm thấy thông tin cược
          </p>
          <Link href="/history">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Kiểm tra status và sử dụng type assertion để TypeScript biết đây là khóa hợp lệ
  const status =
    bet.status in statusMap
      ? statusMap[bet.status]
      : {
          text: bet.status,
          color: "text-gray-800",
          bgColor: "bg-gray-100",
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
        };

  // Format tên loại cược
  const betTypeName = betType?.name || bet.bet_type;
  let betVariantName;

  if (bet.bet_variant && betType?.variants) {
    // Xử lý an toàn với variants
    const variants = betType.variants;
    if (Array.isArray(variants)) {
      const variant = variants.find((v) => v.id === bet.bet_variant);
      betVariantName = variant?.name;
    } else {
      betVariantName = bet.bet_variant;
    }
  } else {
    betVariantName = bet.bet_variant;
  }

  const handleGeneratePDF = () => {
    generateBetReceipt({
      bet,
      province: province || { name: bet.province_id },
      betType: betTypeName,
      betVariant: betVariantName,
    });
  };

  // Tính lời/lỗ
  const profitLoss =
    bet.status === "won"
      ? (bet.win_amount || 0) - bet.total_amount
      : -bet.total_amount;

  // Xác định màu sắc cho lời/lỗ
  const profitLossClass =
    profitLoss >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/history">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-lottery-primary">
                Chi tiết cược
              </h1>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${status.color} ${status.bgColor} flex items-center gap-1`}
              >
                {status.icon}
                {status.text}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-gray-500 text-sm">ID: {betId}</p>
              <Badge variant="outline" className="ml-2">
                {bet.bet_type}
                {bet.bet_variant ? `/${bet.bet_variant}` : ""}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {bet.status === "pending" && (
              <CheckBetButton
                betId={betId}
                onResultsChecked={() => window.location.reload()}
              />
            )}
            <Button variant="outline" onClick={handleGeneratePDF}>
              <Printer className="mr-2 h-4 w-4" />
              In phiếu
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Chia sẻ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bet Overview Card */}
          <Card className="overflow-hidden">
            <CardHeader className={`${status.bgColor} border-b`}>
              <div className="flex items-center justify-between">
                <CardTitle>Thông tin tổng quan</CardTitle>
                <div className="text-sm font-medium">
                  {format(new Date(bet.bet_date), "dd/MM/yyyy", { locale: vi })}
                </div>
              </div>
              <CardDescription>
                {bet.status === "pending"
                  ? "Cược đang chờ kết quả xổ số"
                  : bet.status === "won"
                  ? "Cược đã trúng thưởng"
                  : "Cược không trúng thưởng"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                {/* Left Side */}
                <div className="p-6">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Thông tin cược
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Ngày đặt cược</p>
                        <p className="font-medium">
                          {format(new Date(bet.bet_date), "EEEE, dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày xổ số</p>
                        <p className="font-medium">
                          {format(new Date(bet.draw_date), "EEEE, dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="py-2 border-t border-dashed">
                      <div className="flex flex-col gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Đài xổ số</p>
                          <p className="font-medium">
                            {province?.name || bet.province_id}
                            <span className="ml-2 text-sm text-gray-500">
                              (
                              {bet.region_type === "M1"
                                ? "Miền Nam/Trung"
                                : "Miền Bắc"}
                              )
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Loại cược</p>
                          <p className="font-medium">
                            <span className="bg-lottery-primary/10 text-lottery-primary px-2 py-0.5 rounded text-xs mr-2">
                              {bet.bet_type}
                            </span>
                            {betTypeName}
                            {betVariantName && (
                              <span className="ml-1 text-sm text-gray-500">
                                ({betVariantName})
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Phương thức chọn số
                          </p>
                          <p className="font-medium">
                            {bet.selection_method === "manual"
                              ? "Nhập trực tiếp"
                              : bet.selection_method === "zodiac"
                              ? "12 Con Giáp"
                              : bet.selection_method === "permutation"
                              ? "Đảo Số"
                              : bet.selection_method === "highlow"
                              ? "Tài/Xỉu & Chẵn/Lẻ"
                              : bet.selection_method === "sequence"
                              ? "Kéo Số"
                              : bet.selection_method}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="p-6">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Thông tin tài chính
                  </h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="py-2 pl-0">Mệnh giá</TableCell>
                        <TableCell className="py-2 pr-0 text-right">
                          {formatCurrency(bet.denomination)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 pl-0">
                          Tổng tiền cược
                        </TableCell>
                        <TableCell className="py-2 pr-0 text-right font-medium">
                          {formatCurrency(bet.total_amount)}
                        </TableCell>
                      </TableRow>
                      {bet.status !== "pending" && (
                        <TableRow>
                          <TableCell className="py-2 pl-0">
                            Tiền thắng
                          </TableCell>
                          <TableCell className="py-2 pr-0 text-right">
                            {bet.status === "won"
                              ? formatCurrency(bet.win_amount || 0)
                              : "0 ₫"}
                          </TableCell>
                        </TableRow>
                      )}
                      {bet.status !== "pending" && (
                        <TableRow>
                          <TableCell className="py-2 pl-0 font-medium">
                            Lời/Lỗ
                          </TableCell>
                          <TableCell
                            className={`py-2 pr-0 text-right font-medium ${profitLossClass}`}
                          >
                            {formatCurrency(Math.abs(profitLoss))}
                            {profitLoss >= 0 ? " (lời)" : " (lỗ)"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Winning information for won bets */}
                  {bet.status === "won" && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <h4 className="text-green-800 font-medium">
                            Thông tin thắng
                          </h4>
                          <Badge className="bg-green-600">Đã trúng</Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-green-700">
                              Tiền thắng:
                            </span>
                            <span className="font-bold text-green-700">
                              {formatCurrency(bet.win_amount || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-green-700">
                              Lợi nhuận:
                            </span>
                            <span className="font-bold text-green-700">
                              {formatCurrency(
                                (bet.win_amount || 0) - bet.total_amount
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Numbers Card */}
          <Card>
            <CardHeader>
              <CardTitle>Các số đã chọn</CardTitle>
              <CardDescription>
                Tổng cộng {bet.numbers.length} số với mệnh giá{" "}
                {formatCurrency(bet.denomination)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {bet.numbers.map((number, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 border rounded-md text-center min-w-[60px]"
                  >
                    <span className="text-lg font-medium">{number}</span>
                  </div>
                ))}
              </div>

              {/* Potential winning & calculation */}
              {bet.status === "pending" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Thông tin tiềm năng
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700">Tiền cược:</p>
                      <p className="font-medium">
                        {formatCurrency(bet.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Tiềm năng thắng:</p>
                      <p className="font-medium">
                        {formatCurrency(bet.potential_win_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <BetDetail
            bet={bet}
            province={province}
            betType={betType}
            results={results}
          />

          {/* Related info card */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thêm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Thời gian tạo</h4>
                <p className="text-gray-600">
                  {format(new Date(bet.bet_date), "HH:mm:ss - dd/MM/yyyy", {
                    locale: vi,
                  })}
                </p>
              </div>

              {bet.status !== "pending" && (
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Thời gian đối soát
                  </h4>
                  <p className="text-gray-600">
                    {results?.updated_at
                      ? format(
                          new Date(results.updated_at),
                          "HH:mm:ss - dd/MM/yyyy",
                          { locale: vi }
                        )
                      : "Không có thông tin"}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleGeneratePDF}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  In phiếu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BetReceiptDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        betData={currentBet}
        onPrint={handlePrint}
      />
    </div>
  );
}
