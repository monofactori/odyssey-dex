import { cn } from "@/lib/utils.ts";

interface HeaderProps {
  class?: string;
}

export function Header({ class: className }: HeaderProps) {
  return (
    <header
      class={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/65 backdrop-blur/50 supports-backdrop-filter:bg-background/60",
        className,
      )}
    >
      <div class="container mx-auto px-4 h-16 flex items-center justify-center gap-8">
        <nav class="flex items-center gap-2">
          <a
            href="/trade"
            class="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Trade
          </a>
          <a
            href="/spaceship"
            class="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Spaceship
          </a>
        </nav>
        
        <a href="/">
          <img src="/odyssey.svg" alt="Odyssey" class="h-10 w-auto brightness-0 invert" />
        </a>
        
        <nav class="flex items-center gap-2">
          <a
            href="/whitepaper"
            class="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            Whitepaper
          </a>
          <a
            href="/about"
            class="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
}
