"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/lib/store/auth-store";
import type { SubscriptionInfo } from "@/lib/auth/subscription";
import { fetchSubscriptionInfo } from "@/lib/auth/subscription";
import { useSubscriptionStore } from "@/store/subscription";

/**
 * Hook for accessing subscription state and feature gating.
 * Subscription is loaded lazily after authentication — never blocks login.
 * Hydrates from IndexedDB on startup so gating works offline.
 *
 * Usage:
 *   const { isActive, hasFeature, isPlatformOwner, store } = useSubscription();
 *   if (!hasFeature("loyalty_program")) showUpgradePrompt();
 */
export function useSubscription() {
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const subscriptionInfo = useAuthStore((s) => s.subscriptionInfo);
  const setSubscriptionInfo = useAuthStore((s) => s.setSubscriptionInfo);

  const subStore = useSubscriptionStore();

  const tenantSlug = (user as any)?.tenant_slug as string | undefined;
  const isPlatformOwner =
    !!(user as any)?.is_platform_owner || tenantSlug === "codevertex";
  const isServiceCharge = (user as any)?.billing_mode === "service_charge";
  const isDemo = !!(user as any)?.is_demo || tenantSlug === "codevertex-demo";

  // Hydrate from IndexedDB immediately on auth so gating works offline
  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    const slug = tenantSlug ?? "";
    if (slug) {
      useSubscriptionStore.getState().loadFromIDB(slug);
    }
  }, [status, user, tenantSlug]);

  // Fetch subscription info (quick-init from JWT tenant data, then full API fetch)
  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken || !user) return;
    if (subscriptionInfo !== undefined) return;

    setSubscriptionInfo(null);

    const tenantId = (user as any).tenant_id as string | undefined;
    const slug = tenantSlug ?? "";

    if (!tenantId || isPlatformOwner) {
      const platformInfo = {
        status: "active",
        planCode: "enterprise",
        planName: "Enterprise",
        features: [],
        limits: {},
      };
      setSubscriptionInfo(platformInfo as any);
      useSubscriptionStore.getState().setFromRaw(
        { plan: "ENTERPRISE", status: "ACTIVE", features: [], limits: {} },
        slug,
      );
      return;
    }

    // Quick-init from JWT tenant claims (auth/me embeds subscription_status + plan)
    const tenant = (user as any).tenant as Record<string, any> | undefined;
    if (tenant?.subscription_status) {
      const quickInfo = {
        status: (tenant.subscription_status as string).toLowerCase(),
        planCode: (tenant.subscription_plan as string) ?? "",
        planName: (tenant.subscription_plan as string) ?? "",
        features: (tenant.subscription_features as string[]) ?? [],
        limits: (tenant.tier_limits as Record<string, number>) ?? {},
        trialEndsAt: tenant.subscription_expires_at as string | undefined,
        currentPeriodEnd: tenant.subscription_expires_at as string | undefined,
      };
      setSubscriptionInfo(quickInfo as any);
      useSubscriptionStore.getState().setFromRaw(
        {
          plan: (tenant.subscription_plan as string) ?? null,
          status: (tenant.subscription_status as string) ?? null,
          expiresAt:
            (tenant.subscription_grace_ends_at as string) ??
            (tenant.subscription_expires_at as string) ??
            null,
          features: (tenant.subscription_features as string[]) ?? [],
          limits: (tenant.tier_limits as Record<string, number>) ?? {},
        },
        slug,
      );

      // Then fetch full subscription details in background
      fetchSubscriptionInfo(tenantId, slug, session.accessToken)
        .then((info) => {
          if (!info) return;
          setSubscriptionInfo(info as any);
          useSubscriptionStore.getState().setFromRaw(
            {
              plan: info.planCode,
              status: info.status,
              expiresAt: info.currentPeriodEnd ?? info.trialEndsAt ?? null,
              features: info.features,
              limits: info.limits,
            },
            slug,
          );
        })
        .catch(() => {});
      return;
    }

    // Fallback: direct API fetch only
    fetchSubscriptionInfo(tenantId, slug, session.accessToken)
      .then((info) => {
        const resolved = info ?? {
          status: "none",
          planCode: "",
          planName: "",
          features: [],
          limits: {},
        };
        setSubscriptionInfo(resolved as any);
        useSubscriptionStore.getState().setFromRaw(
          {
            plan: resolved.planCode || null,
            status: resolved.status || null,
            expiresAt:
              (resolved as any).currentPeriodEnd ??
              (resolved as any).trialEndsAt ??
              null,
            features: resolved.features,
            limits: resolved.limits,
          },
          slug,
        );
      })
      .catch(() =>
        setSubscriptionInfo({
          status: "none",
          planCode: "",
          planName: "",
          features: [],
          limits: {},
        } as any),
      );
  }, [
    status,
    session?.accessToken,
    user,
    subscriptionInfo,
    setSubscriptionInfo,
    tenantSlug,
    isPlatformOwner,
  ]);

  const info = subscriptionInfo as SubscriptionInfo | null | undefined;
  const subStatus = info?.status ?? null;

  return {
    /** Raw subscription info (null = loading, undefined = not started) */
    info,
    /** Subscription status string (lowercase) */
    status: subStatus,
    /** Plan code (e.g. "starter", "growth", "professional") */
    plan: info?.planCode ?? null,
    /** Whether subscription is active (active or trial) */
    isActive: subStatus === "active" || subStatus === "trial" || isServiceCharge || isDemo,
    /** Whether the subscription is in a warning state */
    isPastDue: subStatus === "past_due" || subStatus === "suspended",
    /** Whether the subscription has expired */
    isExpired: subStatus === "expired" || subStatus === "cancelled",
    /** Whether no subscription exists */
    needsSubscription: subStatus === "none" && !isServiceCharge && !isDemo,
    /** Whether subscription info is still loading */
    isLoading: subscriptionInfo === null || subscriptionInfo === undefined,
    /** Whether this is the platform owner (codevertex) — always has full access */
    isPlatformOwner,
    isServiceCharge,
    isDemo,
    /** Check if a specific feature is available */
    hasFeature: (code: string) => info?.features?.includes(code) ?? false,
    /** Get a usage limit value (defaults to Infinity if not set) */
    getLimit: (key: string) => info?.limits?.[key] ?? Infinity,
    /** Subscription price */
    price: info?.price ?? null,
    /** Currency code (e.g. "KES", "USD") */
    currency: info?.currency ?? "KES",
    /** Billing interval ("monthly" | "yearly") */
    billingInterval: info?.billingInterval ?? null,
    /** Number of licensed seats */
    licenseCount: info?.licenseCount ?? null,
    /** Current usage metrics */
    usage: info?.usage ?? {},
    /** Next renewal date */
    renewalDate: info?.currentPeriodEnd ? new Date(info.currentPeriodEnd) : null,
    /** Zustand subscription store (with IDB-persisted state + computed grace fields) */
    store: subStore,
  };
}
