import { Head } from "fresh/runtime";
import { define } from "@/utils.ts";
import TradingChart from "@/islands/ui/trading-chart.tsx";
import TokenSwap from "@/islands/ui/token-swap.tsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/islands/ui/tabs.tsx";

export default define.page(function TradePage() {
  return (
    <>
      <Head>
        <title>Trade - Odyssey DEX</title>
      </Head>
      <div class="h-[calc(100vh-4rem)] bg-black text-white overflow-hidden">
        <div class="container mx-auto px-2 py-2 lg:px-4 lg:py-4 max-w-7xl h-full">
          <div class="bg-[#0a0a0a] rounded-lg border border-gray-800 p-2 lg:p-3 h-full overflow-y-auto lg:overflow-hidden">
            <div class="flex flex-col lg:flex-row gap-3 h-full">
              {/* Chart Section - 60% on desktop */}
              <div class="w-full lg:w-[60%] flex flex-col">
                <Tabs defaultValue="all">
                  <div class="flex items-center justify-between mb-2">
                    <TabsList>
                      <TabsTrigger value="24h">24h</TabsTrigger>
                      <TabsTrigger value="1w">1w</TabsTrigger>
                      <TabsTrigger value="1m">1m</TabsTrigger>
                      <TabsTrigger value="3m">3m</TabsTrigger>
                      <TabsTrigger value="6m">6m</TabsTrigger>
                      <TabsTrigger value="1y">1y</TabsTrigger>
                      <TabsTrigger value="all">all</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="all">
                    <TradingChart symbol="STON/TON" />
                  </TabsContent>
                  <TabsContent value="24h">
                    <TradingChart symbol="STON/TON" />
                  </TabsContent>
                  <TabsContent value="1w">
                    <TradingChart symbol="STON/TON" />
                  </TabsContent>
                  <TabsContent value="1m">
                    <TradingChart symbol="STON/TON" />
                  </TabsContent>
                  <TabsContent value="3m">
                    <TradingChart symbol="STON/TON" />
                  </TabsContent>
                  <TabsContent value="6m">
                    <TradingChart symbol="STON/TON" />
                  </TabsContent>
                  <TabsContent value="1y">
                    <TradingChart symbol="STON/TON" />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Swap Section - 40% on desktop, full width on mobile */}
              <div class="w-full lg:w-[40%] flex justify-center lg:justify-start">
                <TokenSwap />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
