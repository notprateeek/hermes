"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Archive,
  GitCompare,
  Library,
  Layers,
  Lock,
  Tag,
  CalendarClock,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  icon: React.ElementType;
  label: string;
  description?: string;
  href: string;
};

const analyzeItems: NavItem[] = [
  { icon: FileText, label: "Signing Preflight", description: "Analyze, decide, negotiate", href: "/dashboard" },
  { icon: GitCompare, label: "Clause Compare", description: "Side-by-side two agreements", href: "/dashboard/compare" },
  { icon: Layers, label: "Bulk Upload", description: "Analyze multiple at once", href: "/dashboard/bulk" },
];

const platformItems: NavItem[] = [
  { icon: Lock, label: "Escrow & Milestones", description: "Track payments, release by milestone", href: "/dashboard/escrow" },
  { icon: Tag, label: "Rate Card", description: "Your services and pricing", href: "/dashboard/rate-card" },
];

const resourceItems: NavItem[] = [
  { icon: Library, label: "Template Library", description: "Standard redline templates", href: "/dashboard/templates" },
  { icon: Archive, label: "Contract Vault", description: "Past analyses", href: "/dashboard/history" },
];

const playgroundItems: NavItem[] = [
  { icon: Gamepad2, label: "Drone Sim", description: "FPV drone playground", href: "/dashboard/playground" },
];

const intelligenceItems: NavItem[] = [
  { icon: CalendarClock, label: "Deadlines", description: "Upcoming milestone due dates", href: "/dashboard/deadlines" },
  { icon: Users, label: "Clients", description: "Health & history per counterparty", href: "/dashboard/clients" },
  { icon: BarChart3, label: "Analytics", description: "Revenue and contract metrics", href: "/dashboard/analytics" },
];

function NavLink({
  icon: Icon,
  label,
  description,
  href,
  active,
  collapsed,
}: NavItem & { active: boolean; collapsed: boolean }) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
        active
          ? "bg-clause/10 text-clause"
          : "text-text-muted hover:bg-surface-raised hover:text-text-primary"
      }`}
    >
      <Icon size={15} className="shrink-0" />
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm leading-tight">{label}</span>
          {description && (
            <span className="block truncate text-[11px] text-text-muted leading-tight mt-0.5">
              {description}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-1 h-px bg-border" />;
  return (
    <p className="mb-1 mt-3 px-2.5 text-[9px] font-semibold uppercase tracking-widest text-text-muted first:mt-0">
      {label}
    </p>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { signOut } = useClerk();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside
      className="hidden h-full shrink-0 flex-col border-r border-border bg-surface transition-all duration-200 md:flex"
      style={{ width: collapsed ? 56 : 220 }}
    >
      {/* Logo */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-clause">
              <span className="font-display text-xs font-normal italic text-white">H</span>
            </div>
            <span className="font-display text-sm font-normal italic text-text-primary">Hermes</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-clause">
            <span className="font-display text-xs font-normal italic text-white">H</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col overflow-y-auto p-2">
        <SectionLabel label="Analyze" collapsed={collapsed} />
        {analyzeItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        <SectionLabel label="Platform" collapsed={collapsed} />
        {platformItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        <SectionLabel label="Resources" collapsed={collapsed} />
        {resourceItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        <SectionLabel label="Playground" collapsed={collapsed} />
        {playgroundItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        <SectionLabel label="Intelligence" collapsed={collapsed} />
        {intelligenceItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}

        {/* Platform teaser */}
        <div className="mt-auto pt-3">
          {!collapsed && <div className="mb-1 h-px bg-border" />}
          <Link
            href="/dashboard/coming-soon"
            title={collapsed ? "Hermes Platform" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
              pathname === "/dashboard/coming-soon"
                ? "bg-gold/10 text-gold"
                : "text-text-muted hover:bg-gold/5 hover:text-gold"
            }`}
          >
            <Sparkles size={14} className="shrink-0" style={{ color: "rgb(var(--gold))" }} />
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm leading-tight" style={{ color: "rgb(var(--gold))" }}>
                  Platform Preview
                </span>
                <span className="block truncate text-[11px] leading-tight text-text-muted">
                  E-sign, Vault, Integrations
                </span>
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-2 space-y-1">
        <div className={`flex items-center gap-2 px-1 ${collapsed ? "justify-center flex-col" : "justify-between"}`}>
          <ThemeToggle />
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            title="Sign out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-raised hover:text-danger"
          >
            <LogOut size={14} />
          </button>
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-xs text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
        >
          {collapsed ? <ChevronRight size={13} /> : (
            <>
              <ChevronLeft size={13} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
