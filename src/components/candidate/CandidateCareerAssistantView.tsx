import { useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  Copy,
  Lightbulb,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiServices } from "@/lib/ai-services";
import { useAts } from "@/lib/ats-store";

export function CandidateCareerAssistantView() {
  const { currentUser } = useAts();

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; suggestions?: string[] }[]
  >([
    {
      role: "assistant",
      content: `Hello ${currentUser.name}! I am your personal Career AI Coach. I can help you prepare for technical or behavioral interviews, calculate competitive PKR salary packages in ${currentUser.city}, format tailored cover letters, or optimize your resume for Pakistani employers. What would you like to explore?`,
      suggestions: [
        "How should I prepare for technical interviews?",
        "What salary should I ask for in Pakistan?",
        "Draft a tailored cover letter for my profile",
        "What skills are high in demand right now?",
      ],
    },
  ]);

  const handleSend = (queryText?: string) => {
    const text = queryText || prompt;
    if (!text.trim()) return;

    const userMsg = { role: "user" as const, content: text };
    const response = aiServices.candidateCareerAssistant(
      text,
      {
        name: currentUser.name,
        title: currentUser.title,
        city: currentUser.city,
        skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      }
    );

    const assistantMsg = {
      role: "assistant" as const,
      content: response.response,
      suggestions: response.actionSuggestions,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setPrompt("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Response copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Brain className="h-3.5 w-3.5" />
              <span>AI Career Mentorship & STAR Method</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Candidate Career AI Coach
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Private, deterministic career coaching tailored to your profile (@{currentUser.username}).
            </p>
          </div>

          <Badge variant="outline" className="text-xs px-3 py-1 font-mono">
            Location: {currentUser.city}, Pakistan
          </Badge>
        </div>
      </div>

      {/* Chat Area */}
      <div className="rounded-2xl border bg-card flex flex-col h-[560px] overflow-hidden shadow-xs">
        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-br-none"
                    : "bg-muted/40 border text-foreground rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {msg.role === "assistant" && (
                  <div className="pt-2 border-t flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      ATS Career Intelligence
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(msg.content)}
                      className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Chips */}
        {messages.length > 0 && messages[messages.length - 1]?.suggestions && (
          <div className="px-5 py-2 border-t bg-muted/20 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1 font-semibold">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              Suggested:
            </span>
            {(messages[messages.length - 1]?.suggestions || []).map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="shrink-0 text-[11px] bg-background hover:bg-accent border rounded-full px-2.5 py-1 text-muted-foreground hover:text-foreground transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t bg-background flex items-center gap-2"
        >
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask your Career Coach about interview questions, PKR salary rates, or resume tips..."
            className="text-xs h-10 bg-muted/20"
          />
          <Button type="submit" disabled={!prompt.trim()} className="h-10 px-4 gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
