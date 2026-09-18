import type { Bill, BillInsert } from "../types";

/**
 * 議案データから複製用のinsertデータを生成する
 * ID・タイムスタンプ・generated column を除去し、
 * 名前に「(複製)」を付与、ステータスをdraftに設定
 *
 * status_order / publish_status_order / bill_number_order は
 * GENERATED ALWAYS のため、値を渡すと INSERT がエラーになる。
 */
export function prepareBillForDuplication(originalBill: Bill): BillInsert {
  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    status_order: _statusOrder,
    publish_status_order: _publishStatusOrder,
    bill_number_order: _billNumberOrder,
    ...billWithoutId
  } = originalBill;

  return {
    ...billWithoutId,
    name: `${originalBill.name} (複製)`,
    publish_status: "draft",
    bill_number: "",
    is_review_completed: false,
  };
}

/**
 * 議案コンテンツ配列から複製用のデータを生成する
 * IDを除去し、新しいbill_idを設定
 */
export function prepareBillContentsForDuplication<
  T extends { id: string; bill_id: string },
>(
  contents: T[],
  newBillId: string
): (Omit<T, "id" | "bill_id"> & { bill_id: string })[] {
  return contents.map((content) => {
    const { id: _, bill_id: __, ...contentData } = content;
    return {
      ...contentData,
      bill_id: newBillId,
    };
  });
}
