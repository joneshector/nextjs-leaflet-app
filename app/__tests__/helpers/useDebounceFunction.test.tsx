// app/__tests__/helpers/useDebounceFunction.test.tsx
import { renderHook, act } from '@testing-library/react';
import useDebounceFunction from '../../helpers/useDebounceFunction';

// Mock timers
jest.useFakeTimers();

describe('useDebounceFunction', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should debounce function calls', () => {
    const mockFunction = jest.fn();
    const delay = 100;

    const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
    const debouncedFunction = result.current;

    // Call the debounced function multiple times
    act(() => {
      debouncedFunction('arg1');
      debouncedFunction('arg2');
      debouncedFunction('arg3');
    });

    // Function should not be called immediately
    expect(mockFunction).not.toHaveBeenCalled();

    // Fast-forward time by less than delay
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Function should still not be called
    expect(mockFunction).not.toHaveBeenCalled();

    // Fast-forward time to complete the delay
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Function should be called once with the last arguments
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith('arg3');
  });

  it('should reset timer on subsequent calls', () => {
    const mockFunction = jest.fn();
    const delay = 100;

    const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
    const debouncedFunction = result.current;

    // First call
    act(() => {
      debouncedFunction('first');
    });

    // Advance time partially
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Second call should reset the timer
    act(() => {
      debouncedFunction('second');
    });

    // Advance time by original delay amount
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Only the second call should execute
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction).toHaveBeenCalledWith('second');
  });

  it('should handle multiple arguments correctly', () => {
    const mockFunction = jest.fn();
    const delay = 100;

    const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
    const debouncedFunction = result.current;

    act(() => {
      debouncedFunction('arg1', 'arg2', 'arg3');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should handle different delay values', () => {
    const mockFunction = jest.fn();
    const delay = 200;

    const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
    const debouncedFunction = result.current;

    act(() => {
      debouncedFunction('test');
    });

    // Should not execute before delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockFunction).not.toHaveBeenCalled();

    // Should execute after full delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('should cleanup timeout on unmount', () => {
    const mockFunction = jest.fn();
    const delay = 100;

    const { result, unmount } = renderHook(() => useDebounceFunction(mockFunction, delay));
    const debouncedFunction = result.current;

    act(() => {
      debouncedFunction('test');
    });

    // Unmount before delay completes
    unmount();

    // Advance time past delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Function should not be called after unmount
    expect(mockFunction).not.toHaveBeenCalled();
  });

  it('should update when function or delay changes', () => {
    const mockFunction1 = jest.fn();
    const mockFunction2 = jest.fn();
    let delay = 100;
    let func = mockFunction1;

    const { result, rerender } = renderHook(() => useDebounceFunction(func, delay));

    // Call with first function
    act(() => {
      result.current('test1');
    });

    // Change function and delay
    func = mockFunction2;
    delay = 200;
    rerender();

    // Call with new function
    act(() => {
      result.current('test2');
    });

    // Advance by original delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // First function should not be called
    expect(mockFunction1).not.toHaveBeenCalled();

    // Advance by new delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Second function should be called
    expect(mockFunction2).toHaveBeenCalledWith('test2');
  });

  it('should clear previous timeout when function is called again', () => {
    const mockFunction = jest.fn();
    const delay = 100;
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
    const debouncedFunction = result.current;

    // First call
    act(() => {
      debouncedFunction('first');
    });

    // Second call should clear the previous timeout
    act(() => {
      debouncedFunction('second');
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });
});