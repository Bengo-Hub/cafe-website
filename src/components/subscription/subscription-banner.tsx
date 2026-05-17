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
  RefreshCw,
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

const UPGRADE_PATH = `${SUBSCRIBE_URL}/subscribe`;
const BILLING_PATH = `${SUBSCRIBE_URL}/billing`;

function formatDate(d: Date | null | string | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return format(date, "MMM d, yyyy");
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

/** Full-screen blocking overlay shown when subscription is expired beyond grace period. */
function BlockingOverlay({ plan }: { plan: string }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label="Subscription expired"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-foreground">Subscription Expired</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Your <span className="font-semibold">{plan}</span> plan has expired and the grace period has
          ended. Upgrade now to restore access to your dashboard.
        </p>
      </div>
      <Link
        href={UPGRADE_PATH}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange/90"
      >
        <Zap className="size-4" />
        Upgrade now
      </Link>
    </div>
  );
}

/**
 * Subscription info banner at the top of the dashboard.
 * - Platform owner (codevertex): renders nothing.
 * - Fully expired beyond grace: full-screen blocking overlay (non-dismissable).
 * - In grace period: amber non-dismissable warning.
 * - Active ≤ 7 days to expiry / trial / suspended / cancelled: contextual banners.
 * - Active with expiry: compact info bar with expand-details panel.
 */
export function SubscriptionBanner() {
  const {
    isPlatformOwner,
    status,
    isPastDue,
    needsSubscription,
    isLoading,
    info,
    price,
    currency,
    billingInterval,
    licenseCount,
    renewalDate,
    store,
  } = useSubscription();

  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isPlatformOwner || isLoading || !info) return null;
  if (!store.hydrated) return null;

  const {
    plan,
    gracePeriodEndsAt,
    isInGracePeriod,
    isExpired: storeExpired,
    daysUntilExpiry,
    expiresAt,
  } = store;

  const normalizedPlan = (plan ?? info.planCode ?? "").toUpperCase() || "STARTER";
  const normalizedStatus = (status ?? "").toUpperCase();

  // Beyond grace — block entire dashboard
  if (storeExpired && !isInGracePeriod) {
    return <BlockingOverlay plan={normalizedPlan} />;
  }

  // In grace period — non-dismissable amber banner
  if (isInGracePeriod && gracePeriodEndsAt) {
    const daysLeft = Math.max(
      0,
      Math.ceil((gracePeriodEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );
    return (
      <div className="border-b bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">
              Subscription expired —{" "}
              <span className="font-semibold">{daysLeft} day{daysLeft === 1 ? "" : "s"}</span>{" "}
              left to renew before access is blocked.
            </p>
            <Link
              href={UPGRADE_PATH}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
            >
              Renew now
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dismissable banners
  if (dismissed) return null;

  // Suspended — non-dismissable
  if (normalizedStatus === "SUSPENDED") {
    return (
      <div className="border-b bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">
              Your subscription is suspended. Please update your payment method to restore access.
            </p>
            <Link
              href={BILLING_PATH}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
            >
              Update payment
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Trial countdown
  if (normalizedStatus === "TRIAL" && expiresAt) {
    const days = daysUntilExpiry ?? 0;
    return (
      <div className="border-b bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Clock className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="flex-1 text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">{normalizedPlan}</span> trial —{" "}
              <span className="font-semibold">{days} day{days === 1 ? "" : "s"}</span> left.
              Expires {formatDate(expiresAt)}. Upgrade to keep your features.
            </p>
            <Link
              href={UPGRADE_PATH}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              Subscribe
              <ArrowRight className="size-3" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-3.5 text-blue-700 dark:text-blue-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active — expiring soon (≤7 days)
  if (normalizedStatus === "ACTIVE" && expiresAt && daysUntilExpiry !== null && daysUntilExpiry <= 7) {
    const days = daysUntilExpiry;
    return (
      <div className="border-b bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">
              <span className="font-semibold">{normalizedPlan}</span> plan — Renews in{" "}
              <span className="font-semibold">{days} day{days === 1 ? "" : "s"}</span> on{" "}
              {formatDate(expiresAt)}.
            </p>
            <Link
              href={BILLING_PATH}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700"
            >
              Manage billing
              <ArrowRight className="size-3" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-3.5 text-amber-700 dark:text-amber-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled
  if (normalizedStatus === "CANCELLED") {
    return (
      <div className="border-b bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-4 text-red-600 dark:text-red-400 shrink-0" />
            <p className="flex-1 text-sm text-red-800 dark:text-red-200">
              <span className="font-semibold">{normalizedPlan}</span> plan cancelled
              {expiresAt ? ` — access until ${formatDate(expiresAt)}` : ""}.
              Reactivate to keep using premium features.
            </p>
            <Link
              href={UPGRADE_PATH}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              Reactivate
              <ArrowRight className="size-3" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-3.5 text-red-700 dark:text-red-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active with expiry — compact info bar with expandable details
  if (normalizedStatus === "ACTIVE" && expiresAt) {
    const bgClasses = isPastDue
      ? "bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800"
      : "bg-white/60 border-gray-200 dark:bg-white/5 dark:border-gray-700/50";

    const usageEntries = Object.entries(info.usage ?? {}).filter(
      ([key]) => info.limits?.[key] !== undefined && info.limits[key] !== Infinity,
    );

    return (
      <div className={`border-b ${bgClasses}`}>
        <div className="mx-auto max-w-6xl px-4 py-2">
          <div className="flex items-center gap-3">
            <Crown className="size-4 text-brand-orange shrink-0" />
            <span className="text-sm font-medium truncate">{info.planName || normalizedPlan}</span>
            <StatusBadge status={status} />
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="size-3" />
              Renews {formatDate(expiresAt)}
            </span>
            <div className="flex-1" />
            <Link
              href={UPGRADE_PATH}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-orange px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-brand-orange/90"
            >
              Upgrade
              <ArrowRight className="size-3" />
            </Link>
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mx-auto max-w-6xl border-t border-inherit px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

              {(price != null || billingInterval) && (
                <div className="flex items-start gap-2">
                  <CreditCard className="mt-0.5 size-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Billing</p>
                    <p className="text-sm font-medium">
                      {price != null ? formatCurrency(price, currency) : "—"}
                      {billingInterval && (
                        <span className="text-xs text-gray-400">
                          /{billingInterval === "yearly" ? "yr" : "mo"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {renewalDate && (
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 size-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Next Renewal</p>
                    <p className="text-sm font-medium">{format(renewalDate, "MMM d, yyyy")}</p>
                  </div>
                </div>
              )}

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

            {usageEntries.length > 0 && (
              <div className="mt-4 border-t border-inherit pt-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <BarChart3 className="size-3.5" />
                  Usage
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {usageEntries.map(([key, current]) => (
                    <UsageBar
                      key={key}
                      label={key}
                      current={current}
                      limit={info.limits![key]}
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

  // No subscription / needsSubscription
  if (needsSubscription) {
    return (
      <div className="border-b bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Zap className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="flex-1 text-sm text-blue-800 dark:text-blue-200">
              No active subscription — subscribe to unlock all features.
            </p>
            <Link
              href={UPGRADE_PATH}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              Subscribe
              <ArrowRight className="size-3" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="size-3.5 text-blue-700 dark:text-blue-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
