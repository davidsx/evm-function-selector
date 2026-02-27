import Decoder from "./Decoder";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-12 sm:px-6">
        <header className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            EVM selector decoder
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Decode any EVM function or error signature to its 4-byte hex
            selector (keccak256 first 4 bytes).
          </p>
        </header>
        <Decoder />
        <footer className="mt-16 border-t border-zinc-200 pt-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Works for functions and custom errors. Normalized form has no spaces
          and no parameter names.
        </footer>
      </main>
    </div>
  );
}
