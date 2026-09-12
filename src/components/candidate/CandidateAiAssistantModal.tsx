import { useState } from "react";
import {
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { aiServices } from "@/lib/ai-services";
import { useAts } from "@/lib/ats-store";

interface CandidateAiAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidateAiAssistantModal({
  open,
  onOpenChange,
}: CandidateAiAssistantModalProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="p-5 border-b bg-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Candidate Career AI Coach
              </DialogTitle>
              <DialogDescription className="text-xs">
                Private, deterministic guidance tailored to your profile (@{currentUser.username})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-2 leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-muted/40 border text-foreground"
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1">
                  <span className="font-bold text-[10px] uppercase font-mono opacity-80">
                    {m.role === "user" ? currentUser.name : "Screenloop Career AI"}
                  </span>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(m.content)}
                      className="text-muted-foreground hover:text-foreground"
                      title="Copy response"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <p className="whitespace-pre-wrap">{m.content}</p>

                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1">
                    {m.suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(s)}
                        className="rounded-lg bg-background border px-2 py-0.5 text-[10px] text-foreground hover:bg-accent hover:text-primary transition font-medium"
                      >
                        ⚡ {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Input Form */}
        <div className="p-3.5 border-t bg-card flex items-center gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask for interview prep, salary advice, or a cover letter..."
            className="text-xs h-9"
          />
          <Button
            size="sm"
            onClick={() => handleSend()}
            className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
