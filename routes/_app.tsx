import { define } from "@/utils.ts";
import { Header } from "@/components/Header.tsx";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/abstract.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Jura:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <title>fresh-project</title>
      </head>
      <body className="dark" style="font-family: 'Jura', sans-serif;">
        <Header />
        <main class="pt-16">
          <Component />
        </main>
      </body>
    </html>
  );
});
