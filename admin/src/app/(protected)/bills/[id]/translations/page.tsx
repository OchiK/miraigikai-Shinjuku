import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BillTranslationsView } from "@/features/bill-translations/client/components/bill-translations-view";
import { getBillTranslations } from "@/features/bill-translations/server/loaders/get-bill-translations";
import { BillEditNav } from "@/features/bills-edit/client/components/bill-edit-nav";
import { getBillById } from "@/features/bills-edit/server/loaders/get-bill-by-id";
import { routes } from "@/lib/routes";

interface BillTranslationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BillTranslationsPage({
  params,
}: BillTranslationsPageProps) {
  const { id } = await params;
  // 存在しない ID で翻訳の取得がエラーになる前に 404 を返す
  const bill = await getBillById(id);
  if (!bill) {
    notFound();
  }
  const groups = await getBillTranslations(bill.id);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={routes.bills()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          議案一覧に戻る
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">多言語翻訳の確認</h1>
        <p className="mt-1 text-muted-foreground">{bill.name}</p>
      </div>

      <BillEditNav billId={bill.id} />
      <BillTranslationsView groups={groups} />
    </div>
  );
}
