import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-lottery-primary mb-4">
          Hệ thống quản lý cá cược xổ số
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Quản lý toàn diện hoạt động cá cược xổ số với các công cụ hiện đại, hỗ
          trợ đầy đủ các loại cược và đài xổ số trên cả nước.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link
          href="/results"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-lottery-primary text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Kết quả xổ số</h2>
          <p className="text-gray-600">
            Xem kết quả xổ số mới nhất từ tất cả các đài
          </p>
        </Link>

        <Link
          href="/bet"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-lottery-secondary text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Đặt cược</h2>
          <p className="text-gray-600">
            Đặt cược dễ dàng với nhiều loại cược và phương thức chọn số
          </p>
        </Link>

        <Link
          href="/history"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-green-500 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Lịch sử cược</h2>
          <p className="text-gray-600">
            Theo dõi lịch sử đặt cược và kết quả trúng thưởng
          </p>
        </Link>

        <Link
          href="/admin"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-gray-700 text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Quản trị</h2>
          <p className="text-gray-600">
            Quản lý cài đặt hệ thống và tham số cá cược
          </p>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
          Tính năng nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Đầy đủ loại cược</h3>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Đầu Đuôi (dd) - Tỷ lệ 1:75</li>
              <li>Xỉu Chủ (xc) - Tỷ lệ 1:650</li>
              <li>Bao Lô (b2, b3, b4) - Tỷ lệ từ 1:75 đến 1:5500</li>
              <li>Và nhiều loại cược đặc biệt khác</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Phương thức chọn số thông minh</h3>
            <ul className="list-disc pl-5 text-gray-600">
              <li>12 con giáp: Tý, Sửu, Dần, Mão, ...</li>
              <li>Đảo số: Tự động tạo hoán vị</li>
              <li>Tài/Xỉu, Chẵn/Lẻ</li>
              <li>Kéo số theo nhiều cách</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
