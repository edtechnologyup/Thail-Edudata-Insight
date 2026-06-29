"use client";

import { useEffect, useState } from "react";
import { useSettingImage } from "@/hooks/useHeroImage";

export default function SettingPopup() {
  const { data } = useSettingImage("popup_image");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (data?.imageUrl && !sessionStorage.getItem("popup_dismissed")) {
      setOpen(true);
    }
  }, [data?.imageUrl]);

  if (!open || !data?.imageUrl) return null;

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("popup_dismissed", "1");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-[90vw] max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
          aria-label="ปิด"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.imageUrl}
          alt=""
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
    </div>
  );
}
