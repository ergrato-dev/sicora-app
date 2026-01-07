import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('combina clases simples', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('filtra valores falsy', () => {
    expect(cn('class1', false, 'class2', null, 'class3', undefined)).toBe('class1 class2 class3');
  });

  it('maneja clases condicionales', () => {
    const condition = true;
    expect(cn('base', condition && 'conditional')).toBe('base conditional');
  });

  it('maneja clases condicionales falsas', () => {
    const condition = false;
    expect(cn('base', condition && 'conditional')).toBe('base');
  });

  it('resuelve conflictos de Tailwind CSS', () => {
    // tailwind-merge debería resolver conflictos de clases de Tailwind
    expect(cn('px-2 px-4')).toBe('px-4');
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500');
  });

  it('preserva clases no conflictivas', () => {
    expect(cn('px-4 py-2 text-white')).toBe('px-4 py-2 text-white');
  });

  it('maneja arrays de clases', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('maneja objetos de clases', () => {
    expect(
      cn({
        class1: true,
        class2: false,
        class3: true,
      })
    ).toBe('class1 class3');
  });

  it('combina diferentes tipos de entrada', () => {
    expect(
      cn(
        'base',
        ['array1', 'array2'],
        {
          object1: true,
          object2: false,
        },
        'final'
      )
    ).toBe('base array1 array2 object1 final');
  });

  it('maneja strings vacíos', () => {
    expect(cn('', 'class1', '', 'class2')).toBe('class1 class2');
  });

  it('maneja entrada vacía', () => {
    expect(cn()).toBe('');
  });
});
