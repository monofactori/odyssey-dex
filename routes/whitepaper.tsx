import { Head } from "fresh/runtime";
import { define } from "@/utils.ts";
import { Header } from "@/components/Header.tsx";

export default define.page(function Whitepaper() {
  return (
    <>
      <Head>
        <title>Whitepaper - Odyssey DEX</title>
      </Head>
      <Header />
      <main class="container mx-auto px-4 pt-24 pb-12">
        <article class="max-w-4xl mx-auto prose prose-invert">
          <h1 class="text-4xl font-bold mb-8">Odyssey DEX Whitepaper</h1>
          
          <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Abstract</h2>
            <p class="text-foreground/80 leading-relaxed">
              Odyssey DEX is a decentralized exchange platform built on the TON blockchain,
              providing users with fast, secure, and efficient trading capabilities.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Introduction</h2>
            <p class="text-foreground/80 leading-relaxed">
              The TON blockchain offers unique advantages for decentralized finance applications,
              including high throughput, low fees, and seamless integration with Telegram.
              Odyssey DEX leverages these capabilities to create a superior trading experience.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Key Features</h2>
            <ul class="list-disc list-inside text-foreground/80 space-y-2">
              <li>Decentralized trading on TON blockchain</li>
              <li>Low transaction fees and fast execution</li>
              <li>Secure smart contract architecture</li>
              <li>User-friendly interface</li>
              <li>Seamless Telegram integration</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Technology Stack</h2>
            <p class="text-foreground/80 leading-relaxed">
              Odyssey DEX is built using modern web technologies and TON blockchain infrastructure,
              ensuring reliability, security, and optimal performance.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-semibold mb-4">Roadmap</h2>
            <p class="text-foreground/80 leading-relaxed">
              Our development roadmap includes continuous improvements to the platform,
              new trading features, and expanded token support.
            </p>
          </section>
        </article>
      </main>
    </>
  );
});
