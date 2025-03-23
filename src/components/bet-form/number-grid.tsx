// src/components/bet-form/number-grid.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, X, RefreshCw, Trash2, Filter, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NumberGridProps {
  selectedNumbers: string[];
  onChange: (numbers: string[]) => void;
  digitCount: number;
  className?: string;
  maxSelections?: number;
}

export function NumberGrid({
  selectedNumbers,
  onChange,
  digitCount,
  className,
  maxSelections = 1000,
}: NumberGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Generate all possible numbers based on digit count
  const allNumbers = useMemo(() => {
    const max = Math.min(Math.pow(10, digitCount), 10000); // Cap at 10000 to prevent performance issues
    return Array.from({ length: max }, (_, i) =>
      i.toString().padStart(digitCount, "0")
    );
  }, [digitCount]);

  // Filter numbers based on search term
  const filteredNumbers = useMemo(() => {
    if (!searchTerm) return allNumbers;
    return allNumbers.filter((num) => num.includes(searchTerm));
  }, [allNumbers, searchTerm]);

  // Handle selecting a number
  const toggleNumber = (number: string) => {
    if (selectedNumbers.includes(number)) {
      // Remove number
      onChange(selectedNumbers.filter((n) => n !== number));
    } else {
      // Add number
      if (selectedNumbers.length >= maxSelections) {
        // Maybe show a toast or alert here
        return;
      }
      onChange([...selectedNumbers, number]);
    }
  };

  // Add multiple numbers at once
  const addNumbers = (numbers: string[]) => {
    const newNumbers = [...selectedNumbers];

    numbers.forEach((num) => {
      if (!newNumbers.includes(num)) {
        if (newNumbers.length < maxSelections) {
          newNumbers.push(num);
        }
      }
    });

    onChange(newNumbers);
  };

  // Clear all selected numbers
  const clearSelection = () => {
    onChange([]);
  };

  // Initialize predefined number groups (for 2 digits)
  const numberGroups = useMemo(() => {
    if (digitCount !== 2) return {};

    // For 2 digits, create groups like: Even, Odd, High (50-99), Low (00-49), etc.
    const even = allNumbers.filter((n) => parseInt(n) % 2 === 0);
    const odd = allNumbers.filter((n) => parseInt(n) % 2 !== 0);
    const high = allNumbers.filter((n) => parseInt(n) >= 50);
    const low = allNumbers.filter((n) => parseInt(n) < 50);
    const doubles = allNumbers.filter((n) => n[0] === n[1]); // Like 00, 11, 22, etc.

    // Create decade groups (00-09, 10-19, etc.)
    const decades: Record<string, string[]> = {};
    for (let i = 0; i < 10; i++) {
      const prefix = i.toString();
      decades[`${prefix}0-${prefix}9`] = allNumbers.filter(
        (n) => n[0] === prefix
      );
    }

    // Create unit groups (x0, x1, x2, etc.)
    const units: Record<string, string[]> = {};
    for (let i = 0; i < 10; i++) {
      const suffix = i.toString();
      units[`x${suffix}`] = allNumbers.filter((n) => n[1] === suffix);
    }

    return {
      even,
      odd,
      high,
      low,
      doubles,
      ...decades,
      ...units,
    };
  }, [allNumbers, digitCount]);

  // Filter based on active tab
  const displayNumbers = useMemo(() => {
    if (activeTab === "all" || !numberGroups[activeTab]) {
      return filteredNumbers;
    }
    return numberGroups[activeTab].filter(
      (n) => !searchTerm || n.includes(searchTerm)
    );
  }, [filteredNumbers, activeTab, numberGroups, searchTerm]);

  // Effect to reset to "all" tab when digit count changes
  useEffect(() => {
    setActiveTab("all");
    setSearchTerm("");
  }, [digitCount]);

  // Pagination for grid view (to handle large numbers of items)
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = digitCount === 2 ? 100 : digitCount === 3 ? 100 : 50;

  const totalPages = Math.ceil(displayNumbers.length / itemsPerPage);

  const paginatedNumbers = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return displayNumbers.slice(start, start + itemsPerPage);
  }, [displayNumbers, currentPage, itemsPerPage]);

  // When filter/search changes, reset to first page
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, activeTab]);

  // Helper function to add all currently filtered numbers
  const addAllFilteredNumbers = () => {
    if (displayNumbers.length > 1000) {
      // Limit to 1000 numbers to prevent performance issues
      addNumbers(displayNumbers.slice(0, 1000));
    } else {
      addNumbers(displayNumbers);
    }
  };

  // Create tabs for 2-digit number groups
  const groupTabs = useMemo(() => {
    if (digitCount !== 2) return null;

    const decadeKeys = Object.keys(numberGroups).filter((key) =>
      key.includes("-")
    );
    const unitKeys = Object.keys(numberGroups).filter((key) =>
      key.startsWith("x")
    );

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Bộ lọc nhanh:</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs h-7"
          >
            <Filter className="h-3 w-3 mr-1" />
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-4 mb-4 border p-3 rounded-md bg-gray-50">
            <div>
              <p className="text-xs font-medium mb-2">Bộ lọc cơ bản:</p>
              <TabsList className="flex flex-wrap h-auto gap-1">
                <TabsTrigger value="all" className="h-7 px-2 py-0 text-xs">
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value="even" className="h-7 px-2 py-0 text-xs">
                  Chẵn
                </TabsTrigger>
                <TabsTrigger value="odd" className="h-7 px-2 py-0 text-xs">
                  Lẻ
                </TabsTrigger>
                <TabsTrigger value="high" className="h-7 px-2 py-0 text-xs">
                  Tài (50-99)
                </TabsTrigger>
                <TabsTrigger value="low" className="h-7 px-2 py-0 text-xs">
                  Xỉu (00-49)
                </TabsTrigger>
                <TabsTrigger value="doubles" className="h-7 px-2 py-0 text-xs">
                  Số đôi
                </TabsTrigger>
              </TabsList>
            </div>

            <div>
              <p className="text-xs font-medium mb-2">Theo chục (hàng chục):</p>
              <div className="flex flex-wrap gap-1">
                {decadeKeys.map((decadeKey) => (
                  <TabsTrigger
                    key={decadeKey}
                    value={decadeKey}
                    className="h-7 px-2 py-0 text-xs"
                  >
                    {decadeKey}
                  </TabsTrigger>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2">
                Theo đơn vị (hàng đơn vị):
              </p>
              <div className="flex flex-wrap gap-1">
                {unitKeys.map((unitKey) => (
                  <TabsTrigger
                    key={unitKey}
                    value={unitKey}
                    className="h-7 px-2 py-0 text-xs"
                  >
                    {unitKey.replace("x", "*")}
                  </TabsTrigger>
                ))}
              </div>
            </div>
          </div>
        )}
      </Tabs>
    );
  }, [digitCount, activeTab, numberGroups, showFilters]);

  // Create column layout based on digit count
  const gridCols =
    digitCount === 2
      ? "grid-cols-10"
      : digitCount === 3
      ? "grid-cols-10 md:grid-cols-20"
      : "grid-cols-5 md:grid-cols-10";

  // Create digit selector for 3 and 4 digits
  const digitSelector = useMemo(() => {
    if (digitCount <= 2) return null;

    // For 3-4 digits, add quick filters for first digit(s)
    const prefixLength = digitCount - 2; // Number of prefix digits to select
    const possiblePrefixes: string[] = [];

    // Generate all possible prefixes
    const maxPrefix = Math.pow(10, prefixLength);
    for (let i = 0; i < maxPrefix; i++) {
      possiblePrefixes.push(i.toString().padStart(prefixLength, "0"));
    }

    return (
      <div className="mb-4 border p-3 rounded-md bg-gray-50">
        <h4 className="text-sm font-medium mb-2">
          Chọn nhanh {prefixLength} chữ số đầu:
        </h4>
        <div className="flex flex-wrap gap-1">
          {possiblePrefixes.map((prefix) => (
            <Button
              key={prefix}
              variant="outline"
              size="sm"
              className="h-7 px-2 py-0"
              onClick={() => setSearchTerm(prefix)}
            >
              {prefix}
            </Button>
          ))}
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 py-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3 w-3 mr-1" /> Xóa
            </Button>
          )}
        </div>
      </div>
    );
  }, [digitCount, searchTerm]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with search and controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Tìm số (${digitCount} chữ số)`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="text-xs"
          >
            {viewMode === "grid" ? "Dạng danh sách" : "Dạng lưới"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedNumbers.length === 0}
            className="text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Xóa tất cả
          </Button>
        </div>
      </div>

      {/* Selected numbers overview */}
      {selectedNumbers.length > 0 && (
        <div className="bg-gray-50 rounded-md p-3 border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">
              Đã chọn {selectedNumbers.length} số
              {maxSelections < 1000 && ` (tối đa ${maxSelections})`}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-7 px-2 text-xs text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Xóa tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1">
            {selectedNumbers.map((number) => (
              <Badge
                key={number}
                variant="outline"
                className="bg-white flex items-center"
              >
                {number}
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-red-500"
                  onClick={() => toggleNumber(number)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Quick filters for 3-4 digits */}
      {digitSelector}

      {/* Tabs for grouping (only for 2 digits) */}
      {groupTabs}

      {/* Number display - either grid or list */}
      {displayNumbers.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {displayNumbers.length} số phù hợp
              {activeTab !== "all" && ` (${activeTab})`}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAllFilteredNumbers}
              className="text-xs"
              disabled={
                displayNumbers.length === 0 ||
                selectedNumbers.length >= maxSelections
              }
            >
              <Plus className="h-3 w-3 mr-1" /> Thêm tất cả
            </Button>
          </div>

          {viewMode === "grid" ? (
            <div className={`grid ${gridCols} gap-1`}>
              {paginatedNumbers.map((number: string) => (
                <button
                  key={number}
                  type="button"
                  className={cn(
                    "p-1 text-center border rounded hover:bg-gray-100 transition-colors",
                    selectedNumbers.includes(number)
                      ? "bg-lottery-primary text-white hover:bg-lottery-primary/90"
                      : ""
                  )}
                  onClick={() => toggleNumber(number)}
                >
                  {number}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 max-h-60 overflow-y-auto p-1 border rounded-md">
              {paginatedNumbers.map((number: string) => (
                <Badge
                  key={number}
                  variant="outline"
                  className={cn(
                    "cursor-pointer",
                    selectedNumbers.includes(number)
                      ? "bg-lottery-primary text-white"
                      : "bg-white"
                  )}
                  onClick={() => toggleNumber(number)}
                >
                  {number}
                </Badge>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Hiển thị {currentPage * itemsPerPage + 1} -{" "}
                {Math.min(
                  (currentPage + 1) * itemsPerPage,
                  displayNumbers.length
                )}{" "}
                trong {displayNumbers.length} số
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Trước
                </Button>
                <span className="px-2 py-1 text-sm flex items-center">
                  {currentPage + 1}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                >
                  Sau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Cuối
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md border">
          <p className="text-gray-500">Không có số nào phù hợp với tìm kiếm</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setActiveTab("all");
            }}
            className="mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
