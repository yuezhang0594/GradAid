import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    expect(cn('base', condition && 'conditional')).toBe('base conditional');
    expect(cn('base', !condition && 'conditional')).toBe('base');
  });

  it('should handle object syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('should handle array syntax', () => {
    expect(cn('base', ['class1', 'class2'])).toBe('base class1 class2');
  });

  it('should handle complex combinations', () => {
    const isActive = true;
    const isDisabled = false;
    
    expect(cn(
      'base',
      isActive && 'active',
      isDisabled && 'disabled',
      { highlight: true, hidden: false },
      ['margin-2', 'padding-1']
    )).toBe('base active highlight margin-2 padding-1');
  });

  it('should handle falsy values', () => {
    expect(cn('base', false, null, undefined, 0, '')).toBe('base');
  });

  it('should merge Tailwind classes correctly using tailwind-merge', () => {
    // tailwind-merge should combine conflicting classes, keeping the last one
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
