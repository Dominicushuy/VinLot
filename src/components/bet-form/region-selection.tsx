// src/components/bet-form/region-selection.tsx
"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useProvincesByRegion } from "@/lib/hooks/use-provinces";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BetFormValues } from "@/lib/validators/bet-form-validator";
import { getDayOfWeekSlug } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RegionSelectionProps {
  isMultiRegion: boolean;
  setIsMultiRegion: (value: boolean) => void;
}

export function RegionSelection({
  isMultiRegion,
  setIsMultiRegion,
}: RegionSelectionProps) {
  const { register, setValue, watch, resetField } =
    useFormContext<BetFormValues>();
  const regionType = watch("regionType");
  const drawDate = watch("drawDate");
  const provinces = watch("provinces") || [];

  // Lấy danh sách tỉnh từ API
  const { data: provincesByRegion, isLoading } = useProvincesByRegion();

  // Xử lý khi thay đổi loại miền
  useEffect(() => {
    // Reset provinces khi đổi regionType
    if (!isMultiRegion) {
      resetField("provinces");
    }
  }, [regionType, resetField, isMultiRegion]);

  // Danh sách tỉnh theo miền
  const getRegionProvinces = (region: string) => {
    if (!provincesByRegion || isLoading) return [];
    return provincesByRegion[region] || [];
  };

  // Tỉnh miền Bắc
  const northProvinces = getRegionProvinces("mien-bac");
  // Tỉnh miền Trung
  const centralProvinces = getRegionProvinces("mien-trung");
  // Tỉnh miền Nam
  const southProvinces = getRegionProvinces("mien-nam");

  // Lọc tỉnh theo ngày trong tuần nếu có ngày xổ
  const filterProvincesByDay = (provinces: any[]) => {
    if (!drawDate) return provinces;

    const daySlug = getDayOfWeekSlug(drawDate);
    return provinces.filter(
      (p) => p.draw_days.includes(daySlug) && p.is_active
    );
  };

  // Áp dụng filter ngày
  const filteredNorthProvinces = filterProvincesByDay(northProvinces);
  const filteredCentralProvinces = filterProvincesByDay(centralProvinces);
  const filteredSouthProvinces = filterProvincesByDay(southProvinces);

  // Lấy tên tỉnh từ ID
  const getProvinceNames = () => {
    const allProvinces = [
      ...northProvinces,
      ...centralProvinces,
      ...southProvinces,
    ];
    return provinces.map((id) => {
      const province = allProvinces.find((p) => p.province_id === id);
      return province ? province.name : id;
    });
  };

  const provinceNames = getProvinceNames();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Chọn miền và đài xổ số</h2>

        <div className="flex items-center justify-between mb-6">
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="M1"
                className="form-radio text-lottery-primary"
                disabled={isMultiRegion}
                {...register("regionType")}
              />
              <span className="ml-2">Miền Nam/Trung (M1)</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                value="M2"
                className="form-radio text-lottery-primary"
                disabled={isMultiRegion}
                {...register("regionType")}
              />
              <span className="ml-2">Miền Bắc (M2)</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="multi-region"
              checked={isMultiRegion}
              onCheckedChange={setIsMultiRegion}
            />
            <Label htmlFor="multi-region">Chọn nhiều miền</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Miền Bắc */}
        <div
          className={isMultiRegion || regionType === "M2" ? "block" : "hidden"}
        >
          <h3 className="font-medium mb-3">Miền Bắc</h3>
          {isLoading ? (
            <p className="text-sm italic">Đang tải dữ liệu...</p>
          ) : filteredNorthProvinces.length === 0 ? (
            <p className="text-sm text-gray-500">
              Không có đài xổ số cho ngày này
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
              {filteredNorthProvinces.map((province) => (
                <label
                  key={province.id}
                  className="flex items-center py-1 hover:bg-gray-50 px-2 rounded"
                >
                  <input
                    type="checkbox"
                    value={province.province_id}
                    className="form-checkbox text-lottery-primary rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue("provinces", [
                          ...provinces,
                          province.province_id,
                        ]);
                      } else {
                        setValue(
                          "provinces",
                          provinces.filter((p) => p !== province.province_id)
                        );
                      }
                    }}
                    checked={provinces.includes(province.province_id)}
                  />
                  <span className="ml-2">{province.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Miền Trung */}
        <div
          className={isMultiRegion || regionType === "M1" ? "block" : "hidden"}
        >
          <h3 className="font-medium mb-3">Miền Trung</h3>
          {isLoading ? (
            <p className="text-sm italic">Đang tải dữ liệu...</p>
          ) : filteredCentralProvinces.length === 0 ? (
            <p className="text-sm text-gray-500">
              Không có đài xổ số cho ngày này
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
              {filteredCentralProvinces.map((province) => (
                <label
                  key={province.id}
                  className="flex items-center py-1 hover:bg-gray-50 px-2 rounded"
                >
                  <input
                    type="checkbox"
                    value={province.province_id}
                    className="form-checkbox text-lottery-primary rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue("provinces", [
                          ...provinces,
                          province.province_id,
                        ]);
                      } else {
                        setValue(
                          "provinces",
                          provinces.filter((p) => p !== province.province_id)
                        );
                      }
                    }}
                    checked={provinces.includes(province.province_id)}
                  />
                  <span className="ml-2">{province.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Miền Nam */}
        <div
          className={isMultiRegion || regionType === "M1" ? "block" : "hidden"}
        >
          <h3 className="font-medium mb-3">Miền Nam</h3>
          {isLoading ? (
            <p className="text-sm italic">Đang tải dữ liệu...</p>
          ) : filteredSouthProvinces.length === 0 ? (
            <p className="text-sm text-gray-500">
              Không có đài xổ số cho ngày này
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
              {filteredSouthProvinces.map((province) => (
                <label
                  key={province.id}
                  className="flex items-center py-1 hover:bg-gray-50 px-2 rounded"
                >
                  <input
                    type="checkbox"
                    value={province.province_id}
                    className="form-checkbox text-lottery-primary rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue("provinces", [
                          ...provinces,
                          province.province_id,
                        ]);
                      } else {
                        setValue(
                          "provinces",
                          provinces.filter((p) => p !== province.province_id)
                        );
                      }
                    }}
                    checked={provinces.includes(province.province_id)}
                  />
                  <span className="ml-2">{province.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {provinces.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm mb-2">
            <span className="font-medium">
              Đã chọn {provinces.length} đài xổ số
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {provinceNames.map((name, index) => (
              <Badge key={index} variant="outline" className="bg-white">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
