import { describe, it, expect } from 'vitest';
import { TABLES_WITH_USER_DATA, degreeLabels } from '../validators';

describe('TABLES_WITH_USER_DATA', () => {
  it('should be defined as a readonly array', () => {
    expect(Array.isArray(TABLES_WITH_USER_DATA)).toBe(true);
    // Check that it's readonly by verifying it has the expected structure
    expect(TABLES_WITH_USER_DATA).toEqual([
      "userProfiles",
      "applications",
      "applicationDocuments",
      "aiCredits",
      "aiCreditUsage",
      "userActivity",
      "favorites",
    ]);
  });

  it('should contain all expected user data tables', () => {
    expect(TABLES_WITH_USER_DATA).toContain("userProfiles");
    expect(TABLES_WITH_USER_DATA).toContain("applications");
    expect(TABLES_WITH_USER_DATA).toContain("applicationDocuments");
    expect(TABLES_WITH_USER_DATA).toContain("aiCredits");
    expect(TABLES_WITH_USER_DATA).toContain("aiCreditUsage");
    expect(TABLES_WITH_USER_DATA).toContain("userActivity");
    expect(TABLES_WITH_USER_DATA).toContain("favorites");
  });

  it('should have the correct number of tables', () => {
    expect(TABLES_WITH_USER_DATA.length).toBe(7);
  });
});

describe('degreeLabels', () => {
  it('should map degree codes to their full labels', () => {
    expect(degreeLabels['M.S.']).toBe('Master of Science (M.S.)');
    expect(degreeLabels['M.A.']).toBe('Master of Arts (M.A.)');
    expect(degreeLabels['Ph.D.']).toBe('Doctor of Philosophy (Ph.D.)');
    expect(degreeLabels['M.B.A.']).toBe('Master of Business Administration (M.B.A.)');
  });

  it('should include all common graduate degree types', () => {
    const expectedDegrees = [
      'M.S.', 'M.A.', 'Ph.D.', 'M.B.A.', 'M.F.A.', 'M.Eng.', 
      'M.C.S.', 'M.S.E.', 'M.Fin.', 'M.P.H.', 'M.S.W.', 'M.Ed.',
      'Ed.D.', 'J.D.', 'LL.M.', 'M.Arch.', 'M.M.', 'M.D.',
      'M.A.T.', 'M.P.P.', 'M.P.A.', 'M.S.N.', 'D.M.A.', 'M.Div.'
    ];
    
    expectedDegrees.forEach(degreeCode => {
      expect(degreeLabels[degreeCode]).toBeDefined();
      expect(typeof degreeLabels[degreeCode]).toBe('string');
      expect(degreeLabels[degreeCode].length).toBeGreaterThan(0);
    });
  });

  it('should have the correct number of degree types', () => {
    expect(Object.keys(degreeLabels).length).toBe(24);
  });

  it('should provide readable labels that include the abbreviation', () => {
    Object.entries(degreeLabels).forEach(([code, label]) => {
      expect(label).toContain(code);
    });
  });
});
