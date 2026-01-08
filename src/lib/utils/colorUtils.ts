/**
 * Utilitários para manipulação de cores
 */

/**
 * Escurece uma cor hexadecimal
 * @param color - Cor no formato hexadecimal (#RRGGBB)
 * @param amount - Quantidade a escurecer (0-255)
 * @returns Cor RGB no formato rgb(r, g, b)
 */
export function darken(color: string, amount: number): string {
  const num = parseInt(color.slice(1), 16);
  const r = Math.max((num >> 16) - amount, 0);
  const g = Math.max((num >> 8 & 0xff) - amount, 0);
  const b = Math.max((num & 0xff) - amount, 0);
  return `rgb(${r},${g},${b})`;
}

