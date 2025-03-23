// src/components/bet-form/bet-summary.tsx
import { useFormContext } from "react-hook-form";
import { BetFormValues } from "@/lib/validators/bet-form-validator";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useProvincesByRegion } from "@/lib/hooks/use-provinces";
import { useBetTypes } from "@/lib/hooks/use-bet-types";
import {
  Info,
  AlertCircle,
  Check,
  DollarSign,
  Calendar,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define the Province interface
interface Province {
  province_id: string;
  name: string;
  region_type: "M1" | "M2";
  // Add other properties if needed
}

interface BetSummaryProps {
  totalAmount: number;
  potentialWin: number;
  isBalanceEnough: boolean;
}

export function BetSummary({
  totalAmount,
  potentialWin,
  isBalanceEnough,
}: BetSummaryProps) {
  const { watch } = useFormContext<BetFormValues>();

  const betDate = watch("betDate");
  const drawDate = watch("drawDate");
  const regionType = watch("regionType");
  const provinces = watch("provinces") || [];
  const betType = watch("betType");
  const betVariant = watch("betVariant");
  const numbers = watch("numbers") || [];
  const denomination = watch("denomination");

  // Lấy thông tin tỉnh
  const { data: provincesByRegion } = useProvincesByRegion();

  // Lấy thông tin loại cược
  const { data: betTypes } = useBetTypes();

  // Tìm tên tỉnh dựa trên ID
  const getProvinceNames = () => {
    if (!provincesByRegion) return [];

    // Create a properly typed array of provinces
    let allProvinces: Province[] = [];

    if (Array.isArray(provincesByRegion)) {
      // If provincesByRegion is already an array
      allProvinces = provincesByRegion as Province[];
    } else {
      // If provincesByRegion is an object with region keys
      Object.values(provincesByRegion || {}).forEach((regionProvinces) => {
        if (Array.isArray(regionProvinces)) {
          // Add type assertion to tell TypeScript these are Provinces
          allProvinces = [...allProvinces, ...(regionProvinces as Province[])];
        }
      });
    }

    return provinces.map((id) => {
      const province = allProvinces.find((p: Province) => p.province_id === id);
      return {
        name: province ? province.name : id,
        regionType: province ? province.region_type : regionType,
      };
    });
  };

  // Tìm thông tin loại cược
  const getBetTypeInfo = () => {
    if (!betTypes)
      return { name: betType, variantName: betVariant, specialNote: null };

    const betTypeInfo = betTypes.find((bt) => bt.bet_type_id === betType);
    if (!betTypeInfo)
      return { name: betType, variantName: betVariant, specialNote: null };

    const variantInfo =
      betVariant && betTypeInfo.variants
        ? (typeof betTypeInfo.variants === "string"
            ? JSON.parse(betTypeInfo.variants)
            : betTypeInfo.variants
          ).find((v: any) => v.id === betVariant)
        : null;

    // Thêm note đặc biệt cho các loại cược đặc thù
    let specialNote = null;

    if (betType === "xien") {
      specialNote = "Chỉ thắng khi TẤT CẢ các số đều xuất hiện trong kết quả.";
    } else if (betType === "da") {
      specialNote =
        "Có nhiều trường hợp trúng khác nhau tùy thuộc vào số lượng số trúng và số lần xuất hiện.";
    }

    return {
      name: betTypeInfo.name,
      variantName: variantInfo ? variantInfo.name : undefined,
      specialNote,
    };
  };

  // Phân loại số (Tài, Xỉu, Chẵn, Lẻ) - chỉ dành cho số 2 chữ số
  const categorizeNumbers = () => {
    if (numbers.length === 0)
      return { high: [], low: [], even: [], odd: [], doubles: [] };

    // Bỏ qua nếu không phải số 2 chữ số
    if (numbers[0].length !== 2)
      return { high: [], low: [], even: [], odd: [], doubles: [] };

    // Phân loại các số
    const categories = {
      high: numbers.filter((n) => parseInt(n) >= 50), // Tài (50-99)
      low: numbers.filter((n) => parseInt(n) < 50), // Xỉu (00-49)
      even: numbers.filter((n) => parseInt(n) % 2 === 0), // Chẵn
      odd: numbers.filter((n) => parseInt(n) % 2 !== 0), // Lẻ
      doubles: numbers.filter((n) => n[0] === n[1]), // Số đôi (00, 11, 22...)
    };

    return categories;
  };

  const provinceDetails = getProvinceNames();
  const { name: betTypeName, variantName, specialNote } = getBetTypeInfo();
  const numberCategories = categorizeNumbers();

  // Tạo layout số đã chọn theo dạng lưới hoặc danh sách
  const renderNumbersGrid = () => {
    if (numbers.length === 0) return null;

    // Nếu có ít hơn 50 số, hiển thị dạng lưới
    if (numbers.length <= 50) {
      return (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 p-2 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
          {numbers.map((num) => (
            <div
              key={num}
              className="text-center py-1 px-2 bg-white border rounded-md text-sm"
            >
              {num}
            </div>
          ))}
        </div>
      );
    }

    // Nếu có nhiều số hơn, hiển thị dạng danh sách với thông tin phân loại
    return (
      <div className="p-3 bg-gray-50 rounded-md">
        <div className="mb-2">
          <span className="font-medium">Tổng số: </span>
          <span className="text-lottery-primary font-bold">
            {numbers.length} số
          </span>
        </div>

        {Object.keys(numberCategories).length > 0 && (
          <div className="space-y-1 text-sm">
            {numberCategories.high?.length > 0 && (
              <div>
                <span className="font-medium">Tài (50-99): </span>
                {numberCategories.high.length} số
              </div>
            )}
            {numberCategories.low?.length > 0 && (
              <div>
                <span className="font-medium">Xỉu (00-49): </span>
                {numberCategories.low.length} số
              </div>
            )}
            {numberCategories.even?.length > 0 && (
              <div>
                <span className="font-medium">Chẵn: </span>
                {numberCategories.even.length} số
              </div>
            )}
            {numberCategories.odd?.length > 0 && (
              <div>
                <span className="font-medium">Lẻ: </span>
                {numberCategories.odd.length} số
              </div>
            )}
            {numberCategories.doubles?.length > 0 && (
              <div>
                <span className="font-medium">Số đôi: </span>
                {numberCategories.doubles.length} số
              </div>
            )}
          </div>
        )}

        <div className="mt-2">
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              Xem tất cả số
            </summary>
            <div className="mt-2 p-2 bg-white border rounded-md max-h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {numbers.map((num) => (
                  <span
                    key={num}
                    className="px-2 py-1 bg-gray-50 border rounded-md"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header với tổng tiền nổi bật */}
      <div className="bg-lottery-primary/10 rounded-lg p-4 border-2 border-lottery-primary">
        <div className="text-center">
          <div className="text-lottery-primary font-semibold text-lg mb-2">
            Tổng tiền cược
          </div>
          <div className="text-3xl font-bold text-lottery-primary mb-2">
            {formatCurrency(totalAmount)}
          </div>
          <div className="flex justify-center gap-8 text-sm mt-4">
            <div className="text-center">
              <div className="text-gray-600 mb-1">Mệnh giá</div>
              <div className="font-semibold">
                {formatCurrency(denomination)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 mb-1">Số lượng</div>
              <div className="font-semibold">{numbers.length} số</div>
            </div>
            <div className="text-center">
              <div className="text-gray-600 mb-1">Đài xổ số</div>
              <div className="font-semibold">{provinces.length} đài</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-lottery-primary" />
            Thông tin thời gian
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Ngày đặt cược:</span>
              <span className="font-medium">
                {format(betDate, "EEEE, dd/MM/yyyy", { locale: vi })}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Ngày xổ số:</span>
              <Badge variant="outline" className="bg-blue-50 font-medium">
                {format(drawDate, "EEEE, dd/MM/yyyy", { locale: vi })}
              </Badge>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-lottery-primary" />
            Đài xổ số
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Miền:</span>
              <span className="font-medium">
                {regionType === "M1" ? "Miền Nam/Trung" : "Miền Bắc"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {provinceDetails.map((province, i) => (
                <Badge key={i} variant="outline" className="bg-gray-50">
                  {province.name}
                  {province.regionType !== regionType && (
                    <span className="ml-1 text-xs text-blue-600 font-normal">
                      ({province.regionType})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-lottery-primary" />
          Thông tin cược
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Loại cược:</div>
            <div className="font-semibold text-lg">
              {betTypeName}
              {variantName && (
                <span className="text-sm font-normal ml-1">
                  ({variantName})
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Mệnh giá:</div>
            <div className="font-semibold text-lg">
              {formatCurrency(denomination)}
            </div>
          </div>
        </div>

        {/* Hiển thị thông báo đặc biệt cho loại cược */}
        {specialNote && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start mb-4">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-700">{specialNote}</p>
          </div>
        )}

        {/* Danh sách số đã chọn */}
        <div className="mb-2">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            Các số đã chọn ({numbers.length})
          </h4>
          {renderNumbersGrid()}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-center text-gray-700 font-medium mb-1">
              Tổng tiền đặt
            </h3>
            <div className="text-center text-xl font-bold text-lottery-primary">
              {formatCurrency(totalAmount)}
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-center text-gray-700 font-medium mb-1">
              Tiềm năng thắng
            </h3>
            <div className="text-center text-xl font-bold text-green-600">
              {formatCurrency(potentialWin)}
            </div>
          </div>
        </div>

        {betType === "da" && (
          <div className="text-xs text-gray-500 italic mt-2 text-center">
            * Tiềm năng thắng thực tế có thể khác nhau tùy thuộc vào các trường
            hợp trúng cụ thể
          </div>
        )}
      </div>

      {!isBalanceEnough && (
        <div className="bg-red-50 border-2 border-red-300 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-red-600 font-medium">
              Số dư không đủ để đặt cược
            </p>
            <p className="text-sm text-red-500 mt-1">
              Vui lòng nạp thêm tiền hoặc giảm số tiền cược để tiếp tục.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
