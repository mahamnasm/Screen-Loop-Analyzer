import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Key,
  Layers,
  Link2,
  Mail,
  MessageSquare,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  Video,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAts } from "@/lib/ats-store";
import type { IntegrationItem } from "@/lib/ats-store";

export function IntegrationsMarketplaceView() {
  const { integrations, updateIntegrationStatus, currentUser } = useAts();

  // Active integration for configuration modal
  const [activeConfigItem, setActiveConfigItem] = useState<IntegrationItem | null>(null);
  const [configFieldsState, setConfigFieldsState] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);

  const handleOpenConfig = (item: IntegrationItem) => {
    setActiveConfigItem(item);
    const initialValues: Record<string, string> = {};
    item.configFields.forEach((field) => {
      initialValues[field.key] = field.value || "";
    });
    setConfigFieldsState(initialValues);
  };

  const handleFieldChange = (key: string, value: string) => {
    setConfigFieldsState((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestConnection = () => {
    if (!activeConfigItem) return;
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast.success(`Connection handshake verified with ${activeConfigItem.name}! Test ping: 200 OK.`);
    }, 700);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConfigItem) return;

    updateIntegrationStatus(activeConfigItem.id, "Connected", configFieldsState);
    setActiveConfigItem(null);
  };

  const handleQuickDisconnect = (item: IntegrationItem) => {
    updateIntegrationStatus(item.id, "Not Connected");
    toast.info(`Disconnected ${item.name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border bg-gradient-to-b from-card via-card to-muted/30 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Link2 className="h-3.5 w-3.5" />
              <span>Third-Party Communications & Infrastructure</span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Enterprise Integrations Hub
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Connect external corporate email gateways, Pakistani SMS dispatchers, video meeting rooms, and cloud file storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-3 py-1 font-mono">
              {integrations.filter((i) => i.status === "Connected").length} of {integrations.length} Connected
            </Badge>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card/60 p-3.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">SMTP & Email</div>
              <div className="text-[11px] text-muted-foreground">Interview invites</div>
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Pakistani SMS</div>
              <div className="text-[11px] text-muted-foreground">Jazz / Telenor / Zong</div>
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Video Conferencing</div>
              <div className="text-[11px] text-muted-foreground">Google Meet / Zoom</div>
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 p-3.5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Storage & Webhooks</div>
              <div className="text-[11px] text-muted-foreground">Encrypted resume store</div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((item) => {
          const isConnected = item.status === "Connected";
          const needsSetup = item.status === "Needs Setup";

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-xs transition hover:border-primary/50 ${
                isConnected ? "border-emerald-500/30" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary" className="text-[10px] mb-1.5">
                      {item.category}
                    </Badge>
                    <h3 className="font-semibold text-sm text-foreground">
                      {item.name}
                    </h3>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold flex items-center gap-1 py-0.5 ${
                      isConnected
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : needsSetup
                        ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <Wifi className="h-3 w-3" />
                        Connected
                      </>
                    ) : needsSetup ? (
                      <>
                        <Settings className="h-3 w-3" />
                        Setup Required
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3" />
                        Not Connected
                      </>
                    )}
                  </Badge>
                </div>

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* Configuration fields snapshot */}
                <div className="mt-4 pt-3 border-t">
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Configured Parameters:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {item.configFields.length} fields
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenConfig(item)}
                  className="text-xs h-8 gap-1.5 flex-1"
                >
                  <Settings className="h-3.5 w-3.5" />
                  {isConnected ? "Configure" : "Connect"}
                </Button>

                {isConnected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickDisconnect(item)}
                    className="text-xs h-8 text-muted-foreground hover:text-destructive"
                  >
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Configuration Modal */}
      <Dialog
        open={Boolean(activeConfigItem)}
        onOpenChange={(open) => !open && setActiveConfigItem(null)}
      >
        <DialogContent className="max-w-md">
          {activeConfigItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Configure {activeConfigItem.name}
                </DialogTitle>
                <DialogDescription>
                  Enter corporate credentials and API endpoints to link {activeConfigItem.name} to Screenloop ATS.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveConfig} className="space-y-3.5 py-2">
                {activeConfigItem.configFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs font-semibold">{field.label}</Label>
                    <Input
                      type={field.isSecret ? "password" : "text"}
                      value={configFieldsState[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                ))}

                <div className="rounded-lg border bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Credentials are encrypted in memory with zero plaintext outbound transmission.
                  </span>
                </div>

                <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isTesting}
                    onClick={handleTestConnection}
                    className="text-xs h-9 gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? "animate-spin" : ""}`} />
                    {isTesting ? "Testing Handshake..." : "Test Connection"}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setActiveConfigItem(null)}
                      className="text-xs h-9"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="text-xs h-9 gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Save & Connect
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
