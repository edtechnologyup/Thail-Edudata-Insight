"use client";

import { useDeleteMLModel } from "@/hooks/useMLModels";

type Props = {
  open: boolean;
  model: { id: string; name: string } | null;
  onClose: () => void;
  onError?: (message: string) => void;
  onDeleted?: () => void;
};

export default function DeleteMLModelModal({
  open,
  model,
  onClose,
  onError,
  onDeleted,
}: Props) {
  const deleteMutation = useDeleteMLModel();

  if (!open || !model) return null;

  const handleDelete = () => {
    deleteMutation.mutate(model.id, {
      onSuccess: () => {
        onClose();
        onDeleted?.();
      },
      onError: () => onError?.("ลบโมเดลไม่สำเร็จ"),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="font-kanit text-lg font-bold text-text-primary">
          ลบโมเดล
        </h3>
        <p className="mt-2 font-sarabun text-body-md text-text-secondary">
          คุณต้องการลบโมเดล{" "}
          <span className="font-semibold text-text-primary">
            &ldquo;{model.name}&rdquo;
          </span>{" "}
          ใช่หรือไม่?
        </p>
        <p className="mt-2 font-sarabun text-caption text-[#e53935]">
          การลบจะลบข้อมูลโมเดลและไฟล์ทั้งหมดออกอย่างถาวร ไม่สามารถกู้คืนได้
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="rounded-xl px-5 py-2.5 font-sarabun text-label font-medium text-text-secondary transition-colors hover:bg-[#f0f2f5]"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-xl bg-[#e53935] px-5 py-2.5 font-sarabun text-label font-medium text-white transition-colors hover:bg-[#c62828] disabled:opacity-50"
          >
            {deleteMutation.isPending ? "กำลังลบ..." : "ลบถาวร"}
          </button>
        </div>
      </div>
    </div>
  );
}
