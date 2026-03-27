"use client";

import { Message } from "ai";
import { cn } from "@/lib/utils";
import { User, Bot, Loader2, Sparkles } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onSuggestion?: (text: string) => void;
}

export function MessageList({ messages, isLoading, onSuggestion }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="relative mb-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 blur-lg -z-10" />
        </div>
        <p className="text-white/90 font-semibold text-base mb-2 tracking-tight">
          What should we build?
        </p>
        <p className="text-white/35 text-sm max-w-[220px] leading-relaxed">
          Describe a React component and I'll generate it live
        </p>
        <div className="mt-6 flex flex-col gap-2 w-full max-w-[240px]">
          {["A login form with validation", "A pricing card component", "An animated hero section"].map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion?.(s)}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/50 text-xs text-left cursor-pointer hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-white/80 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 py-5">
      <div className="space-y-5 w-full">
        {messages.map((message) => (
          <div
            key={message.id || message.content}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            )}

            <div
              className={cn(
                "flex flex-col gap-1.5 max-w-[82%]",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20 rounded-br-sm"
                    : "bg-white/[0.05] text-white/80 border border-white/[0.08] rounded-bl-sm"
                )}
              >
                <div>
                  {message.parts ? (
                    <>
                      {message.parts.map((part, partIndex) => {
                        switch (part.type) {
                          case "text":
                            return message.role === "user" ? (
                              <span key={partIndex} className="whitespace-pre-wrap">
                                {part.text}
                              </span>
                            ) : (
                              <MarkdownRenderer
                                key={partIndex}
                                content={part.text}
                                className="prose-sm prose-invert"
                              />
                            );
                          case "reasoning":
                            return (
                              <div
                                key={partIndex}
                                className="mt-3 p-3 bg-white/[0.04] rounded-lg border border-white/[0.07]"
                              >
                                <span className="text-xs font-medium text-white/40 block mb-1">
                                  Reasoning
                                </span>
                                <span className="text-xs text-white/50">
                                  {part.reasoning}
                                </span>
                              </div>
                            );
                          case "tool-invocation":
                            const tool = part.toolInvocation;
                            return (
                              <div
                                key={partIndex}
                                className="inline-flex items-center gap-2 mt-2 px-2.5 py-1.5 bg-white/[0.04] rounded-lg text-xs font-mono border border-white/[0.07]"
                              >
                                {tool.state === "result" && tool.result ? (
                                  <>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-white/50">{tool.toolName}</span>
                                  </>
                                ) : (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                                    <span className="text-white/50">{tool.toolName}</span>
                                  </>
                                )}
                              </div>
                            );
                          case "source":
                            return (
                              <div key={partIndex} className="mt-2 text-xs text-white/30">
                                Source: {JSON.stringify(part.source)}
                              </div>
                            );
                          case "step-start":
                            return partIndex > 0 ? (
                              <hr key={partIndex} className="my-3 border-white/10" />
                            ) : null;
                          default:
                            return null;
                        }
                      })}
                      {isLoading &&
                        message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 && (
                          <div className="flex items-center gap-2 mt-3 text-white/30">
                            <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
                            <span className="text-xs">Generating...</span>
                          </div>
                        )}
                    </>
                  ) : message.content ? (
                    message.role === "user" ? (
                      <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                      <MarkdownRenderer
                        content={message.content}
                        className="prose-sm prose-invert"
                      />
                    )
                  ) : isLoading &&
                    message.role === "assistant" &&
                    messages.indexOf(message) === messages.length - 1 ? (
                    <div className="flex items-center gap-2 text-white/30">
                      <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
                      <span className="text-xs">Generating...</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <User className="h-3.5 w-3.5 text-white/60" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
