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

  describe('Edge Cases', () => {
    it('should handle zero delay', () => {
      const mockFunction = jest.fn();
      const delay = 0;

      const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
      const debouncedFunction = result.current;

      act(() => {
        debouncedFunction('test');
      });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(mockFunction).toHaveBeenCalledWith('test');
    });

    it('should handle negative delay', () => {
      const mockFunction = jest.fn();
      const delay = -100;

      const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
      const debouncedFunction = result.current;

      act(() => {
        debouncedFunction('test');
      });

      // Even with negative delay, setTimeout should still work
      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(mockFunction).toHaveBeenCalledWith('test');
    });



    it('should handle null/undefined function', () => {
      const delay = 100;

      // The hook doesn't validate the function parameter, so it won't throw
      const { result } = renderHook(() => useDebounceFunction(null as any, delay));
      
      expect(result.current).toBeDefined();
    });

    it('should handle function that throws an error', () => {
      const errorFunction = jest.fn(() => {
        throw new Error('Function error');
      });
      const delay = 100;

      const { result } = renderHook(() => useDebounceFunction(errorFunction, delay));
      const debouncedFunction = result.current;

      act(() => {
        debouncedFunction('test');
      });

      expect(() => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }).toThrow('Function error');

      expect(errorFunction).toHaveBeenCalledWith('test');
    });

    it('should handle rapid successive calls with different arguments', () => {
      const mockFunction = jest.fn();
      const delay = 100;

      const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
      const debouncedFunction = result.current;

      // Rapid calls with different arguments
      act(() => {
        for (let i = 0; i < 10; i++) {
          debouncedFunction(`arg${i}`);
        }
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Only the last call should execute
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('arg9');
    });

    it('should handle calls with no arguments', () => {
      const mockFunction = jest.fn();
      const delay = 100;

      const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
      const debouncedFunction = result.current;

      act(() => {
        debouncedFunction();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockFunction).toHaveBeenCalledWith();
    });

    it('should handle calls with complex object arguments', () => {
      const mockFunction = jest.fn();
      const delay = 100;

      const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
      const debouncedFunction = result.current;

      const complexArg = {
        nested: { value: 'test' },
        array: [1, 2, 3],
        func: () => 'nested function'
      };

      act(() => {
        debouncedFunction(complexArg, 'string', 123, true);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockFunction).toHaveBeenCalledWith(complexArg, 'string', 123, true);
    });

    it('should handle when setTimeout is not available', () => {
      const originalSetTimeout = global.setTimeout;
      const originalClearTimeout = global.clearTimeout;

      // Mock setTimeout to throw an error
      global.setTimeout = jest.fn(() => {
        throw new Error('setTimeout error');
      });

      const mockFunction = jest.fn();
      const delay = 100;

      expect(() => {
        const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
        const debouncedFunction = result.current;
        
        act(() => {
          debouncedFunction('test');
        });
      }).toThrow('setTimeout error');

      // Restore original functions
      global.setTimeout = originalSetTimeout;
      global.clearTimeout = originalClearTimeout;
    });

    it('should handle multiple instances with different delays', () => {
      const mockFunction1 = jest.fn();
      const mockFunction2 = jest.fn();
      const delay1 = 50;
      const delay2 = 150;

      const { result: result1 } = renderHook(() => useDebounceFunction(mockFunction1, delay1));
      const { result: result2 } = renderHook(() => useDebounceFunction(mockFunction2, delay2));

      const debouncedFunction1 = result1.current;
      const debouncedFunction2 = result2.current;

      act(() => {
        debouncedFunction1('test1');
        debouncedFunction2('test2');
      });

      // Advance by delay1
      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(mockFunction1).toHaveBeenCalledWith('test1');
      expect(mockFunction2).not.toHaveBeenCalled();

      // Advance by remaining delay2
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockFunction2).toHaveBeenCalledWith('test2');
    });

    it('should handle dependency changes during pending execution', () => {
      let delay = 100;
      let func = jest.fn();

      const { result, rerender } = renderHook(() => useDebounceFunction(func, delay));

      act(() => {
        result.current('test1');
      });

      // Change dependencies mid-execution
      delay = 200;
      func = jest.fn();
      rerender();

      act(() => {
        result.current('test2');
      });

      // Advance by original delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Original function should not be called since dependencies changed
      expect(func).not.toHaveBeenCalledWith('test1');

      // Advance by new delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(func).toHaveBeenCalledWith('test2');
    });

    it('should handle memory cleanup on unmount with pending timeout', () => {
      const mockFunction = jest.fn();
      const delay = 100;
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { result, unmount } = renderHook(() => useDebounceFunction(mockFunction, delay));
      const debouncedFunction = result.current;

      act(() => {
        debouncedFunction('test');
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      // Advance time to ensure function doesn't execute after unmount
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockFunction).not.toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('should handle extremely rapid unmount/remount cycles', () => {
      const mockFunction = jest.fn();
      const delay = 100;

      // Multiple rapid mount/unmount cycles
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => useDebounceFunction(mockFunction, delay));
        
        act(() => {
          result.current(`test${i}`);
        });
        
        unmount();
      }

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // No functions should execute after unmount
      expect(mockFunction).not.toHaveBeenCalled();
    });

    it('should maintain reference equality when dependencies do not change', () => {
      const mockFunction = jest.fn();
      const delay = 100;

      const { result, rerender } = renderHook(() => useDebounceFunction(mockFunction, delay));
      
      const firstReference = result.current;
      
      // Rerender with same dependencies
      rerender();
      
      const secondReference = result.current;
      
      expect(firstReference).toBe(secondReference);
    });

    it('should handle NaN delay value', () => {
      const mockFunction = jest.fn();
      const delay = NaN;

      const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
      const debouncedFunction = result.current;

      act(() => {
        debouncedFunction('test');
      });

      // NaN delay might cause immediate execution or no execution
      act(() => {
        jest.advanceTimersByTime(0);
      });

      // The behavior depends on how setTimeout handles NaN
      expect(mockFunction).toHaveBeenCalledWith('test');
    });

    it('should handle Infinity delay value', () => {
      const mockFunction = jest.fn();
      const delay = Infinity;

      const { result } = renderHook(() => useDebounceFunction(mockFunction, delay));
      const debouncedFunction = result.current;

      act(() => {
        debouncedFunction('test');
      });

      // JavaScript setTimeout with Infinity might execute immediately
      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(mockFunction).toHaveBeenCalledWith('test');
    });
  });
});