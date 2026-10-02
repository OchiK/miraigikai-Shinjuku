// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { BillWithContent } from "@/features/bills/shared/types";
import { ChatWindow } from "./chat-window";

vi.mock("@/hooks/use-is-desktop", () => ({
  useIsDesktop: () => true,
}));

vi.mock("@/hooks/use-viewport-height", () => ({
  useViewportHeight: () => 800,
}));

vi.mock("./system-message", () => ({
  SystemMessage: () => null,
}));

vi.mock("use-stick-to-bottom", () => ({
  useStickToBottomContext: () => ({ scrollToBottom: vi.fn() }),
}));

vi.mock("@/components/ai-elements/conversation", () => ({
  Conversation: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ConversationContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ConversationScrollButton: () => null,
}));

const bill = {
  id: "bill-1",
  name: "議案第1号",
  bill_content: { title: "テスト議案" },
} as unknown as BillWithContent;

const chatState = {
  messages: [],
  sendMessage: vi.fn(),
  status: "ready",
  error: undefined,
} as unknown as ReturnType<typeof import("@ai-sdk/react").useChat>;

describe("ChatWindow", () => {
  it("議案名とチャット専用の言語切り替えをヘッダーに表示する", () => {
    const onLocaleChange = vi.fn();
    render(
      <ChatWindow
        billContext={bill}
        chatState={chatState}
        difficultyLevel="normal"
        isOpen
        locale="ja"
        onClose={vi.fn()}
        onLocaleChange={onLocaleChange}
        sessionId="session-1"
      />
    );

    expect(screen.getByText("議案第1号")).toBeTruthy();
    const languageGroup = screen.getByRole("group", {
      name: "チャットの表示言語",
    });
    expect(languageGroup).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "日本語" })
        .getAttribute("aria-pressed")
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });
});
