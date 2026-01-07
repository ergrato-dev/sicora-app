import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases CSS usando clsx y tailwind-merge
 *
 * Esta utilidad permite:
 * - Combinación condicional de clases con clsx
 * - Resolución de conflictos de TailwindCSS con tailwind-merge
 * - Soporte para todas las sintaxis de clsx (strings, objects, arrays)
 *
 * @param inputs - Clases CSS a combinar
 * @returns String con las clases combinadas y optimizadas
 *
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', { 'text-white': isActive })
 * cn('p-4', 'p-2') // Resultado: 'p-2' (tailwind-merge resuelve el conflicto)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
