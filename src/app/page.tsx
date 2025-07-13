import { PlayCircle } from 'lucide-react';
import { CreatorTube } from "../components/creator-tube";
export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <header className="flex w-full max-w-4xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <PlayCircle className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Creator Tube
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          An elegant interface to run and automate your Colab notebooks with AI.
        </p>
      </header>
      <div className="mt-8 w-full max-w-4xl">
        <CreatorTube />
      </div>
    </main>
  );
}
