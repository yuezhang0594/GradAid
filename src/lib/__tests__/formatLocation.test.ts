import { describe, it, expect } from 'vitest';
import { formatLocation, stateNameToCode } from '../formatLocation';

describe('stateNameToCode', () => {
  it('should convert state names to their 2-letter codes', () => {
    expect(stateNameToCode('California')).toBe('CA');
    expect(stateNameToCode('New York')).toBe('NY');
    expect(stateNameToCode('texas')).toBe('TX');
  });

  it('should handle state names with different casing', () => {
    expect(stateNameToCode('FLORIDA')).toBe('FL');
    expect(stateNameToCode('massachusetts')).toBe('MA');
    expect(stateNameToCode('Oregon')).toBe('OR');
  });

  it('should handle state names with extra spaces and special characters', () => {
    expect(stateNameToCode(' Ohio ')).toBe('OH');
    expect(stateNameToCode('North Carolina')).toBe('NC');
    expect(stateNameToCode('Washington!')).toBe('WA');
  });

  it('should return undefined for invalid state names', () => {
    expect(stateNameToCode('Invalid State')).toBe(undefined);
    expect(stateNameToCode('Europe')).toBe(undefined);
    expect(stateNameToCode('')).toBe(undefined);
  });

  it('should handle territories correctly', () => {
    expect(stateNameToCode('Puerto Rico')).toBe('PR');
    expect(stateNameToCode('Guam')).toBe('GU');
  });
});

describe('formatLocation', () => {
  it('should handle empty or "all" input', () => {
    expect(formatLocation('')).toBe('');
    expect(formatLocation('all')).toBe('all');
  });

  it('should format city and state combinations', () => {
    expect(formatLocation('San Francisco, California')).toBe('San Francisco, CA');
    expect(formatLocation('New York, New York')).toBe('New York, NY');
    expect(formatLocation('Chicago, Illinois')).toBe('Chicago, IL');
  });

  it('should handle state names without cities', () => {
    expect(formatLocation('California')).toBe('CA');
    expect(formatLocation('Texas')).toBe('TX');
  });

  it('should preserve locations with unknown state names', () => {
    expect(formatLocation('Paris, France')).toBe('Paris, France');
    expect(formatLocation('London, UK')).toBe('London, UK');
  });

  it('should handle extra spaces in the input', () => {
    expect(formatLocation('Boston,  Massachusetts')).toBe('Boston, MA');
    expect(formatLocation(' Seattle,  Washington ')).toBe('Seattle, WA');
  });
});
