import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, CreditCard, Building2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FeeBreakdownProps {
  grossAmount: number;
  processingFeePercentage: number;
  platformFeeAmount?: number;
  platformFeePercentage?: number;
  showDetailed?: boolean;
  className?: string;
}

export function FeeBreakdown({ 
  grossAmount, 
  processingFeePercentage, 
  platformFeeAmount = 0, 
  platformFeePercentage = 0,
  showDetailed = true,
  className = ""
}: FeeBreakdownProps) {
  
  // Calculate fees
  const processingFee = (grossAmount * processingFeePercentage) / 100;
  const platformFeeFromPercentage = (grossAmount * platformFeePercentage) / 100;
  const totalPlatformFee = platformFeeAmount + platformFeeFromPercentage;
  const totalFees = processingFee + totalPlatformFee;
  const netAmount = grossAmount - totalFees;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!showDetailed) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Campaign Payment</span>
          <span className="text-green-400 font-medium">{formatCurrency(grossAmount)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Fees & Processing</span>
          <span className="text-red-400">-{formatCurrency(totalFees)}</span>
        </div>
        <Separator className="bg-white/10" />
        <div className="flex justify-between items-center font-medium">
          <span className="text-white">You'll Receive</span>
          <span className="text-emerald-400 text-lg">{formatCurrency(netAmount)}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="rounded-lg border text-card-foreground shadow-sm card-glass bg-[#123140d9]">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Payment Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gross Amount */}
        <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-400 border-green-400">
              Campaign Payment
            </Badge>
          </div>
          <span className="text-green-400 font-semibold text-lg">{formatCurrency(grossAmount)}</span>
        </div>

        {/* Fee Breakdown */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4" />
            Fee Breakdown
          </div>
          
          {/* Processing Fee */}
          <div className="flex justify-between items-center p-2 bg-red-500/5 rounded">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-red-400" />
              <span className="text-white/80 text-sm">Processing Fee</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-xs">
                      {processingFeePercentage}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Credit card processing fee applied to all payments</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-red-400 font-medium">-{formatCurrency(processingFee)}</span>
          </div>

          {/* Platform Fee */}
          {totalPlatformFee > 0 && (
            <div className="flex justify-between items-center p-2 bg-orange-500/5 rounded">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-400" />
                <span className="text-white/80 text-sm">Platform Fee</span>
                {platformFeePercentage > 0 && platformFeeAmount > 0 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="text-xs">
                          {platformFeePercentage}% + {formatCurrency(platformFeeAmount)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Platform service fee: {platformFeePercentage}% + {formatCurrency(platformFeeAmount)} flat fee</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : platformFeePercentage > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    {platformFeePercentage}%
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {formatCurrency(platformFeeAmount)}
                  </Badge>
                )}
              </div>
              <span className="text-orange-400 font-medium">-{formatCurrency(totalPlatformFee)}</span>
            </div>
          )}
        </div>

        <Separator className="bg-white/20" />

        {/* Total Fees */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">Total Fees</span>
          <span className="text-red-400 font-medium">-{formatCurrency(totalFees)}</span>
        </div>

        <Separator className="bg-white/20" />

        {/* Net Amount */}
        <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <span className="text-white font-semibold">You'll Receive</span>
          <span className="text-emerald-400 font-bold text-xl">{formatCurrency(netAmount)}</span>
        </div>

        {/* Fee Percentage Summary */}
        <div className="text-center text-white/60 text-xs">
          Total fee rate: {((totalFees / grossAmount) * 100).toFixed(1)}% of gross amount
        </div>
      </CardContent>
    </Card>
  );
}