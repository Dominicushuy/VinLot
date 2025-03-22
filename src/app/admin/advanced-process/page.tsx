"use client";

import { DiagnosticPanel } from "@/components/admin/results/diagnostic-panel";

export default function AdvancedProcessPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Công cụ đối soát nâng cao</h1>
      <p className="text-gray-600 mb-8">
        Sử dụng công cụ đối soát nâng cao này để chẩn đoán và khắc phục các vấn
        đề phát sinh trong quá trình đối soát kết quả xổ số.
      </p>

      <DiagnosticPanel />

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-8">
        <h3 className="font-medium text-amber-800 mb-2">Giải thích công cụ</h3>
        <p className="text-sm text-amber-700 mb-2">
          Công cụ đối soát nâng cao cung cấp các tính năng sau:
        </p>
        <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
          <li>
            <strong>Chẩn đoán</strong>: Kiểm tra và phát hiện các vấn đề tiềm ẩn
            như thiếu kết quả xổ số, cấu trúc dữ liệu không hợp lệ, loại cược
            không tồn tại...
          </li>
          <li>
            <strong>Đối soát nâng cao</strong>: Sử dụng thuật toán mạnh mẽ hơn
            để xử lý các phiếu cược, với cơ chế xử lý lỗi tốt hơn.
          </li>
          <li>
            <strong>Kết quả chi tiết</strong>: Hiển thị thông tin chi tiết về
            quá trình đối soát, bao gồm cả các phiếu gặp lỗi và nguyên nhân.
          </li>
        </ul>
      </div>
    </div>
  );
}
