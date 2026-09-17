import Image from "next/image";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";

export async function DifficultyInfoCard() {
  const level = await getDifficultyLevel();
  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-6 my-10 h-38 flex flex-col justify-center">
      <div className="relative z-1 flex flex-col gap-0">
        <p className="text-base font-medium leading-[1.875em] text-gray-800">
          説明の詳しさを
          <br className="pc:hidden" />
          いつでも切り替えられます
        </p>
        <div className="mt-3">
          <DifficultySelector currentLevel={level} maintainScrollFromBottom />
        </div>
      </div>
      <div className="absolute right-6 top-6 w-[121px] h-[128px]">
        <Image
          src="/images/readingbook_woman_green.png"
          alt=""
          width={121}
          height={128}
          className="object-contain"
        />
      </div>
    </div>
  );
}
