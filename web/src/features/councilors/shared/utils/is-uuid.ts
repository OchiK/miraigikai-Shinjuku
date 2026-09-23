const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Postgres の uuid 型として受け付けられる形式か */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
