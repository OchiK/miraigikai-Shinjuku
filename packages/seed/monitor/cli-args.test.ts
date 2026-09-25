import { describe, expect, it } from "vitest";
import { parseMonitorCliArgs } from "./cli-args";

describe("parseMonitorCliArgs", () => {
  it("引数なしは書き出しあり（dryRun: false）", () => {
    expect(parseMonitorCliArgs([])).toEqual({ dryRun: false });
  });

  it("--dry-run を渡すと dryRun: true（pnpm の -- 区切りも受け付ける）", () => {
    expect(parseMonitorCliArgs(["--dry-run"])).toEqual({ dryRun: true });
    expect(parseMonitorCliArgs(["--", "--dry-run"])).toEqual({ dryRun: true });
  });

  it("タイポは停止する", () => {
    for (const typo of ["--dryrun", "--dry_run", "-d"]) {
      expect(() => parseMonitorCliArgs([typo])).toThrow(/未知の引数/);
    }
  });
});
