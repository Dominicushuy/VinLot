// src/components/bet-form/region-selection.tsx
"use client";

import { useEffect, useState } from "react";
import { useProvincesByRegion } from "@/lib/hooks/use-provinces";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2, Info, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBetContext } from "@/contexts/BetContext";

// Map các slug ngày sang tên tiếng Việt có dấu
const dayOfWeekNameMap: Record<string, string> = {
  "chu-nhat": "Chủ Nhật",
  "thu-hai": "Thứ Hai",
  "thu-ba": "Thứ Ba",
  "thu-tu": "Thứ Tư",
  "thu-nam": "Thứ Năm",
  "thu-sau": "Thứ Sáu",
  "thu-bay": "Thứ Bảy",
};

export function RegionSelection() {
  const { methods } = useBetContext();
  const drawDate = methods.watch("drawDate");
  const provinces = methods.watch("provinces") || [];
  const [validationError, setValidationError] = useState<string | null>(null);

  // Lấy danh sách tỉnh từ API
  const { data: provincesByRegion, isLoading } = useProvincesByRegion();

  // Lấy thứ trong tuần từ ngày đã chọn
  const getSelectedDayOfWeek = () => {
    if (!drawDate) return null;
    const date = new Date(drawDate);
    const day = date.getDay();

    const daysMapping = [
      "chu-nhat",
      "thu-hai",
      "thu-ba",
      "thu-tu",
      "thu-nam",
      "thu-sau",
      "thu-bay",
    ];
    return daysMapping[day];
  };

  // Lọc tỉnh theo ngày xổ
  const filterProvincesByDay = (provinces: any[]) => {
    if (!drawDate) return provinces;

    const daySlug = getSelectedDayOfWeek();
    if (!daySlug) return provinces;

    return provinces.filter(
      (p) => p.draw_days.includes(daySlug) && p.is_active
    );
  };

  // Danh sách tỉnh theo miền
  const getRegionProvinces = (region: string) => {
    if (!provincesByRegion || isLoading) return [];
    return provincesByRegion.filter((p) => p.region === region);
  };

  // Tỉnh theo miền
  const northProvinces = getRegionProvinces("mien-bac");
  const centralProvinces = getRegionProvinces("mien-trung");
  const southProvinces = getRegionProvinces("mien-nam");

  // Áp dụng filter ngày
  const filteredNorthProvinces = filterProvincesByDay(northProvinces);
  const filteredCentralProvinces = filterProvincesByDay(centralProvinces);
  const filteredSouthProvinces = filterProvincesByDay(southProvinces);

  // Số lượng đài có sẵn cho ngày xổ
  const availableProvinceCount =
    filteredNorthProvinces.length +
    filteredCentralProvinces.length +
    filteredSouthProvinces.length;

  // Lấy tên tỉnh từ ID và nhóm theo miền
  const getProvinceDetails = () => {
    if (!provincesByRegion) return { names: [], byRegion: {} };

    // Gộp tất cả các tỉnh để tìm kiếm
    const allProvinces = provincesByRegion;
    const names: string[] = [];
    const byRegion: Record<string, string[]> = {
      "mien-bac": [],
      "mien-trung": [],
      "mien-nam": [],
    };

    provinces.forEach((id) => {
      const province = allProvinces.find((p) => p.province_id === id);
      if (province) {
        names.push(province.name);
        if (province.region) {
          byRegion[province.region].push(province.name);
        }
      }
    });

    return { names, byRegion };
  };

  const provinceDetails = getProvinceDetails();
  const selectedDayOfWeek = getSelectedDayOfWeek();
  const formattedDayOfWeek = selectedDayOfWeek
    ? dayOfWeekNameMap[selectedDayOfWeek] || selectedDayOfWeek.replace("-", " ")
    : "";

  // Chọn tất cả đài có sẵn cho một miền
  const selectAllProvinces = (region: string) => {
    let provinceList: any[] = [];

    // Lấy danh sách tỉnh theo miền
    if (region === "mien-bac") {
      provinceList = filteredNorthProvinces;
    } else if (region === "mien-trung") {
      provinceList = filteredCentralProvinces;
    } else if (region === "mien-nam") {
      provinceList = filteredSouthProvinces;
    }

    // Lấy danh sách province_id
    const provinceIds = provinceList.map((p) => p.province_id);

    // Cập nhật giá trị provinces, thêm các province_id mới
    const currentProvinces = provinces || [];
    const newProvinces = [...new Set([...currentProvinces, ...provinceIds])];
    methods.setValue("provinces", newProvinces);
    setValidationError(null);
  };

  // Bỏ chọn tất cả đài của một miền
  const deselectAllProvinces = (region: string) => {
    const regionProvinces = getRegionProvinces(region).map(
      (p) => p.province_id
    );
    methods.setValue(
      "provinces",
      provinces.filter((p) => !regionProvinces.includes(p))
    );
  };

  // Xóa tất cả selection
  const clearAllProvinces = () => {
    methods.setValue("provinces", []);
  };

  // Kiểm tra validation
  useEffect(() => {
    if (availableProvinceCount > 0 && provinces.length === 0) {
      setValidationError("Vui lòng chọn ít nhất một đài xổ số");
    } else {
      setValidationError(null);
    }
  }, [provinces, availableProvinceCount]);

  // Render một column cho một miền
  const renderProvinceColumn = (
    region: string,
    title: string,
    filteredProvinces: any[]
  ) => {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <div className="flex space-x-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => selectAllProvinces(region)}
              disabled={filteredProvinces.length === 0}
            >
              Chọn tất cả
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => deselectAllProvinces(region)}
              disabled={!provinceDetails.byRegion[region]?.length}
            >
              Bỏ chọn
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm italic">Đang tải dữ liệu...</p>
        ) : filteredProvinces.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-md text-center">
            <p className="text-sm text-gray-500">
              {drawDate
                ? "Không có đài xổ số cho ngày này"
                : "Vui lòng chọn ngày xổ số"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md shadow-sm bg-white">
            {filteredProvinces.map((province) => (
              <label
                key={province.id}
                className="flex items-center py-1.5 hover:bg-gray-50 px-2 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  value={province.province_id}
                  className="form-checkbox text-lottery-primary rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      methods.setValue("provinces", [
                        ...provinces,
                        province.province_id,
                      ]);
                    } else {
                      methods.setValue(
                        "provinces",
                        provinces.filter((p) => p !== province.province_id)
                      );
                    }
                    setValidationError(null);
                  }}
                  checked={provinces.includes(province.province_id)}
                />
                <span className="ml-2 flex-1">{province.name}</span>
                {province.code && (
                  <span className="text-xs text-gray-500">{province.code}</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Chọn miền và đài xổ số</h2>

        {drawDate && (
          <div className="mb-4">
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
              <span className="mr-1">Ngày xổ:</span>
              <span className="font-medium">{formattedDayOfWeek}</span>
            </div>
            {availableProvinceCount > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                (Có {availableProvinceCount} đài xổ số)
              </span>
            )}
          </div>
        )}

        {validationError && (
          <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Miền Bắc */}
        {renderProvinceColumn("mien-bac", "Miền Bắc", filteredNorthProvinces)}

        {/* Miền Trung */}
        {renderProvinceColumn(
          "mien-trung",
          "Miền Trung",
          filteredCentralProvinces
        )}

        {/* Miền Nam */}
        {renderProvinceColumn("mien-nam", "Miền Nam", filteredSouthProvinces)}
      </div>

      {provinces.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-md border shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <h3 className="font-medium">
                Đã chọn {provinces.length} đài xổ số
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-gray-500 hover:text-red-600"
              onClick={clearAllProvinces}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          </div>

          {/* Hiển thị đài đã chọn - thiết kế gọn hơn */}
          <div className="flex flex-wrap gap-6 bg-gray-50 rounded-md p-3">
            {/* Miền Bắc */}
            {provinceDetails.byRegion["mien-bac"].length > 0 && (
              <div className="inline-flex items-center">
                <span className="px-2 py-1 rounded-l-md bg-blue-100 text-blue-700 text-xs font-medium border border-blue-200">
                  Bắc
                </span>
                <div className="flex border border-l-0 border-blue-200 rounded-r-md bg-white">
                  {provinceDetails.byRegion["mien-bac"].map((name, index) => (
                    <span key={index} className="px-2 py-1 text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Miền Trung */}
            {provinceDetails.byRegion["mien-trung"].length > 0 && (
              <div className="inline-flex items-center">
                <span className="px-2 py-1 rounded-l-md bg-green-100 text-green-700 text-xs font-medium border border-green-200">
                  Trung
                </span>
                <div className="flex flex-wrap border border-l-0 border-green-200 rounded-r-md bg-white">
                  {provinceDetails.byRegion["mien-trung"].map((name, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-sm border-r last:border-r-0 border-green-100"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Miền Nam */}
            {provinceDetails.byRegion["mien-nam"].length > 0 && (
              <div className="inline-flex items-center">
                <span className="px-2 py-1 rounded-l-md bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
                  Nam
                </span>
                <div className="flex flex-wrap border border-l-0 border-amber-200 rounded-r-md bg-white">
                  {provinceDetails.byRegion["mien-nam"].map((name, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-sm border-r last:border-r-0 border-amber-100"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="mt-3 flex items-start text-xs text-gray-500">
            <Info className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
            <p>
              Hệ thống sẽ tạo phiếu cược riêng cho mỗi đài xổ số. Tổng tiền cược
              sẽ được tính cho từng đài.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
