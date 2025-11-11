import { useEffect, useRef } from "preact/hooks";
import { createChart, ColorType, type IChartApi, type ISeriesApi } from "lightweight-charts";

interface TradingChartProps {
  symbol?: string;
}

export default function TradingChart({ symbol = "STON/TON" }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0a" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1f1f1f" },
        horzLines: { color: "#1f1f1f" },
      },
      width: chartContainerRef.current.clientWidth,
      height: window.innerWidth < 1024 ? 200 : 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: "#2962FF",
      topColor: "#2962FF",
      bottomColor: "rgba(41, 98, 255, 0.04)",
      lineWidth: 2,
    });

    // Generate sample data
    const data = generateSampleData();
    areaSeries.setData(data);

    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: window.innerWidth < 1024 ? 200 : 300,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div class="w-full h-full">
      <div class="flex items-center justify-between mb-2 px-2 lg:px-4 lg:mb-4">
        <div>
          <h2 class="text-lg lg:text-2xl font-bold text-white">{symbol}</h2>
          <p class="text-xs lg:text-sm text-gray-400">Nov 11, 2025, 13:19 GMT+3</p>
        </div>
        <div class="text-right">
          <p class="text-xl lg:text-3xl font-bold text-white">0.24479</p>
          <p class="text-xs lg:text-sm text-gray-400">$0</p>
        </div>
      </div>
      <div ref={chartContainerRef} class="w-full" />
    </div>
  );
}

function generateSampleData() {
  const data = [];
  const baseValue = 0.24479;
  const startDate = new Date("2023-08-01");

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const randomChange = (Math.random() - 0.5) * 0.02;
    const value = baseValue + randomChange + Math.sin(i / 30) * 0.05;

    data.push({
      time: date.toISOString().split("T")[0],
      value: Math.max(0.1, value),
    });
  }

  return data;
}
