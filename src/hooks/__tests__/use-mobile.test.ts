import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile Hook', () => {
  // Mock window.matchMedia
  const mockMatchMedia = vi.fn();
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();
  
  // Save original window properties
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = window.innerWidth;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock matchMedia implementation
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener
    });
    
    // Apply mocks to window
    window.matchMedia = mockMatchMedia;
  });
  
  afterEach(() => {
    // Restore original window properties
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth
    });
  });
  
  it('should return false for desktop viewport', () => {
    // Set desktop viewport width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    // Should return false for desktop
    expect(result.current).toBe(false);
    
    // Should have set up event listener
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
  
  it('should return true for mobile viewport', () => {
    // Set mobile viewport width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    // Should return true for mobile
    expect(result.current).toBe(true);
  });
  
  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile());
    
    // Unmount the component
    unmount();
    
    // Should have removed the event listener
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
