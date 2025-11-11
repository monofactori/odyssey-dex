import { define } from "@/utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/abstract.svg" />
        <title>fresh-project</title>
      </head>
      <body className="dark">
        <Component />
      </body>
    </html>
  );
});
