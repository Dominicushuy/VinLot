// src/components/admin/results/lottery-results.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLotteryResults,
  useProvincesByRegion,
} from "@/lib/hooks/use-lottery-results";
import { NorthResult } from "./north-result";
import { SouthCentralResult } from "./south-central-result";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LotteryResults() {
  const [region, setRegion] = useState<
    "mien-bac" | "mien-trung" | "mien-nam" | "all"
  >("all");
  const [provinceId, setProvinceId] = useState<string | undefined>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [actualResultDate, setActualResultDate] = useState<string | null>(null);

  // Luôn lấy kết quả mới nhất, không cần truyền date
  const { data: resultsData, isLoading } = useLotteryResults({
    region: region === "all" ? undefined : region,
    provinceId: provinceId === "all" ? undefined : provinceId,
  });

  const { data: provincesByRegion, isLoading: isLoadingProvinces } =
    useProvincesByRegion();

  console.log({ provincesByRegion, resultsData });

  // Theo dõi khi resultsData thay đổi để lấy ngày kết quả
  useEffect(() => {
    if (!resultsData || Object.keys(resultsData).length === 0) return;

    const dateKeys = Object.keys(resultsData).sort().reverse();
    if (dateKeys.length === 0) return;

    const latestDateKey = dateKeys[0];
    setActualResultDate(latestDateKey);
  }, [resultsData]);

  // Format kết quả cho hiển thị
  const formatResultsForDisplay = () => {
    if (!resultsData || Object.keys(resultsData).length === 0) {
      return [];
    }

    // Lấy ngày đầu tiên (kết quả mới nhất) - do kết quả được nhóm theo ngày
    const dateKeys = Object.keys(resultsData).sort().reverse(); // Sắp xếp ngày giảm dần
    const dateKey = dateKeys[0];
    if (!dateKey) return [];

    const resultsByRegion = resultsData[dateKey];
    if (!resultsByRegion) return [];

    // Nếu tab là 'all', hiển thị tất cả
    if (activeTab === "all") {
      const allResults: any[] = [];

      // Miền Bắc
      if (resultsByRegion["mien-bac"]) {
        allResults.push(...resultsByRegion["mien-bac"]);
      }

      // Miền Trung
      if (resultsByRegion["mien-trung"]) {
        allResults.push(...resultsByRegion["mien-trung"]);
      }

      // Miền Nam
      if (resultsByRegion["mien-nam"]) {
        allResults.push(...resultsByRegion["mien-nam"]);
      }

      return allResults;
    }

    // Nếu không, chỉ hiển thị miền được chọn
    return resultsByRegion[activeTab] || [];
  };

  const results = formatResultsForDisplay();

  const formatActualDate = () => {
    if (!actualResultDate) return null;
    try {
      const dateParts = actualResultDate.split("-");
      return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    } catch (e: any) {
      return actualResultDate;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bộ lọc kết quả xổ số</CardTitle>
          <CardDescription>
            Xem kết quả xổ số mới nhất theo miền và tỉnh thành
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {actualResultDate && (
              <div className="flex-1 bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="text-blue-800">
                  <span className="font-semibold">Kết quả mới nhất:</span>{" "}
                  {formatActualDate()}
                </p>
              </div>
            )}

            {/* Region selector */}
            <div className="w-full md:w-1/3">
              <Select
                value={region || "all"}
                onValueChange={(value) => {
                  setRegion((value as any) || undefined);
                  setProvinceId(undefined); // Reset province when region changes
                  if (value) {
                    setActiveTab(value as string);
                  } else {
                    setActiveTab("all");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn miền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả miền</SelectItem>
                  <SelectItem value="mien-bac">Miền Bắc</SelectItem>
                  <SelectItem value="mien-trung">Miền Trung</SelectItem>
                  <SelectItem value="mien-nam">Miền Nam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Province selector */}
            <div className="w-full md:w-1/3">
              <Select
                value={provinceId || "all"}
                onValueChange={(value) => setProvinceId(value || undefined)}
                disabled={!region || isLoadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tỉnh/thành</SelectItem>
                  {region &&
                    provincesByRegion &&
                    provincesByRegion[region]?.map((province: any) => (
                      <SelectItem
                        key={province.province_id}
                        value={province.province_id}
                      >
                        {province.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for results by region */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="mien-bac">Miền Bắc</TabsTrigger>
          <TabsTrigger value="mien-trung">Miền Trung</TabsTrigger>
          <TabsTrigger value="mien-nam">Miền Nam</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Display results */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Đang tải dữ liệu kết quả xổ số...</p>
        </div>
      ) : results.length === 0 ? (
        <Card className="w-full p-8 text-center">
          <CardContent>
            <p className="text-lg text-gray-600 mb-4">
              Không tìm thấy kết quả xổ số nào
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Vui lòng kiểm tra lại các bộ lọc hoặc thử lại sau.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result: any) => (
              <div key={result.id}>
                {result.provinces.region === "mien-bac" ? (
                  <NorthResult result={result} />
                ) : (
                  <SouthCentralResult result={result} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
