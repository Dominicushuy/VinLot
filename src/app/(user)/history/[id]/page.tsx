"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePDF } from "@/lib/hooks/use-pdf";
import { BetDetail } from "@/components/history/bet-detail";
import { CheckBetButton } from "@/components/history/check-bet-button";
import Link from "next/link";
import { BetReceiptDialog } from "@/components/history/bet-receipt-dialog";

// Định nghĩa type cho bet status
type BetStatus = "pending" | "won" | "lost";

// Map các trạng thái sang Việt ngữ và màu sắc
const statusMap: Record<BetStatus, { text: string; color: string }> = {
  pending: { text: "Đang chờ", color: "bg-yellow-100 text-yellow-800" },
  won: { text: "Đã thắng", color: "bg-green-100 text-green-800" },
  lost: { text: "Đã thua", color: "bg-red-100 text-red-800" },
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
          <p className="text-gray-500">Đang tải thông tin cược...</p>
        </div>
      </div>
    );
  }

  if (!bet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">Không tìm thấy thông tin cược</p>
          <Link href="/history">
            <Button variant="outline">Quay lại danh sách</Button>
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
          color: "bg-gray-100 text-gray-800",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-lottery-primary">
            Chi tiết cược
          </h1>
          <p className="text-gray-500 mt-1">ID: {betId}</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/history">
            <Button variant="outline">Quay lại</Button>
          </Link>
          {bet.status === "pending" && (
            <CheckBetButton
              betId={betId}
              onResultsChecked={(results) => {
                // Refresh the page to see updated results
                window.location.reload();
              }}
            />
          )}
          <Button variant="lottery" onClick={handleGeneratePDF}>
            In phiếu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cược</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
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
                  <div>
                    <p className="text-sm text-gray-500">Miền</p>
                    <p className="font-medium">
                      {bet.region_type === "M1" ? "Miền Nam/Trung" : "Miền Bắc"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Đài xổ số</p>
                    <p className="font-medium">
                      {province?.name || bet.province_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loại cược</p>
                    <p className="font-medium">
                      {betTypeName}
                      {betVariantName && (
                        <span className="ml-1 text-sm text-gray-500">
                          ({betVariantName})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phương thức chọn số</p>
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

                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Các số đã chọn ({bet.numbers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {bet.numbers.map((number, index) => (
                      <Badge key={index} variant="outline" className="bg-white">
                        {number}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Mệnh giá</p>
                      <p className="font-medium">
                        {formatCurrency(bet.denomination)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tổng tiền cược</p>
                      <p className="font-medium">
                        {formatCurrency(bet.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Trạng thái</p>
                      <div
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
                        {status.text}
                      </div>
                    </div>
                  </div>
                </div>

                {bet.status === "won" && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-green-800 font-medium">
                      Thông tin thắng cược
                    </p>
                    <div className="mt-2 flex justify-between">
                      <p className="text-green-700">Tổng tiền thắng</p>
                      <p className="font-bold text-green-700">
                        {formatCurrency(bet.win_amount || 0)}
                      </p>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <p className="text-green-700">Lợi nhuận</p>
                      <p className="font-bold text-green-700">
                        {formatCurrency(
                          (bet.win_amount || 0) - bet.total_amount
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <BetDetail
            bet={bet}
            province={province}
            betType={betType}
            results={results}
          />
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
