import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  existsSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { redactBackupReviewers } from "./redact-backup";

const header =
  "COPY public.bill_content_translations (id, reviewed_by, content) FROM stdin;\n";
const dump = `${header}1\tperson@example.com\ttext\\twith\\nescapes\n2\t\\N\t日本語\n\\.\n`;

describe("redactBackupReviewers", () => {
  it("replaces only non-null reviewers and preserves other tables and escapes", () => {
    const other =
      "COPY public.bills (id, name) FROM stdin;\na\tperson@example.com\n\\.\n";
    expect(redactBackupReviewers(other + dump + other)).toBe(
      other + dump.replace("person@example.com", "redacted") + other
    );
  });

  it("uses the column names rather than a fixed position and preserves CRLF", () => {
    const source =
      "COPY public.bill_content_translations (reviewed_by, id) FROM stdin;\r\n\\N\t1\r\n\t2\r\nreviewer\t3\r\n\\.\r\n";
    expect(redactBackupReviewers(source)).toBe(
      source
        .replace("\r\n\t2", "\r\nredacted\t2")
        .replace("reviewer\t3", "redacted\t3")
    );
  });

  it("does not treat another table's COPY text as SQL", () => {
    const other = `COPY public.notes (text) FROM stdin;\n${header}\\.\n`;
    expect(redactBackupReviewers(other + dump)).toBe(
      other + dump.replace("person@example.com", "redacted")
    );
  });

  it("accepts an empty translation table", () => {
    expect(redactBackupReviewers(`${header}\\.\n`)).toBe(`${header}\\.\n`);
  });

  it.each([
    ["missing block", "-- no translations\n"],
    [
      "missing column",
      "COPY public.bill_content_translations (id) FROM stdin;\n1\n\\.\n",
    ],
    ["too few columns", `${header}1\treviewer\n\\.\n`],
    ["too many columns", `${header}1\treviewer\ttext\textra\n\\.\n`],
    ["missing terminator", `${header}1\treviewer\ttext\n`],
  ])("rejects %s", (_label, source) => {
    expect(() => redactBackupReviewers(source)).toThrow();
  });

  it("CLI writes only the validated redacted file and fails without output for invalid input", () => {
    const dir = mkdtempSync(join(tmpdir(), "redact-backup-"));
    const input = join(dir, "raw.sql");
    const output = join(dir, "redacted.sql");
    const cli = fileURLToPath(new URL("./redact-backup.ts", import.meta.url));
    try {
      writeFileSync(input, dump);
      const run = () =>
        spawnSync(process.execPath, ["--import", "tsx", cli, input, output], {
          encoding: "utf8",
        });
      expect(run().status).toBe(0);
      expect(readFileSync(input, "utf8")).toBe(dump);
      expect(readFileSync(output, "utf8")).toBe(redactBackupReviewers(dump));
      rmSync(output);
      writeFileSync(input, "-- invalid\n");
      expect(run().status).not.toBe(0);
      expect(existsSync(output)).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
