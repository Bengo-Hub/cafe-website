"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  Crown,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";

import { useSubscription } from "@/hooks/use-subscription";

const SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_UI_URL || "https://pricing.codevertexitsolutions.com";

function getActionConfig(status: string | null) {
  switch (status) {
    case "active":
      return { label: "Upgrade", href: `${SUBSCRIBE_URL}/subscribe` };
    case "trial":
      return { label: "Subscribe", href: `${SUBSCRIBE_URL}/subscribe` };
    case "past_due":
    case "suspended":
      return { label: "Update Payment", href: `${SUBSCRIBE_URL}/billing` };
    case "expired":
    case "cancelled":
      return { label: "Reactivate", href: `${SUBSCRIBE_URL}/subscribe` };
    default:
      return { label: "Subscribe", href: `${SUBSCRIBE_URL}/subscribe` };
  }
}

function StatusBadge({ status }: { status: string | null }) {
  const config: Record<string, { label: string; classes: string }> = {
    active: { label: "Active", classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    trial: { label: "Trial", classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    past_due: { label: "Past Due", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
    suspended: { label: "Suspended", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
    expired: { label: "Expired", classes: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
    cancelled: { label: "Cancelled", classes: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
    none: { label: "Free", classes: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  };
  const c = config[status ?? "none"] ?? config.none;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.classes}`}>
      {c.label}
    </span>
  );
}

function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0;
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400 capitalize">{label.replace(/_/g, " ")}</span>
        <span className="font-medium">{current.toLocaleString()} / {limit.toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Subscription info banner at the top of the dashboard.
 * Shows compact plan info for all states; expands to show billing details.
 * Alert-style backgrounds for degraded states (past_due, expired, none).
 */
export function SubscriptionBanner() {
  const {
    status, isActive, isPastDue, isExpired, needsSubscription, isLoading, info,
    price, currency, billingInterval, licenseCount, usage, renewalDate,
  } = useSubscription();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !info) return null;

  // Only allow dismissing alert variants (not active/trial info card)
  const isAlertState = isPastDue || isExpired || needsSubscription;
  if (dismissed && isAlertState) return null;

  const action = getActionConfig(status);
  const trialDaysLeft = status === "trial" && info.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(info.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Background styling based on state
  const bgClasses = isPastDue
    ? "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800"
    : isExpired
      ? "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800"
      : needsSubscription
        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800"
        : "bg-white/60 border-gray-200 dark:bg-white/5 dark:border-gray-700/50";

  // Alert icon for degraded states
  const alertIcon = isPastDue
    ? <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
    : isExpired
      ? <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
      : needsSubscription
        ? <Zap className="size-4 text-blue-600 dark:text-blue-400" />
        : <Crown className="size-4 text-brand-orange" />;

  const usageEntries = Object.entries(usage).filter(
    ([key]) => info.limits[key] !== undefined && info.limits[key] !== Infinity,
  );

  return (
    <div className={`border-b ${bgClasses}`}>
      {/* Compact bar */}
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="flex items-center gap-3">
          {alertIcon}
          <span className="text-sm font-medium truncate">
            {info.planName || "Free Tier"}
          </span>
          <StatusBadge status={status} />
          {trialDaysLeft !== null && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <Clock className="size-3" />
              {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
            </span>
          )}
          {isPastDue && (
            <span className="hidden sm:inline text-xs text-amber-700 dark:text-amber-300">
              Payment overdue
            </span>
          )}
          <div className="flex-1" />
          <Link
            href={action.href}
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-orange px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-orange/90"
          >
            {action.label}
            <ArrowRight className="size-3" />
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {isAlertState && (
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mx-auto max-w-6xl border-t border-inherit px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Plan */}
            <div className="flex items-start gap-2">
              <Crown className="mt-0.5 size-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>
                <p className="text-sm font-medium">{info.planName || "Free"}</p>
                {info.planCode && (
                  <p className="text-xs text-gray-400">{info.planCode}</p>
                )}
              </div>
            </div>

            {/* Billing */}
            {(price != null || billingInterval) && (
              <div className="flex items-start gap-2">
                <CreditCard className="mt-0.5 size-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Billing</p>
                  <p className="text-sm font-medium">
                    {price != null ? formatCurrency(price, currency) : "—"}
                    {billingInterval && <span className="text-xs text-gray-400">/{billingInterval === "yearly" ? "yr" : "mo"}</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Renewal */}
            {renewalDate && (
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 size-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isActive ? "Next Renewal" : "Expired On"}
                  </p>
                  <p className="text-sm font-medium">{format(renewalDate, "MMM d, yyyy")}</p>
                </div>
              </div>
            )}

            {/* Seats */}
            {licenseCount != null && (
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 size-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                  <p className="text-sm font-medium">{licenseCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Usage bars */}
          {usageEntries.length > 0 && (
            <div className="mt-4 border-t border-inherit pt-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                <BarChart3 className="size-3.5" />
                Usage
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {usageEntries.map(([key]) => (
                  <UsageBar
                    key={key}
                    label={key}
                    current={usage[key] ?? 0}
                    limit={info.limits[key]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
