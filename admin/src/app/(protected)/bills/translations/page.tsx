import { BillsTranslationMatrixView } from "@/features/bill-translations/client/components/bills-translation-matrix-view";
import { getBillsTranslationMatrix } from "@/features/bill-translations/server/loaders/get-bills-translation-matrix";

export default async function BillTranslationsListPage() {
  const matrix = await getBillsTranslationMatrix();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">多言語翻訳</h1>
        <p className="mt-1 text-muted-foreground">
          議案ごと・言語ごとの翻訳の状態です。状態をクリックすると、その言語の翻訳を確認・編集できます
        </p>
      </div>

      <BillsTranslationMatrixView matrix={matrix} />
    </div>
  );
}
