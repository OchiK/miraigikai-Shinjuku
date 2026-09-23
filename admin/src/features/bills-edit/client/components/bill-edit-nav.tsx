"use client";

import { Edit, FileText, Languages } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

interface BillEditNavProps {
  billId: string;
}

/** 議案の「基本情報」「難易度別コンテンツ」「多言語翻訳」を行き来するタブ */
export function BillEditNav({ billId }: BillEditNavProps) {
  const pathname = usePathname();

  const items = [
    { href: routes.billEdit(billId), label: "基本情報", icon: Edit },
    {
      href: routes.billContentsEdit(billId),
      label: "難易度別コンテンツ",
      icon: FileText,
    },
    {
      href: routes.billTranslations(billId),
      label: "多言語翻訳",
      icon: Languages,
    },
  ];

  return (
    <nav aria-label="議案の編集メニュー" className="mb-6 flex flex-wrap gap-2">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Button
            key={href}
            asChild
            variant={isActive ? "default" : "outline"}
            size="sm"
          >
            <Link
              href={href as Route}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
