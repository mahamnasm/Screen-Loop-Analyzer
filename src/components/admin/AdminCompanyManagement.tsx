import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  ExternalLink,
  Filter,
  Globe,
  MapPin,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAts } from "@/lib/ats-store";

export function AdminCompanyManagement() {
  const { companies, jobs, approveCompany, rejectCompany, verifyCompany } = useAts();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.industry.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchCity = cityFilter === "all" || c.city.toLowerCase() === cityFilter.toLowerCase();

      return matchSearch && matchStatus && matchCity;
    });
  }, [companies, search, statusFilter, cityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              Pakistani Employers & Company Verification
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit employer registrations, grant verified badges, and oversee hiring organizations operating in Pakistan.
          </p>
        </div>

        <Badge variant="outline" className="font-mono text-xs font-bold">
          {companies.length} Registered Companies
        </Badge>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name, industry, or city..."
              className="pl-8 text-xs bg-background h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] text-xs h-9 bg-background">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[140px] text-xs h-9 bg-background">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              <SelectItem value="Karachi">Karachi</SelectItem>
              <SelectItem value="Lahore">Lahore</SelectItem>
              <SelectItem value="Islamabad">Islamabad</SelectItem>
              <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow>
              <TableHead className="font-bold">Company Name & Hub</TableHead>
              <TableHead className="font-bold">Industry</TableHead>
              <TableHead className="font-bold">Workforce Size</TableHead>
              <TableHead className="font-bold">Active Jobs</TableHead>
              <TableHead className="font-bold">Verification</TableHead>
              <TableHead className="font-bold">Account Status</TableHead>
              <TableHead className="text-right font-bold">Admin Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {filteredCompanies.map((c) => {
              const activeCount = jobs.filter((j) => j.company.toLowerCase() === c.name.toLowerCase()).length;

              return (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={c.logo}
                        alt={c.name}
                        className="h-9 w-9 rounded-xl border bg-muted object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground text-xs">{c.name}</span>
                          {c.verified && (
                            <span title="Verified Employer">
                              <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {c.city}, Pakistan
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {c.industry}
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs">{c.size}</span>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      {activeCount} active
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => verifyCompany(c.id)}
                      className={`h-7 text-xs gap-1 px-2.5 rounded-full ${
                        c.verified
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {c.verified ? "Verified" : "Unverified"}
                    </Button>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`text-[10px] uppercase font-bold ${
                        c.status === "approved"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : c.status === "pending"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => approveCompany(c.id)}
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          title="Approve Company"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      )}

                      {c.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => rejectCompany(c.id)}
                          className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Reject / Suspend Company"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}

                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                          title="Visit Website"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredCompanies.length === 0 && (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No companies matching your search filters.
          </div>
        )}
      </div>
    </div>
  );
}
