type CN = string | number | false | null | undefined;

export function cn(...args: CN[]): string {
  return args.filter(Boolean).join(" ");
}
