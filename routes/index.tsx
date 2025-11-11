import { Head } from "fresh/runtime";
import { define } from "@/utils.ts";
import P5Hero from "@/islands/ui/p5-hero.tsx";

export default define.page(function Home() {
  return (
    <>
      <Head>
        <title>Odyssey DEX - TON Blockchain Trading Platform</title>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        `}</style>
      </Head>
      <div class="relative w-screen h-screen overflow-hidden">
        <P5Hero />
        <div class="relative z-10 w-full h-full flex flex-col items-center justify-center gap-6 px-4">
          <h1 class="text-5xl font-bold text-white drop-shadow-lg text-center">
            Odyssey DEX
          </h1>
          <p class="text-xl text-white/90 drop-shadow-md text-center max-w-2xl">
            Decentralized trading platform on TON blockchain
          </p>
          <div class="flex gap-4 mt-4">
            <a
              href="/trade"
              class="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-lg"
            >
              Start Trading
            </a>
            <a
              href="/whitepaper"
              class="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20 shadow-lg"
            >
              Read Whitepaper
            </a>
          </div>
        </div>
      </div>
    </>
  );
});
