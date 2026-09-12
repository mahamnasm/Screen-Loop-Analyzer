import { useMemo, useState } from "react";
import {
  Boxes,
  CheckCircle2,
  Cpu,
  Download,
  Filter,
  PackageCheck,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAts } from "@/lib/ats-store";

export function PluginsMarketplaceView() {
  const { plugins, togglePlugin, currentUser } = useAts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter plugins based on user role and query
  const availablePlugins = useMemo(() => {
    return plugins.filter((plugin) => {
      // Role scoping: Admin sees all; HR/Company sees 'hr'; Candidate sees 'candidate'
      if (currentUser.role === "candidate" && plugin.targetRole !== "candidate") {
        return false;
      }
      if (
        (currentUser.role === "hr" || currentUser.role === "company") &&
        plugin.targetRole !== "hr"
      ) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = plugin.name.toLowerCase().includes(q);
        const matchDesc = plugin.description.toLowerCase().includes(q);
        const matchCat = plugin.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      // Category
      if (selectedCategory !== "all" && plugin.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [plugins, currentUser.role, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(plugins.map((p) => p.category)));
  }, [plugins]);

  const enabledCount = availablePlugins.filter((p) => p.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Boxes className="h-3.5 w-3.5" />
              <span>Modular Plugin Architecture</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              ATS Extensions & AI Copilots
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Extend your workspace with sandboxed AI copilots, resume scoring algorithms, and talent intelligence modules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-3 py-1 font-mono">
              {enabledCount} of {availablePlugins.length} Active
            </Badge>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plugins by name, feature, or permission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background text-xs h-9"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 self-center">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="text-xs h-9"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="text-xs h-9"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {availablePlugins.map((plugin) => (
          <div
            key={plugin.id}
            className={`flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition hover:border-primary/50 ${
              plugin.enabled ? "border-primary/30" : "opacity-80"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                    {plugin.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">
                      {plugin.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>v{plugin.version}</span>
                      <span>·</span>
                      <span>{plugin.author}</span>
                    </div>
                  </div>
                </div>

                <Switch
                  checked={plugin.enabled}
                  onCheckedChange={() => togglePlugin(plugin.id)}
                  aria-label={`Toggle ${plugin.name}`}
                />
              </div>

              <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {plugin.description}
              </p>

              {/* Scoped Permissions */}
              <div className="mt-4 pt-3 border-t">
                <div className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <span>Scoped Permissions:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {plugin.permissions.map((perm) => (
                    <Badge
                      key={perm}
                      variant="secondary"
                      className="text-[10px] font-mono py-0 text-muted-foreground"
                    >
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex items-center justify-between text-xs">
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  plugin.enabled
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    : "text-muted-foreground"
                }`}
              >
                {plugin.enabled ? "Enabled & Sandboxed" : "Disabled"}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => togglePlugin(plugin.id)}
                className="text-xs h-7 text-primary hover:text-primary/80"
              >
                {plugin.enabled ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
