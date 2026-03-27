"use client";

import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: MessageInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const canSubmit = !isLoading && input.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2">
      <div className="relative rounded-2xl border border-white/[0.09] bg-white/[0.04] focus-within:border-violet-500/40 focus-within:bg-white/[0.06] transition-all duration-200 shadow-lg">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe the component you want..."
          disabled={isLoading}
          className="w-full min-h-[80px] max-h-[180px] px-4 pt-3.5 pb-12 bg-transparent text-white/80 placeholder:text-white/50 resize-none focus:outline-none text-[14px] leading-relaxed"
          rows={3}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="text-white/15 text-[11px] hidden sm:block">
            {input.trim().length > 0 ? "↵ send" : "shift+↵ newline"}
          </span>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
              canSubmit
                ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 active:scale-95"
                : "bg-white/[0.06] text-white/20 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowUp className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
