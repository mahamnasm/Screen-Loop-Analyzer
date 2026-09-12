import { useState } from "react";
import {
  ArrowRight,
  Check,
  Coins,
  Copy,
  DollarSign,
  HelpCircle,
  Info,
  Lightbulb,
  MapPin,
  MessageSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PAKISTANI_SALARY_DATASET,
  salaryAnalyzer,
  salaryNegotiationHelper,
  type ExperienceLevel,
  type PakistaniCity,
} from "@/lib/ai-services";
import { useAts } from "@/lib/ats-store";

export function SalaryIntelligenceView() {
  const { currentUser } = useAts();

  // Salary Guide Filters
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [selectedExp, setSelectedExp] = useState<ExperienceLevel>("Mid-Level (3-5 yrs)");
  const [selectedCity, setSelectedCity] = useState<PakistaniCity>("Lahore");

  // Negotiation helper state
  const [currentSalary, setCurrentSalary] = useState<number>(currentUser.currentSalaryPKR || 180000);
  const [expectedSalary, setExpectedSalary] = useState<number>(currentUser.expectedSalaryPKR || 250000);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Compute benchmark
  const benchmark = salaryAnalyzer(selectedRole, selectedExp, selectedCity);

  // Compute negotiation advice
  const negotiation = salaryNegotiationHelper(
    currentSalary,
    expectedSalary,
    selectedRole,
    selectedCity
  );

  const availableRoles = Object.keys(PAKISTANI_SALARY_DATASET);
  const availableCities: PakistaniCity[] = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Peshawar",
    "Faisalabad",
    "Multan",
    "Remote (Pakistan)",
  ];
  const availableExp: ExperienceLevel[] = [
    "Intern",
    "Fresh Graduate",
    "Junior (1-2 yrs)",
    "Mid-Level (3-5 yrs)",
    "Senior (5-8 yrs)",
    "Lead / Principal (8+ yrs)",
    "Engineering Manager",
  ];

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(negotiation.messageTemplate);
    setCopiedMsg(true);
    toast.success("Negotiation message template copied!");
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Pakistani Market Salary Intelligence (PKR)</span>
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Explore Tech Salary Benchmarks Across Pakistan
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Transparent, data-backed monthly compensation estimates for technical roles in Karachi, Lahore, Islamabad, and across Pakistan. Benchmark your value and negotiate with confidence.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Job Title / Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="bg-background text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Experience Level</Label>
            <Select value={selectedExp} onValueChange={(v) => setSelectedExp(v as ExperienceLevel)}>
              <SelectTrigger className="bg-background text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableExp.map((e) => (
                  <SelectItem key={e} value={e} className="text-xs">
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">City / Region</Label>
            <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v as PakistaniCity)}>
              <SelectTrigger className="bg-background text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lower Range */}
        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Lower Tier (25th Percentile)
          </span>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            PKR {(benchmark.lowerRangePKR / 1000).toFixed(0)}k
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Typical entry baseline for {selectedRole} in {selectedCity}
          </p>
        </div>

        {/* Typical Range (Hero) */}
        <div className="rounded-2xl border border-primary/50 bg-primary/5 p-5 shadow-xs ring-1 ring-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Market Median (Suggested Target)
            </span>
            <Badge className="bg-primary text-primary-foreground text-[10px]">
              Recommended
            </Badge>
          </div>
          <p className="mt-2 font-display text-3xl font-extrabold text-foreground">
            PKR {(benchmark.typicalRangePKR / 1000).toFixed(0)}k
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Recommended monthly expectation for competitive Pakistani firms
          </p>
        </div>

        {/* Higher Range */}
        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Top Tier (90th Percentile)
          </span>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            PKR {(benchmark.higherRangePKR / 1000).toFixed(0)}k
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Offered by top-tier MNCs, export software houses, and funded startups
          </p>
        </div>
      </div>

      {/* Salary Negotiation Helper Tool */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                AI Salary Negotiation Helper
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personalized compensation targets and polite Pakistani business communication templates.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Role: {selectedRole} ({selectedCity})
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Current Monthly Salary (PKR)</Label>
            <Input
              type="number"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(Number(e.target.value))}
              placeholder="e.g. 180000"
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Desired / Expected Monthly Salary (PKR)</Label>
            <Input
              type="number"
              value={expectedSalary}
              onChange={(e) => setExpectedSalary(Number(e.target.value))}
              placeholder="e.g. 260000"
              className="text-xs"
            />
          </div>
        </div>

        {/* Negotiation Targets Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border bg-muted/30 p-3 text-center">
            <span className="text-[11px] text-muted-foreground">Opening Anchor</span>
            <p className="text-sm font-bold text-foreground mt-0.5">
              PKR {(negotiation.suggestedOpeningPKR / 1000).toFixed(0)}k / mo
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3 text-center">
            <span className="text-[11px] text-muted-foreground">Optimal Target</span>
            <p className="text-sm font-bold text-primary mt-0.5">
              PKR {(negotiation.targetPKR / 1000).toFixed(0)}k / mo
            </p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3 text-center">
            <span className="text-[11px] text-muted-foreground">Reasonable Walkaway</span>
            <p className="text-sm font-bold text-muted-foreground mt-0.5">
              PKR {(negotiation.reasonableMinPKR / 1000).toFixed(0)}k / mo
            </p>
          </div>
        </div>

        {/* Negotiation Message Template */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              Suggested Counter-Offer / Negotiation Email Template
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyMessage}
              className="h-7 text-xs gap-1"
            >
              {copiedMsg ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copiedMsg ? "Copied" : "Copy Template"}
            </Button>
          </div>

          <Textarea
            rows={6}
            readOnly
            value={negotiation.messageTemplate}
            className="text-xs font-mono leading-relaxed bg-muted/20"
          />
        </div>

        {/* Tactical Tips */}
        <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Pakistan Market Negotiation Advice
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {negotiation.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
