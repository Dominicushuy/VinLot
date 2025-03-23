// src/components/bet-form/enhanced-bet-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  enhancedBetFormSchema,
  EnhancedBetFormValues,
} from "@/lib/validators/enhanced-bet-form-validator";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { EnhancedBetFormHeader } from "./enhanced-bet-form-header";
import { RegionSelection } from "./region-selection";
import { BetTypeSelection } from "./bet-type-selection";
import { BetSummary } from "./bet-summary";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Save,
  RefreshCw,
  ListX,
  AlertCircle,
  CreditCard,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePlaceBet } from "@/lib/hooks/use-place-bet";
import { cn } from "@/lib/utils";

// Fake user data for demo purposes
const demoUser = {
  id: "3a652095-83ce-4c36-aa89-cef8bdeaf7c8",
  name: "Nguyễn Văn A",
  balance: 10000000, // 10 triệu VND
};

// Step interface
interface Step {
  id: string;
  title: string;
  description: string;
  validate?: () => boolean;
}

export function EnhancedBetForm() {
  const { toast } = useToast();
  const placeBet = usePlaceBet();

  // State for form progress
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState<boolean[]>([
    false,
    false,
    false,
  ]);

  // State for summary and saved bets
  const [totalAmount, setTotalAmount] = useState(0);
  const [potentialWin, setPotentialWin] = useState(0);
  const [isBalanceEnough, setIsBalanceEnough] = useState(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedBets, setSavedBets] = useState<any[]>([]);
  const [isSavedBetsOpen, setIsSavedBetsOpen] = useState(false);

  // Form với validation cải tiến
  const methods = useForm<EnhancedBetFormValues>({
    resolver: zodResolver(enhancedBetFormSchema),
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
    mode: "onChange",
  });

  // Sử dụng useWatch để theo dõi thay đổi của provinces tốt hơn
  const watchedProvinces = useWatch({
    control: methods.control,
    name: "provinces",
  });

  // Theo dõi tất cả các giá trị quan trọng để tính toán lại tổng tiền
  const betType = useWatch({ control: methods.control, name: "betType" });
  const betVariant = useWatch({ control: methods.control, name: "betVariant" });
  const numbers = useWatch({ control: methods.control, name: "numbers" });
  const denomination = useWatch({
    control: methods.control,
    name: "denomination",
  });

  console.log({
    watchedProvinces,
    betType,
    betVariant,
    numbers,
    denomination,
    totalAmount,
  });

  // Watch form values
  const betDate = methods.watch("betDate");
  const drawDate = methods.watch("drawDate");

  // Define form steps
  const steps: Step[] = [
    {
      id: "dates",
      title: "Chọn ngày & thông tin cơ bản",
      description: "Chọn ngày đặt cược và ngày xổ số",
      validate: () => !!betDate && !!drawDate,
    },
    {
      id: "region",
      title: "Chọn đài xổ số",
      description: "Chọn miền và đài xổ số",
      validate: () => watchedProvinces && watchedProvinces.length > 0,
    },
    {
      id: "betType",
      title: "Loại cược & số",
      description: "Chọn loại cược và nhập số đánh",
      validate: () => !!betType && numbers.length > 0,
    },
  ];

  // Update step completion status
  useEffect(() => {
    const newCompletionStatus = [
      steps[0].validate ? steps[0].validate() : false,
      steps[1].validate ? steps[1].validate() : false,
      steps[2].validate ? steps[2].validate() : false,
    ];
    setIsCompleted(newCompletionStatus);
  }, [betDate, drawDate, watchedProvinces, betType, numbers]);

  // Check balance when total amount changes
  useEffect(() => {
    setIsBalanceEnough(demoUser.balance >= totalAmount);
  }, [totalAmount]);

  // Đảm bảo khi provinces thay đổi, total amount được tính toán lại
  useEffect(() => {
    // Chỉ log để xác nhận effect được gọi khi provinces thay đổi
    console.log("Provinces changed:", watchedProvinces?.length);
  }, [watchedProvinces]);

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Validate current step before proceeding
      if (steps[currentStep].validate && !steps[currentStep].validate()) {
        toast({
          title: "Thông tin không đủ",
          description: "Vui lòng điền đầy đủ thông tin trước khi tiếp tục",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle previous step
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Go to specific step
  const goToStep = (stepIndex: number) => {
    // Only allow going to completed steps or the current step + 1
    if (
      stepIndex <= currentStep ||
      (isCompleted[stepIndex - 1] && stepIndex === currentStep + 1)
    ) {
      setCurrentStep(stepIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle form submission
  const onSubmit = () => {
    // Validate the form
    methods.trigger().then((isValid) => {
      if (!isValid) {
        toast({
          title: "Thông tin không hợp lệ",
          description: "Vui lòng kiểm tra lại thông tin cược",
          variant: "destructive",
        });
        return;
      }

      // Check if all steps are completed
      if (!isCompleted.every((step) => step)) {
        toast({
          title: "Thông tin không đủ",
          description: "Vui lòng hoàn thành tất cả các bước trước khi đặt cược",
          variant: "destructive",
        });
        return;
      }

      // Check balance
      if (!isBalanceEnough) {
        toast({
          title: "Số dư không đủ",
          description: "Vui lòng nạp thêm tiền để đặt cược",
          variant: "destructive",
        });
        return;
      }

      // Open summary dialog
      setIsSummaryOpen(true);
    });
  };

  // Handle bet confirmation
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
        variant: "lottery",
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
        userId: demoUser.id,
      });

      // Reset state
      setTotalAmount(0);
      setPotentialWin(0);
      setCurrentStep(0);
      setIsCompleted([false, false, false]);
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
      variant: "lottery",
    });
  };

  // Sử dụng mẫu cược đã lưu
  const handleUseSavedBet = (savedBet: any) => {
    // Reset form với dữ liệu từ mẫu
    methods.reset(savedBet.data);

    // Update step completion
    const newCompletionStatus = [
      steps[0].validate ? steps[0].validate() : false,
      steps[1].validate ? steps[1].validate() : false,
      steps[2].validate ? steps[2].validate() : false,
    ];
    setIsCompleted(newCompletionStatus);

    // Đóng dialog
    setIsSavedBetsOpen(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress Steps */}
        <div className="hidden md:block">
          <div className="relative mb-2">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white",
                    currentStep === index
                      ? "border-lottery-primary text-lottery-primary"
                      : isCompleted[index]
                      ? "border-green-500 text-green-500 hover:bg-green-50"
                      : "border-gray-300 text-gray-500"
                  )}
                >
                  {isCompleted[index] ? (
                    <CheckCircle2 className="h-7 w-7" />
                  ) : (
                    <span className="text-lg">{index + 1}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            {steps.map((step) => (
              <div key={`text-${step.id}`} className="w-32 text-center">
                <div className="font-medium">{step.title}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* For mobile devices */}
        <div className="md:hidden">
          <div className="mb-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="font-medium">
                Bước {currentStep + 1} / {steps.length}
              </p>
              <p className="text-sm text-gray-500">
                {steps[currentStep].title}
              </p>
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {currentStep < steps.length - 1 && isCompleted[currentStep] && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {currentStep === 0 && <EnhancedBetFormHeader />}
          {currentStep === 1 && <RegionSelection />}
          {currentStep === 2 && (
            <BetTypeSelection
              setTotalAmount={setTotalAmount}
              setPotentialWin={setPotentialWin}
              provinces={watchedProvinces || []}
            />
          )}
        </div>

        {/* Error messages */}
        {Object.keys(methods.formState.errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Có các lỗi sau cần khắc phục:
                </h3>
                <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                  {Object.entries(methods.formState.errors).map(
                    ([field, error]) => (
                      <li key={field}>
                        {error.message || `Lỗi tại trường ${field}`}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation and action buttons */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-auto">
            <div className="flex items-center justify-between md:block">
              <div className="text-sm text-gray-600 mb-1">Tổng tiền đặt:</div>
              <div className="text-xl font-bold text-lottery-primary">
                {formatCurrency(totalAmount)}
              </div>
            </div>
            <div className="flex items-center justify-between md:block">
              <div className="text-sm text-gray-600 mb-1">Tiềm năng thắng:</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(potentialWin)}
              </div>
            </div>

            {!isBalanceEnough && (
              <p className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded-md">
                Số dư không đủ để đặt cược
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
            {/* Previous/Next buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 md:flex-auto"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="lottery"
                  className="flex-1 md:flex-auto"
                  onClick={handleNext}
                  disabled={!isCompleted[currentStep]}
                >
                  Tiếp tục <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="lottery"
                  className="flex-1 md:flex-auto"
                  onClick={onSubmit}
                  disabled={
                    !isCompleted[currentStep] ||
                    totalAmount <= 0 ||
                    !isBalanceEnough
                  }
                >
                  <CreditCard className="h-4 w-4 mr-1" /> Đặt cược
                </Button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSavedBetsOpen(true)}
                className="flex-1 md:flex-auto"
              >
                <Save className="h-4 w-4 mr-1" /> Mẫu đã lưu{" "}
                {savedBets.length > 0 && `(${savedBets.length})`}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveBetTemplate}
                className="flex-1 md:flex-auto"
              >
                <Save className="h-4 w-4 mr-1" /> Lưu mẫu
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => methods.reset()}
                className="flex-1 md:flex-auto"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Nhập lại
              </Button>
            </div>
          </div>
        </div>

        {/* Dialog xác nhận đặt cược */}
        <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-semibold">
                Xác nhận đặt cược
              </DialogTitle>
            </DialogHeader>

            <BetSummary
              totalAmount={totalAmount}
              potentialWin={potentialWin}
              isBalanceEnough={isBalanceEnough}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsSummaryOpen(false)}
                disabled={isSubmitting}
              >
                <ListX className="h-4 w-4 mr-1" /> Huỷ
              </Button>
              <Button
                variant="lottery"
                onClick={handleConfirmBet}
                disabled={!isBalanceEnough || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Đang xử
                    lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Xác nhận đặt cược
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog mẫu cược đã lưu */}
        <Dialog open={isSavedBetsOpen} onOpenChange={setIsSavedBetsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">Mẫu cược đã lưu</DialogTitle>
            </DialogHeader>

            {savedBets.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">Bạn chưa lưu mẫu cược nào</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {savedBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="p-4 border rounded-md mb-2 hover:bg-gray-50 cursor-pointer transition-colors"
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
