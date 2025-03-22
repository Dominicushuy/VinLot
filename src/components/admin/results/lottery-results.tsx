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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function LotteryResults() {
  const [region, setRegion] = useState<
    "mien-bac" | "mien-trung" | "mien-nam" | "all"
  >("all");
  const [provinceId, setProvinceId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [actualResultDate, setActualResultDate] = useState<string | null>(null);

  // Lấy kết quả xổ số với các bộ lọc
  const { data: resultsData, isLoading } = useLotteryResults({
    region: region === "all" ? undefined : region,
    provinceId: provinceId === "all" ? undefined : provinceId,
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
  });

  const { data: provincesByRegion, isLoading: isLoadingProvinces } =
    useProvincesByRegion();

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
      if (
        resultsByRegion["mien-bac"] &&
        resultsByRegion["mien-bac"].length > 0
      ) {
        allResults.push(...resultsByRegion["mien-bac"]);
      }

      // Miền Trung
      if (
        resultsByRegion["mien-trung"] &&
        resultsByRegion["mien-trung"].length > 0
      ) {
        allResults.push(...resultsByRegion["mien-trung"]);
      }

      // Miền Nam
      if (
        resultsByRegion["mien-nam"] &&
        resultsByRegion["mien-nam"].length > 0
      ) {
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

  // Xử lý khi ngày được chọn
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Format ngày hiển thị trên button
  const formatDisplayDate = (date?: Date) => {
    return date ? format(date, "dd/MM/yyyy") : "Chọn ngày";
  };

  const clearDateFilter = () => {
    setSelectedDate(undefined);
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bộ lọc kết quả xổ số</CardTitle>
          <CardDescription>
            Xem kết quả xổ số theo miền, tỉnh thành và ngày
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {actualResultDate && !selectedDate && (
              <div className="flex-1 bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="text-blue-800">
                  <span className="font-semibold">Kết quả mới nhất:</span>{" "}
                  {formatActualDate()}
                </p>
              </div>
            )}

            {/* Date selector */}
            <div className="w-full md:w-1/3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDisplayDate(selectedDate)}
                    {selectedDate && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          clearDateFilter();
                        }}
                        className="ml-auto text-xs bg-gray-200 hover:bg-gray-300 rounded-full px-2 py-1"
                      >
                        ✕
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Region selector */}
            <div className="w-full md:w-1/3">
              <Select
                value={region}
                onValueChange={(value: any) => {
                  setRegion(value);
                  setProvinceId("all"); // Reset province when region changes
                  if (value !== "all") {
                    setActiveTab(value);
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
                value={provinceId}
                onValueChange={(value) => setProvinceId(value)}
                disabled={!provincesByRegion || isLoadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tỉnh/thành</SelectItem>
                  {region !== "all" &&
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
            <p className="text-sm text-gray-500">
              {selectedDate ? (
                <>
                  Không có kết quả cho ngày {format(selectedDate, "dd/MM/yyyy")}
                  .{region !== "all" && ` Thử chọn ngày khác hoặc miền khác.`}
                </>
              ) : region !== "all" ? (
                <>
                  Không có kết quả cho miền{" "}
                  {region === "mien-bac"
                    ? "Bắc"
                    : region === "mien-trung"
                    ? "Trung"
                    : "Nam"}
                  {provinceId !== "all" ? ` và tỉnh đã chọn` : ""}.
                </>
              ) : (
                "Vui lòng kiểm tra lại các bộ lọc hoặc thử lại sau."
              )}
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
