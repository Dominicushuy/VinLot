// src/contexts/BetContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  enhancedBetFormSchema,
  EnhancedBetFormValues,
} from "@/lib/validators/enhanced-bet-form-validator";
import { calculateBetAmount, calculatePotentialWinAmount } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { usePlaceBet } from "@/lib/hooks/use-place-bet";
import { useProvincesByRegion } from "@/lib/hooks/use-provinces";
import { useBetTypes } from "@/lib/hooks/use-bet-types";

// Demo user data
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

// Define the context type
interface BetContextType {
  // Form methods
  methods: ReturnType<typeof useForm<EnhancedBetFormValues>>;

  // Step management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isCompleted: boolean[];
  steps: Step[];
  goToStep: (stepIndex: number) => void;
  handleNext: () => void;
  handlePrev: () => void;

  // Bet calculation
  totalAmount: number;
  potentialWin: number;
  isBalanceEnough: boolean;

  // Bet submission
  isSummaryOpen: boolean;
  setIsSummaryOpen: (open: boolean) => void;
  isSubmitting: boolean;
  handleConfirmBet: () => Promise<void>;

  // Saved bets
  savedBets: any[];
  isSavedBetsOpen: boolean;
  setIsSavedBetsOpen: (open: boolean) => void;
  handleSaveBetTemplate: () => void;
  handleUseSavedBet: (savedBet: any) => void;

  // Form reset
  resetForm: () => void;
}

interface Province {
  province_id: string;
  name: string;
  region_type: "M1" | "M2";
  // Add other necessary properties
}

// Create context with undefined initial value
const BetContext = createContext<BetContextType | undefined>(undefined);

