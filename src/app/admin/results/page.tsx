"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrawlerConfig } from "@/components/admin/results/crawler-config";
import { ManualCrawler } from "@/components/admin/results/manual-crawler";
import { CrawlerLogs } from "@/components/admin/results/crawler-logs";

export default function ResultsAdminPage() {
  const [activeTab, setActiveTab] = useState("config");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý kết quả xổ số</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tổng quan</CardTitle>
          <CardDescription>
            Quản lý cấu hình crawling và xem kết quả xổ số đã thu thập
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <p className="text-gray-500 mb-1">Cập nhật gần nhất</p>
              <p className="text-2xl font-bold">21/03/2025 18:30</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border">
              <p className="text-gray-500 mb-1">Trạng thái</p>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <p className="text-xl font-semibold">Hoạt động</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border">
              <p className="text-gray-500 mb-1">Lần crawl tiếp theo</p>
              <p className="text-xl font-semibold">22/03/2025 18:30</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="config">Cấu hình crawler</TabsTrigger>
          <TabsTrigger value="manual">Crawl thủ công</TabsTrigger>
          <TabsTrigger value="logs">Lịch sử crawl</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <CrawlerConfig />
        </TabsContent>

        <TabsContent value="manual">
          <ManualCrawler />
        </TabsContent>

        <TabsContent value="logs">
          <CrawlerLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
