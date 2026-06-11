"use client";

import {
  type Subscription,
  useDeleteSubscription,
  useSubscriptions,
} from "@/hooks/useSubscriptions";
import { toast } from "@/stores/toastStore";

type SubscriptionOption = {
  id: string;
  label: string;
};

type SubscriptionListProps = {
  categories: SubscriptionOption[];
  agencies: SubscriptionOption[];
};

function getSubscriptionLabel(
  subscription: Subscription,
  categories: SubscriptionOption[],
  agencies: SubscriptionOption[]
): string {
  if (subscription.category_id) {
    return (
      categories.find((category) => category.id === subscription.category_id)
        ?.label ?? subscription.category_id
    );
  }
  if (subscription.agency_user_id) {
    return (
      agencies.find((agency) => agency.id === subscription.agency_user_id)
        ?.label ?? subscription.agency_user_id
    );
  }
  return "-";
}

export default function SubscriptionList({
  categories,
  agencies,
}: SubscriptionListProps) {
  const { data: subscriptions = [], isLoading, isError } = useSubscriptions();
  const deleteMutation = useDeleteSubscription();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast.success("ยกเลิกการติดตามแล้ว");
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-radius-lg bg-surface-container"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-radius-lg border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-body-md text-status-error">
        โหลดรายการติดตามไม่สำเร็จ
      </p>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-radius-lg border border-border-default bg-surface-card px-6 py-12 text-center shadow-level-1">
        <p className="font-sarabun text-body-lg text-text-secondary">
          ยังไม่มีรายการติดตาม
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((subscription) => {
        const type = subscription.category_id ? "หมวดหมู่" : "หน่วยงาน";
        const label = getSubscriptionLabel(subscription, categories, agencies);

        return (
          <div
            key={subscription.id}
            className="flex flex-col justify-between gap-4 rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 sm:flex-row sm:items-center"
          >
            <div>
              <span className="rounded-radius-full bg-primary-light px-3 py-1 font-sarabun text-caption font-semibold text-primary-dark">
                {type}
              </span>
              <h3 className="mt-2 font-sarabun text-label font-semibold text-text-primary">
                {label}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(subscription.id)}
              disabled={deleteMutation.isPending}
              className="rounded-radius-lg px-4 py-2 font-sarabun text-label font-semibold text-status-error transition-colors hover:bg-status-error-bg disabled:opacity-50"
            >
              ยกเลิกติดตาม
            </button>
          </div>
        );
      })}
    </div>
  );
}
