"use client";
import { RoundedButton } from "@/components/RoundedButton";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

export default function Home() {
  const [greeted, setGreeted] = useState<string | null>(null);
  const greet = useCallback((): void => {
    invoke<string>("greet")
      .then((s) => {
        setGreeted(s);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }, []);

  async function compile() {
    try {
      const result = await invoke("compile_minisoft", {
        filePath: "./test2.ms",
        verbose: true,
      });
      console.log(result);
    } catch (err) {
      console.error("Compilation error:", err);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <RoundedButton onClick={greet} title='Call "greet" from Rust' />
      <RoundedButton onClick={compile} title="Test the Compiler" />
      <p className="break-words w-md text-center">
        {greeted ?? "Click the button to call the Rust function"}
      </p>
    </div>
  );
}
