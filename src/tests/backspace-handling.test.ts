/**
 * Tests for backspace handling
 * 
 * Bug: When user types a wrong character and hits backspace,
 * it removes both the wrong character AND the previous valid character.
 * 
 * Expected: Backspace should only remove the wrong character (error),
 * keeping all previously valid input intact.
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Backspace Handling', () => {
  // Simulate the drill state
  let userInput: string;
  let hasError: boolean;
  let errorChar: string;
  let inputElementValue: string;
  let preventDefaultCalled: boolean;
  
  const expectedWord = 'hören';
  
  function validateInput(newValue: string) {
    const expectedPrefix = expectedWord.substring(0, newValue.length);
    
    if (newValue === expectedPrefix) {
      hasError = false;
      errorChar = '';
      userInput = newValue;
      inputElementValue = newValue;
    } else {
      // Find error
      let errorIndex = 0;
      for (let i = 0; i < newValue.length; i++) {
        if (newValue[i] !== expectedWord[i]) {
          errorIndex = i;
          break;
        }
      }
      
      hasError = true;
      errorChar = newValue[errorIndex] || '';
      
      // Reset to valid part
      const validPart = expectedWord.substring(0, errorIndex);
      userInput = validPart;
      inputElementValue = validPart;
    }
  }
  
  function handleKeyDown(key: string): boolean {
    preventDefaultCalled = false;
    
    if (key === 'Backspace' && hasError) {
      // When there's an error, backspace should:
      // 1. Clear the error state
      // 2. Prevent default (so browser doesn't also remove a character)
      // 3. Keep userInput as is (it's already the valid part)
      preventDefaultCalled = true; // e.preventDefault()
      hasError = false;
      errorChar = '';
      return true; // Indicates we handled it
    }
    
    return false; // Let browser handle normally
  }
  
  function simulateBrowserBackspace() {
    // This simulates what the browser does when backspace is pressed
    // (only if we didn't prevent default)
    if (!preventDefaultCalled && inputElementValue.length > 0) {
      inputElementValue = inputElementValue.slice(0, -1);
      validateInput(inputElementValue);
    }
  }
  
  beforeEach(() => {
    userInput = '';
    hasError = false;
    errorChar = '';
    inputElementValue = '';
    preventDefaultCalled = false;
  });
  
  it('should keep valid input when backspacing an error', () => {
    // Type "hö" correctly
    validateInput('h');
    validateInput('hö');
    expect(userInput).toBe('hö');
    expect(hasError).toBe(false);
    
    // Type wrong character "x"
    validateInput('höx');
    expect(hasError).toBe(true);
    expect(errorChar).toBe('x');
    expect(userInput).toBe('hö'); // Valid part preserved
    expect(inputElementValue).toBe('hö');
    
    // Press backspace
    handleKeyDown('Backspace');
    simulateBrowserBackspace();
    
    // Error should be cleared
    expect(hasError).toBe(false);
    expect(errorChar).toBe('');
    
    // KEY TEST: userInput should still be "hö", not "h"
    expect(userInput).toBe('hö');
    expect(inputElementValue).toBe('hö');
    expect(preventDefaultCalled).toBe(true);
  });
  
  it('should allow normal backspace when no error', () => {
    validateInput('hör');
    expect(userInput).toBe('hör');
    expect(hasError).toBe(false);
    
    // Normal backspace (no error)
    handleKeyDown('Backspace');
    simulateBrowserBackspace();
    
    // Should have removed one character
    expect(userInput).toBe('hö');
    expect(preventDefaultCalled).toBe(false);
  });
  
  it('should handle multiple errors and backspaces', () => {
    validateInput('hö');
    
    // First error
    validateInput('höx');
    expect(hasError).toBe(true);
    expect(userInput).toBe('hö');
    
    // Backspace clears error
    handleKeyDown('Backspace');
    simulateBrowserBackspace();
    expect(hasError).toBe(false);
    expect(userInput).toBe('hö');
    
    // Type another wrong character
    validateInput('höy');
    expect(hasError).toBe(true);
    expect(userInput).toBe('hö');
    
    // Backspace again
    handleKeyDown('Backspace');
    simulateBrowserBackspace();
    expect(hasError).toBe(false);
    expect(userInput).toBe('hö');
  });
  
  it('should handle error at the start of input', () => {
    // Type wrong first character
    validateInput('x');
    expect(hasError).toBe(true);
    expect(errorChar).toBe('x');
    expect(userInput).toBe(''); // Nothing valid yet
    
    // Backspace
    handleKeyDown('Backspace');
    simulateBrowserBackspace();
    
    expect(hasError).toBe(false);
    expect(userInput).toBe('');
    expect(preventDefaultCalled).toBe(true);
  });
});

