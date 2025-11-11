import { signal } from "@preact/signals";
import { ArrowDownUp, RefreshCw, Settings } from "lucide-preact";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";

const sendAmount = signal("0.00");
const receiveAmount = signal("0.00");
const sendToken = signal("TON");
const receiveToken = signal("STON");

export default function TokenSwap() {
  const handleSwapTokens = () => {
    const tempToken = sendToken.value;
    sendToken.value = receiveToken.value;
    receiveToken.value = tempToken;

    const tempAmount = sendAmount.value;
    sendAmount.value = receiveAmount.value;
    receiveAmount.value = tempAmount;
  };

  const handleSendAmountChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    sendAmount.value = target.value;
    // Simple conversion rate for demo
    const rate = 0.24479;
    const amount = parseFloat(target.value) || 0;
    receiveAmount.value = (amount * rate).toFixed(5);
  };

  return (
    <div class="w-full max-w-md">
      <div class="p-2">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-white">Swap tokens</h3>
          <div class="flex gap-1">
            <Button variant="ghost" size="icon-sm" class="text-gray-400 hover:text-white">
              <RefreshCw class="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" class="text-gray-400 hover:text-white">
              <Settings class="size-3.5" />
            </Button>
          </div>
        </div>

        {/* You send */}
        <div class="space-y-1 mb-2">
          <label class="text-xs text-gray-400">You send</label>
          <div class="relative">
            <Input
              type="number"
              value={sendAmount.value}
              onInput={handleSendAmountChange}
              placeholder="0.00"
              class="pr-20 h-10 text-base bg-gray-900 border-gray-800 text-white"
            />
            <Button
              variant="ghost"
              size="sm"
              class="absolute right-1 top-1/2 -translate-y-1/2 gap-1.5 text-white hover:bg-gray-800 h-8"
            >
              <div class="size-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span class="text-xs font-bold">T</span>
              </div>
              <span class="text-sm">{sendToken.value}</span>
              <span class="text-gray-400 text-xs">▼</span>
            </Button>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">≈ 0</span>
            <span class="text-gray-400">$0</span>
          </div>
        </div>

        {/* Swap button */}
        <div class="flex justify-center -my-1 relative z-10">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleSwapTokens}
            class="rounded-full bg-[#0a0a0a] border-gray-800 hover:bg-gray-900 text-blue-500"
          >
            <ArrowDownUp class="size-3.5" />
          </Button>
        </div>

        {/* You receive */}
        <div class="space-y-1 mb-3">
          <label class="text-xs text-gray-400">You receive</label>
          <div class="relative">
            <Input
              type="number"
              value={receiveAmount.value}
              placeholder="0.00"
              readOnly
              class="pr-20 h-10 text-base bg-gray-900 border-gray-800 text-white"
            />
            <Button
              variant="ghost"
              size="sm"
              class="absolute right-1 top-1/2 -translate-y-1/2 gap-1.5 text-white hover:bg-gray-800 h-8"
            >
              <div class="size-5 rounded-full bg-blue-600 flex items-center justify-center">
                <span class="text-xs font-bold">S</span>
              </div>
              <span class="text-sm">{receiveToken.value}</span>
              <span class="text-gray-400 text-xs">▼</span>
            </Button>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-400">≈ 0</span>
            <span class="text-gray-400">$0</span>
          </div>
        </div>

        {/* Token info */}
        <div class="mb-3 p-2 bg-gray-900 rounded-lg border border-gray-800">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-400">Omniston</span>
            <Button variant="ghost" size="icon-sm" class="text-blue-500 h-6 w-6">
              <span class="text-xs">ⓘ</span>
            </Button>
          </div>
          <p class="text-xs text-gray-500">Enter amount to get best price</p>
        </div>

        {/* Swap action button */}
        <Button
          class="w-full h-9 text-sm font-semibold bg-gray-800 hover:bg-gray-700 text-gray-400"
          disabled
        >
          Enter an amount
        </Button>
      </div>
    </div>
  );
}
