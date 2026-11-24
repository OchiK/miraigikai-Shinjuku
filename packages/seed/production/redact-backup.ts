import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** Preserve the SQL dump byte for byte except non-null reviewer identities. */
export function redactBackupReviewers(dump: string): string {
  let found = false;
  let reviewerIndex = -1;
  let columnCount = 0;
  let inTranslations = false;
  let inOtherTable = false;
  const result = dump.split(/(?<=\n)/).map((line) => {
    const body = line.replace(/\r?\n$/, "");
    if (inOtherTable) {
      if (body === "\\.") inOtherTable = false;
      return line;
    }
    if (!inTranslations) {
      const copy = body.match(
        /^COPY public\.bill_content_translations \(([^)]+)\) FROM stdin;$/
      );
      if (!copy) {
        if (/^COPY .+ FROM stdin;$/.test(body)) inOtherTable = true;
        return line;
      }
      found = true;
      const columns = copy[1].split(",").map((column) => column.trim());
      reviewerIndex = columns.indexOf("reviewed_by");
      if (reviewerIndex < 0) {
        throw new Error("Translation COPY block has no reviewed_by column");
      }
      columnCount = columns.length;
      inTranslations = true;
      return line;
    }
    if (body === "\\.") {
      inTranslations = false;
      return line;
    }
    const fields = body.split("\t");
    if (fields.length !== columnCount) {
      throw new Error("Translation COPY row has an invalid column count");
    }
    if (fields[reviewerIndex] === "\\N") return line;
    fields[reviewerIndex] = "redacted";
    return fields.join("\t") + line.slice(body.length);
  });
  if (!found) throw new Error("Translation COPY block not found");
  if (inTranslations) throw new Error("Translation COPY block is unterminated");
  return result.join("");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const [, , input, output] = process.argv;
    if (!input || !output || input === output) {
      throw new Error(
        "Usage: redact-backup.ts <raw-input.sql> <redacted-output.sql>"
      );
    }
    const redacted = redactBackupReviewers(readFileSync(input, "utf8"));
    writeFileSync(output, redacted, { flag: "wx" });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