// Context provider component
export function BetProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const placeBet = usePlaceBet();

  // Form with validation
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

  // Data hooks
  const { data: provincesByRegion } = useProvincesByRegion();
  const { data: betTypes } = useBetTypes();

  // Define form steps
  const steps: Step[] = [
    {
      id: "dates",
      title: "Chọn ngày & thông tin cơ bản",
      description: "Chọn ngày đặt cược và ngày xổ số",
      validate: () => {
        const betDate = methods.getValues("betDate");
        const drawDate = methods.getValues("drawDate");
        return !!betDate && !!drawDate;
      },
    },
    {
      id: "region",
      title: "Chọn đài xổ số",
      description: "Chọn miền và đài xổ số",
      validate: () => {
        const provinces = methods.getValues("provinces");
        return provinces && provinces.length > 0;
      },
    },
    {
      id: "betType",
      title: "Loại cược & số",
      description: "Chọn loại cược và nhập số đánh",
      validate: () => {
        const betType = methods.getValues("betType");
        const numbers = methods.getValues("numbers");
        return !!betType && numbers && numbers.length > 0;
      },
    },
  ];

  // Watch form values for calculations
  const formValues = methods.watch();

  // Update step completion status
  useEffect(() => {
    const newCompletionStatus = [
      steps[0].validate ? steps[0].validate() : false,
      steps[1].validate ? steps[1].validate() : false,
      steps[2].validate ? steps[2].validate() : false,
    ];
    setIsCompleted(newCompletionStatus);
  }, [
    formValues.betDate,
    formValues.drawDate,
    formValues.provinces,
    formValues.betType,
    formValues.numbers,
  ]);

  // Check balance when total amount changes
  useEffect(() => {
    setIsBalanceEnough(demoUser.balance >= totalAmount);
  }, [totalAmount]);

  // Calculate bet amounts when relevant values change
  useEffect(() => {
    const {
      betType,
      betVariant,
      regionType,
      denomination,
      numbers,
      provinces,
    } = formValues;

    // Skip calculation if essential data is missing
    if (
      !betType ||
      !numbers?.length ||
      !provinces?.length ||
      !betTypes?.length
    ) {
      setTotalAmount(0);
      setPotentialWin(0);
      return;
    }

    try {
      // Find bet type data from the betTypes list
      const currentBetTypeData = betTypes.find(
        (bt) => bt.bet_type_id === betType
      );
      if (!currentBetTypeData) {
        setTotalAmount(0);
        setPotentialWin(0);
        return;
      }

      // Parse region rules and winning ratio
      const regionRules =
        typeof currentBetTypeData.region_rules === "string"
          ? JSON.parse(currentBetTypeData.region_rules)
          : currentBetTypeData.region_rules;

      const winningRatio =
        typeof currentBetTypeData.winning_ratio === "string"
          ? JSON.parse(currentBetTypeData.winning_ratio)
          : currentBetTypeData.winning_ratio;

      // Calculate directly based on the selected regions
      let totalBetAmount = 0;
      let totalPotentialWin = 0;

      // Handle each province separately
      for (const provinceId of provinces) {
        // Find the province data to get correct region_type for each province
        let provinceData: Province | undefined;

        if (Array.isArray(provincesByRegion)) {
          // If it's an array, find the province directly
          provinceData = provincesByRegion.find(
            (p) => p.province_id === provinceId
          );
        } else if (provincesByRegion) {
          // If it's an object with arrays, flatten and find
          const allProvinces: Province[] = [];

          // Type-safe flattening
          Object.values(provincesByRegion).forEach((regionProvinces) => {
            if (Array.isArray(regionProvinces)) {
              regionProvinces.forEach((province) => {
                if (
                  province &&
                  typeof province === "object" &&
                  "province_id" in province
                ) {
                  allProvinces.push(province as Province);
                }
              });
            }
          });

          provinceData = allProvinces.find((p) => p.province_id === provinceId);
        }

        // Use province's region_type if available, otherwise fall back to form's regionType
        const provinceRegionType = provinceData?.region_type || regionType;

        // Skip if region type is not supported by this bet type
        if (!regionRules[provinceRegionType]) continue;

        // Create lottery data for calculations
        const lotteryData = {
          betTypes: [
            {
              id: betType,
              name: currentBetTypeData.name,
              description: currentBetTypeData.description,
              digitCount: currentBetTypeData.digit_count,
              variants:
                typeof currentBetTypeData.variants === "string"
                  ? JSON.parse(currentBetTypeData.variants)
                  : currentBetTypeData.variants || [],
              regions: [
                {
                  id: provinceRegionType,
                  name:
                    provinceRegionType === "M1" ? "Miền Nam/Trung" : "Miền Bắc",
                  betMultipliers:
                    regionRules[provinceRegionType].betMultipliers,
                  combinationCount:
                    regionRules[provinceRegionType].combinationCount,
                  winningRules: regionRules[provinceRegionType].winningRules,
                },
              ],
              winningRatio: winningRatio,
            },
          ],
          numberSelectionMethods: [],
        };

        // Calculate for this province
        const betAmount = calculateBetAmount(
          betType,
          betVariant,
          provinceRegionType,
          denomination,
          numbers.length,
          lotteryData
        );

        const winAmount =
          calculatePotentialWinAmount(
            betType,
            betVariant,
            denomination,
            lotteryData
          ) * numbers.length;

        totalBetAmount += betAmount;
        totalPotentialWin += winAmount;
      }

      // Set the calculated values
      setTotalAmount(totalBetAmount);
      setPotentialWin(totalPotentialWin);

      // Log for debugging
      console.log("Calculated bet amount:", totalBetAmount);
      console.log("Calculated potential win:", totalPotentialWin);
    } catch (error) {
      console.error("Error calculating bet amounts:", error);
      setTotalAmount(0);
      setPotentialWin(0);
    }
  }, [
    formValues.betType,
    formValues.betVariant,
    formValues.regionType,
    formValues.denomination,
    formValues.numbers,
    formValues.provinces,
    betTypes,
    provincesByRegion,
  ]);

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
        } số với tổng tiền ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(totalAmount)}`,
        variant: "lottery",
      });

      // Đóng dialog summary
      setIsSummaryOpen(false);

      // Reset form
      resetForm();
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

  // Reset form
  const resetForm = () => {
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
  };

  // Save bet template
  const handleSaveBetTemplate = () => {
    const formData = methods.getValues();

    // Kiểm tra dữ liệu hợp lệ
    if (
      !formData.betType ||
      !formData.provinces.length ||
      !formData.numbers.length
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

  // Use saved bet template
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

  const contextValue: BetContextType = {
    methods,
    currentStep,
    setCurrentStep,
    isCompleted,
    steps,
    goToStep,
    handleNext,
    handlePrev,
    totalAmount,
    potentialWin,
    isBalanceEnough,
    isSummaryOpen,
    setIsSummaryOpen,
    isSubmitting,
    handleConfirmBet,
    savedBets,
    isSavedBetsOpen,
    setIsSavedBetsOpen,
    handleSaveBetTemplate,
    handleUseSavedBet,
    resetForm,
  };

  return (
    <BetContext.Provider value={contextValue}>
      <FormProvider {...methods}>{children}</FormProvider>
    </BetContext.Provider>
  );
}

// Custom hook to use the bet context
export function useBetContext() {
  const context = useContext(BetContext);
  if (context === undefined) {
    throw new Error("useBetContext must be used within a BetProvider");
  }
  return context;
}
