export function lpad(num: number, length: number = 2, char: string = '0'): string {
  return num.toString().padStart(length, char);
}
