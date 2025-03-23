// src/components/bet-form/bet-form.tsx
"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { BetProvider, useBetContext } from "@/contexts/BetContext";
import { EnhancedBetFormHeader } from "./bet-form-header";
import { RegionSelection } from "./region-selection";
import { BetTypeSelection } from "./bet-type-selection";
import { BetSummary } from "./bet-summary";
import { BetReview } from "./bet-review";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

// Wrapper component that provides the BetContext
export function EnhancedBetForm() {
  return (
    <BetProvider>
      <EnhancedBetFormContent />
    </BetProvider>
  );
}

// Main component that consumes the BetContext
function EnhancedBetFormContent() {
  const {
    methods,
    currentStep,
    steps,
    isCompleted,
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
  } = useBetContext();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        methods.handleSubmit(() => setIsSummaryOpen(true))();
      }}
      className="space-y-8"
    >
      {/* New Layout: Two-column grid on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form content column */}
        <div className="lg:col-span-2 space-y-6">
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
            {currentStep === 2 && <BetTypeSelection />}
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
                  type="submit"
                  variant="lottery"
                  className="flex-1 md:flex-auto"
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
            <div className="flex gap-2 w-full md:w-auto">
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
                onClick={resetForm}
                className="flex-1 md:flex-auto"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Nhập lại
              </Button>
            </div>
          </div>
        </div>

        {/* Review column */}
        <div className="lg:col-span-1">
          <BetReview />
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
            <Button variant="outline" onClick={() => setIsSavedBetsOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
