// src/components/bet-form/bet-form.tsx (cập nhật)
"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { BetFormHeader } from "./bet-form-header";
import { RegionSelection } from "./region-selection";
import { BetTypeSelection } from "./bet-type-selection";
import { BetSummary } from "./bet-summary";
import {
  betFormSchema,
  BetFormValues,
} from "@/lib/validators/bet-form-validator";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePlaceBet } from "@/lib/hooks/use-place-bet";

// Fake user data for demo purposes
const demoUser = {
  id: "3a652095-83ce-4c36-aa89-cef8bdeaf7c8",
  name: "Nguyễn Văn A",
  balance: 10000000, // 10 triệu VND
};

export function BetForm() {
  const { toast } = useToast();

  // State để theo dõi quá trình cược
  const [isMultiRegion, setIsMultiRegion] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [potentialWin, setPotentialWin] = useState(0);
  const [isBalanceEnough, setIsBalanceEnough] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedBets, setSavedBets] = useState<any[]>([]);
  const [isSavedBetsOpen, setIsSavedBetsOpen] = useState(false);

  // *** Mutation để đặt cược
  const placeBet = usePlaceBet();

  // Form với validation
  const methods = useForm<BetFormValues>({
    resolver: zodResolver(betFormSchema),
    defaultValues: {
      betDate: new Date(),
      drawDate: new Date(),
      regionType: "M1",
      provinces: [],
      betType: "",
      numbers: [],
      selectionMethod: "manual",
      denomination: 10000,
      userId: demoUser.id,
    },
  });

  // Kiểm tra số dư khi tổng tiền thay đổi
  useEffect(() => {
    setIsBalanceEnough(demoUser.balance >= totalAmount);
  }, [totalAmount]);

  // Xử lý khi submit form
  const onSubmit = () => {
    // Kiểm tra lại số dư
    if (!isBalanceEnough) {
      toast({
        title: "Số dư không đủ",
        description: "Vui lòng nạp thêm tiền để đặt cược.",
        variant: "destructive",
      });
      return;
    }

    // console.log("Form state:", methods.formState);
    // console.log("Form values:", methods.getValues());
    // console.log("Total amount:", totalAmount);
    // console.log("Is balance enough:", isBalanceEnough);
    // console.log("Form errors:", methods.formState.errors);

    // Mở dialog xác nhận
    setIsSummaryOpen(true);
  };

  // Xử lý khi xác nhận đặt cược
  const handleConfirmBet = async () => {
    try {
      setIsSubmitting(true);

      const formData = methods.getValues();

      // Thêm userId (demo)
      const betData = {
        ...formData,
        userId: demoUser.id,
      };

      // Gọi API đặt cược
      await placeBet.mutateAsync(betData);

      // Hiển thị thông báo thành công
      toast({
        title: "Đặt cược thành công",
        description: `Đã đặt ${
          formData.numbers.length
        } số với tổng tiền ${formatCurrency(totalAmount)}`,
      });

      // Đóng dialog summary
      setIsSummaryOpen(false);

      // Reset form
      methods.reset({
        betDate: new Date(),
        drawDate: new Date(),
        regionType: "M1",
        provinces: [],
        betType: "",
        numbers: [],
        selectionMethod: "manual",
        denomination: 10000,
      });

      // Reset state
      setTotalAmount(0);
      setPotentialWin(0);
    } catch (error: any) {
      toast({
        title: "Lỗi đặt cược",
        description:
          error.message || "Có lỗi xảy ra khi đặt cược. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lưu mẫu cược
  const handleSaveBetTemplate = () => {
    const formData = methods.getValues();

    // Kiểm tra dữ liệu hợp lệ
    if (
      !formData.betType ||
      formData.provinces.length === 0 ||
      formData.numbers.length === 0
    ) {
      toast({
        title: "Không thể lưu mẫu",
        description: "Vui lòng nhập đầy đủ thông tin cược.",
        variant: "destructive",
      });
      return;
    }

    // Lưu mẫu cược
    const template = {
      id: Date.now().toString(),
      name: `Cược ${formData.betType} - ${new Date().toLocaleTimeString()}`,
      data: { ...formData },
    };

    setSavedBets((prev) => [...prev, template]);

    toast({
      title: "Đã lưu mẫu cược",
      description: "Bạn có thể sử dụng lại mẫu này trong các lần cược sau.",
    });
  };

  // Sử dụng mẫu cược đã lưu
  const handleUseSavedBet = (savedBet: any) => {
    // Reset form với dữ liệu từ mẫu
    methods.reset(savedBet.data);

    // Đóng dialog
    setIsSavedBetsOpen(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <BetFormHeader />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <RegionSelection
              isMultiRegion={isMultiRegion}
              setIsMultiRegion={setIsMultiRegion}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <BetTypeSelection
              setTotalAmount={setTotalAmount}
              setPotentialWin={setPotentialWin}
            />
          </CardContent>
        </Card>

        {/* Hiển thị tổng tiền và nút đặt cược */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 w-full md:w-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tổng tiền đặt:</p>
                <p className="text-xl font-bold text-lottery-primary">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiềm năng thắng:</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(potentialWin)}
                </p>
              </div>
            </div>

            {!isBalanceEnough && (
              <p className="text-red-500 text-sm mt-2">
                Số dư không đủ để đặt cược
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSavedBetsOpen(true)}
            >
              Mẫu đã lưu {savedBets.length > 0 && `(${savedBets.length})`}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleSaveBetTemplate}
            >
              Lưu mẫu
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => methods.reset()}
            >
              Nhập lại
            </Button>

            <Button
              type="submit"
              variant="lottery"
              disabled={totalAmount <= 0 || methods.formState.isSubmitting}
            >
              Đặt cược
            </Button>
          </div>
        </div>

        {/* Dialog xác nhận đặt cược */}
        <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Xác nhận đặt cược</DialogTitle>
            </DialogHeader>

            <BetSummary
              totalAmount={totalAmount}
              potentialWin={potentialWin}
              isBalanceEnough={isBalanceEnough}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSummaryOpen(false)}
                disabled={isSubmitting}
              >
                Huỷ
              </Button>
              <Button
                variant="lottery"
                onClick={handleConfirmBet}
                disabled={!isBalanceEnough || isSubmitting}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt cược"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog mẫu cược đã lưu */}
        <Dialog open={isSavedBetsOpen} onOpenChange={setIsSavedBetsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mẫu cược đã lưu</DialogTitle>
            </DialogHeader>

            {savedBets.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-gray-500">Bạn chưa lưu mẫu cược nào</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {savedBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="p-3 border rounded-md mb-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUseSavedBet(bet)}
                  >
                    <p className="font-medium">{bet.name}</p>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">
                        {bet.data.betType} - {bet.data.numbers.length} số
                      </span>
                      <span>{formatCurrency(bet.data.denomination)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSavedBetsOpen(false)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </FormProvider>
  );
}
