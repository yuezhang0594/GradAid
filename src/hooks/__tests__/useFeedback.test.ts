import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';

// Mock dependencies
vi.mock('convex/react', () => ({
  useMutation: vi.fn()
}));

vi.mock('react-router', () => ({
  useNavigate: vi.fn()
}));

vi.mock('#/_generated/api', () => ({
  api: {
    feedback: {
      submitFeedback: 'feedback.submitFeedback'
    }
  }
}));

// Mock the validators module
vi.mock('#/validators', () => ({
  FEEDBACK_MAX_CHARS: 500
}));

// Import after mocking
import { useFeedback, FeedbackData } from '../useFeedback';
import { useMutation } from 'convex/react';
import { useNavigate } from 'react-router';

// Define a type for the mocked function
type MockedFunction = ReturnType<typeof vi.fn>;

describe('useFeedback Hook', () => {
  // Mock data
  const validFeedbackData: FeedbackData = {
    positive: 'Great app!',
    negative: 'Could use more features',
    rating: 4,
    device: 'desktop'
  };
  
  const invalidFeedbackData: FeedbackData = {
    positive: 'Great app!',
    negative: 'Could use more features',
    rating: 6, // Invalid: rating must be between 1-5
    device: 'desktop'
  };
  
  // Mock functions
  const mockSubmitFeedback = vi.fn();
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useMutation
    (useMutation as MockedFunction).mockReturnValue(mockSubmitFeedback);
    
    // Mock useNavigate
    (useNavigate as MockedFunction).mockReturnValue(mockNavigate);
    
    // Set up successful mutation by default
    mockSubmitFeedback.mockResolvedValue('feedback-id-123');
  });
  
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFeedback());
    
    // Check initial state
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.validationError).toBeNull();
    expect(typeof result.current.submitFeedback).toBe('function');
  });
  
  it('should successfully submit valid feedback', async () => {
    const { result } = renderHook(() => useFeedback());
    
    // Submit valid feedback
    let feedbackId: string | undefined;
    
    await act(async () => {
      feedbackId = await result.current.submitFeedback(validFeedbackData);
    });
    
    // Check if mutation was called with correct data
    expect(mockSubmitFeedback).toHaveBeenCalledWith({
      positive: 'Great app!',
      negative: 'Could use more features',
      rating: 4,
      device: 'desktop'
    });
    
    // Check if feedback ID was returned
    expect(feedbackId).toBe('feedback-id-123');
    
    // Check if navigate was called to go back
    expect(mockNavigate).toHaveBeenCalledWith(-1);
    
    // Check final state
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.validationError).toBeNull();
  });
  
  it('should handle empty strings in feedback', async () => {
    const { result } = renderHook(() => useFeedback());
    
    // Submit feedback with empty strings
    const emptyFeedback: FeedbackData = {
      positive: '   ', // Just whitespace
      negative: '',
      rating: 3,
      device: 'mobile'
    };
    
    await act(async () => {
      await result.current.submitFeedback(emptyFeedback);
    });
    
    // Check if mutation was called with undefined for empty strings
    expect(mockSubmitFeedback).toHaveBeenCalledWith({
      positive: undefined,
      negative: undefined,
      rating: 3,
      device: 'mobile'
    });
  });
  
  it('should handle validation errors', async () => {
    const { result } = renderHook(() => useFeedback());
    
    // Mock Zod error
    const mockZodError = new z.ZodError([
      {
        code: 'too_big',
        maximum: 5,
        type: 'number',
        inclusive: true,
        message: 'Rating must be between 1 and 5',
        path: ['rating']
      }
    ]);
    
    // Mock parse to throw error
    vi.spyOn(z.ZodObject.prototype, 'parse').mockImplementation(() => {
      throw mockZodError;
    });
    
    // Try to submit invalid feedback
    await act(async () => {
      try {
        await result.current.submitFeedback(invalidFeedbackData);
      } catch (error) {
        // Expected error
      }
    });
    
    // Check if validation error was set
    expect(result.current.validationError).toBe('Number must be less than or equal to 5');
    
    // Check if mutation was not called
    expect(mockSubmitFeedback).not.toHaveBeenCalled();
    
    // Check final state
    expect(result.current.isSubmitting).toBe(false);
  });
  
  it('should handle submission errors', async () => {
    const { result } = renderHook(() => useFeedback());
    
    // Mock mutation error
    mockSubmitFeedback.mockRejectedValue(new Error('Network error'));
    
    // Try to submit feedback
    await act(async () => {
      try {
        await result.current.submitFeedback(validFeedbackData);
      } catch (error) {
        // Expected error
      }
    });
    
    // Check if error was handled
    expect(result.current.validationError).toBe('Network error');
    
    // Check final state
    expect(result.current.isSubmitting).toBe(false);
    
    // Should still navigate back
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
