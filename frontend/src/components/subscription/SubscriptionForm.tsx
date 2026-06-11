"use client";

import { useState } from "react";
import {
  type CreateSubscriptionInput,
  useCreateSubscription,
} from "@/hooks/useSubscriptions";
import { toast } from "@/stores/toastStore";

type SubscriptionOption = {
  id: string;
  label: string;
};

type SubscriptionFormProps = {
  categories: SubscriptionOption[];
  agencies: SubscriptionOption[];
};

export default function SubscriptionForm({
  categories,
  agencies,
}: SubscriptionFormProps) {
  const createMutation = useCreateSubscription();
  const [value, setValue] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [type, id] = value.split(":");
    if (!id) return;

    const payload: CreateSubscriptionInput =
      type === "category" ? { category_id: id } : { agency_user_id: id };

    await createMutation.mutateAsync(payload);
    setValue("");
    toast.success("ติดตามแล้ว");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-radius-lg border border-border-default bg-surface-card p-5 shadow-level-1"
    >
        <label className="block font-sarabun text-label font-medium text-text-secondary">
          เลือกหมวดหมู่หรือหน่วยงานที่ต้องการติดตาม
          <select
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="mt-2 h-11 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
          >
            <option value="">เลือกรายการติดตาม</option>
            <optgroup label="หมวดหมู่">
              {categories.map((category) => (
                <option key={category.id} value={`category:${category.id}`}>
                  {category.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="หน่วยงาน">
              {agencies.map((agency) => (
                <option key={agency.id} value={`agency:${agency.id}`}>
                  {agency.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <button
          type="submit"
          disabled={!value || createMutation.isPending}
          className="mt-4 rounded-radius-lg bg-primary px-5 py-2.5 font-sarabun text-label font-semibold text-surface-card transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          ติดตาม
        </button>
    </form>
  );
}
