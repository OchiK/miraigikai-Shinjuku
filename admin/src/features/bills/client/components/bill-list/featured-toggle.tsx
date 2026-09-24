"use client";

import { Star } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { updateBillFeaturedAction } from "../../../server/actions/update-bill-featured";
import { resolveFeaturedToggle } from "../../../shared/utils/resolve-featured-toggle";

type FeaturedToggleProps = {
  billId: string;
  billName: string;
  isFeatured: boolean;
};

export function FeaturedToggle({
  billId,
  billName,
  isFeatured,
}: FeaturedToggleProps) {
  const [currentFeatured, setCurrentFeatured] = useState(isFeatured);
  const [prevIsFeatured, setPrevIsFeatured] = useState(isFeatured);
  const [isPending, startTransition] = useTransition();

  // 一覧の再取得で値が変わったら（他タブ・編集画面での変更など）追従する
  if (isFeatured !== prevIsFeatured) {
    setPrevIsFeatured(isFeatured);
    setCurrentFeatured(isFeatured);
  }

  function handleToggle(checked: boolean) {
    // オプティミスティック更新
    setCurrentFeatured(checked);

    startTransition(async () => {
      // 通信失敗などでアクション自体が reject した場合も失敗として扱う
      const result = await updateBillFeaturedAction({
        billId,
        isFeatured: checked,
      }).catch(() => ({ success: false }));
      const outcome = resolveFeaturedToggle({
        billName,
        requested: checked,
        result,
      });

      setCurrentFeatured(outcome.isFeatured);
      switch (outcome.toast.type) {
        case "success":
          toast.success(outcome.toast.message);
          break;
        case "warning":
          toast.warning(outcome.toast.message);
          break;
        case "error":
          toast.error(outcome.toast.message);
          break;
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Switch
        checked={currentFeatured}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-label={`${billName}を注目議案にする`}
      />
      {currentFeatured && (
        <Star
          className="size-3.5 fill-primary text-primary"
          strokeWidth={2.75}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
