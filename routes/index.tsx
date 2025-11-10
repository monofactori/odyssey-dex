import { Head } from "fresh/runtime";
import { define } from "@/utils.ts";
import P5Hero from "@/islands/ui/p5-hero.tsx";

export default define.page(function Home() {
  return (
    <>
      <Head>
        <title>fresh-v2-shadcn-boilerplate</title>
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
          <img
            class="my-6"
            src="/logo.svg"
            width="128"
            height="128"
            alt="the Fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="text-4xl font-bold text-white drop-shadow-lg">Welcome to fresh-v2-shadcn-boilerplate</h1>
        </div>
      </div>
    </>
  );
});
