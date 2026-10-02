// @vitest-environment jsdom
import type { UIMessage } from "@ai-sdk/react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
// Response は katex の CSS を import するため vitest では読めない。本文の描画だけ素の要素に差し替える
vi.mock("@/components/ai-elements/response", () => ({
  Response: ({ children }: { children: ReactNode }) => <p>{children}</p>,
}));

import { SystemMessage } from "./system-message";

function assistantMessage(text: string): UIMessage {
  return {
    id: "m1",
    role: "assistant",
    parts: [{ type: "text", text }],
  };
}

function declineMessage(text: string): UIMessage {
  return {
    ...assistantMessage(text),
    parts: [
      { type: "data-chat-response", data: { kind: "decline" } },
      { type: "text", text },
    ],
  };
}

describe("SystemMessage", () => {
  it("本文と出典チップを分けて描画し、出典行は本文に残さない", () => {
    const { container } = render(
      <SystemMessage
        isStreaming={false}
        message={assistantMessage(
          "対象は区内の事業者です。\n\n【出典】議案第58号 本文"
        )}
      />
    );

    expect(screen.getByText("対象は区内の事業者です。")).toBeTruthy();
    const chip = screen.getByText("議案第58号 本文");
    expect(chip.className).toContain("bg-mirai-source-chip");
    expect(container.textContent).not.toContain("【出典】");
  });

  it("英語の Source: 行もチップになり、一覧のラベルが英語になる", () => {
    render(
      <SystemMessage
        isStreaming={false}
        locale="en"
        message={assistantMessage(
          "It applies to businesses.\nSource: Bill No. 58"
        )}
      />
    );

    expect(screen.getByText("Bill No. 58").className).toContain(
      "bg-mirai-source-chip"
    );
    expect(screen.getByLabelText("Source")).toBeTruthy();
  });

  it("完了した回答に出典が無ければ本文を表示せず、定型の辞退に差し替える", () => {
    const { container } = render(
      <SystemMessage
        isStreaming={false}
        message={assistantMessage("根拠のない回答です。")}
      />
    );
    expect(container.textContent).not.toContain("根拠のない回答です。");
    expect(container.textContent).toContain(
      "提供された議案資料からは確認できません"
    );
    expect(container.querySelector("ul")).toBeNull();
  });

  it("ストリーミング中は、出典行が届く前の本文を表示する", () => {
    render(
      <SystemMessage
        isStreaming
        message={assistantMessage("生成途中の回答です。")}
      />
    );
    expect(screen.getByText("生成途中の回答です。")).toBeTruthy();
  });

  it("サーバーが定型応答として示した辞退は、出典なしでも表示する", () => {
    render(
      <SystemMessage
        isStreaming={false}
        message={declineMessage(
          "このチャットは、この議案についての質問にお答えします。"
        )}
      />
    );
    expect(
      screen.getByText("このチャットは、この議案についての質問にお答えします。")
    ).toBeTruthy();
  });

  it("URLの出典は別タブで開くリンクにする", () => {
    render(
      <SystemMessage
        isStreaming={false}
        message={assistantMessage(
          "本文\n【出典】https://www.city.shinjuku.lg.jp/"
        )}
      />
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("アシスタントの吹き出しは角を1つ落とし、カード色の面にする", () => {
    const { container } = render(
      <SystemMessage isStreaming={false} message={assistantMessage("本文")} />
    );
    const bubble = container.querySelector(".rounded-tl-sm");
    expect(bubble?.className).toContain("bg-card");
    expect(screen.getByText("AI").className).toContain("bg-mirai-ai-bg");
  });
});
