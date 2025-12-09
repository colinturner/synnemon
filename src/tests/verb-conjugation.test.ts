/**
 * Tests for verb conjugation drill flow
 * 
 * UX Design:
 * 1. User sees verb infinitive (e.g., "hören")
 * 2. User types the infinitive
 * 3. After completing, show infinitive with visual separator
 * 4. Show "du " as a non-editable prefix (context, not drilled)
 * 5. User types ONLY the conjugated form (e.g., "hörst"), not "du hörst"
 * 
 * This is cleaner UX - we're drilling conjugation knowledge, not "can you type du"
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Verb Conjugation Flow', () => {
  // Simulate the drill state
  let phase: 'infinitive' | 'conjugation' | 'translation' | 'complete';
  let userInput: string;
  let completedSegments: Array<{ text: string; colorClass?: string }>;
  let hasError: boolean;
  let errorChar: string;
  
  // The verb being drilled
  const verb = {
    infinitive: 'hören',
    conjugation: 'hörst' // Just the conjugated form, not "du hörst"
  };
  
  function getExpectedInput(): string {
    switch (phase) {
      case 'infinitive': return verb.infinitive;
      case 'conjugation': return verb.conjugation; // NOT "du hörst"
      default: return '';
    }
  }
  
  function validateInput(newValue: string) {
    const expected = getExpectedInput();
    const expectedPrefix = expected.substring(0, newValue.length);
    
    if (newValue === expectedPrefix) {
      hasError = false;
      errorChar = '';
      userInput = newValue;
      
      // Check if complete
      if (userInput === expected) {
        completeCurrentPhase();
      }
    } else {
      // Find error
      let errorIndex = 0;
      for (let i = 0; i < newValue.length; i++) {
        if (newValue[i] !== expected[i]) {
          errorIndex = i;
          break;
        }
      }
      
      hasError = true;
      errorChar = newValue[errorIndex] || '';
      
      // Reset to valid part
      userInput = expected.substring(0, errorIndex);
    }
  }
  
  function completeCurrentPhase() {
    if (phase === 'infinitive') {
      // Add infinitive to completed segments
      completedSegments.push({ text: userInput });
      userInput = '';
      phase = 'conjugation';
    } else if (phase === 'conjugation') {
      // Add separator and "du " prefix and conjugation
      completedSegments.push({ text: ', du ' }); // Separator includes "du "
      completedSegments.push({ text: userInput });
      userInput = '';
      phase = 'translation';
    }
  }
  
  function simulateBackspace() {
    if (hasError) {
      // Clear error state, keep userInput as is
      hasError = false;
      errorChar = '';
    } else if (userInput.length > 0) {
      userInput = userInput.slice(0, -1);
    }
  }
  
  beforeEach(() => {
    phase = 'infinitive';
    userInput = '';
    completedSegments = [];
    hasError = false;
    errorChar = '';
  });
  
  describe('Infinitive phase', () => {
    it('should accept correct characters', () => {
      validateInput('h');
      expect(userInput).toBe('h');
      expect(hasError).toBe(false);
      
      validateInput('hö');
      expect(userInput).toBe('hö');
      
      validateInput('hör');
      expect(userInput).toBe('hör');
      
      validateInput('höre');
      expect(userInput).toBe('höre');
      
      // After typing complete word, phase advances and userInput resets
      // So we check the state BEFORE the final character
    });
    
    it('should complete infinitive and advance to conjugation', () => {
      validateInput('hören');
      
      expect(phase).toBe('conjugation');
      expect(userInput).toBe('');
      expect(completedSegments).toHaveLength(1);
      expect(completedSegments[0].text).toBe('hören');
    });
  });
  
  describe('Conjugation phase', () => {
    beforeEach(() => {
      // Complete infinitive phase first
      validateInput('hören');
    });
    
    it('should accept correct conjugation characters (without "du ")', () => {
      expect(phase).toBe('conjugation');
      
      validateInput('h');
      expect(userInput).toBe('h');
      expect(hasError).toBe(false);
      
      validateInput('hö');
      expect(userInput).toBe('hö');
    });
    
    it('should reject "du " prefix since user should not type it', () => {
      // The expected input is "hörst", not "du hörst"
      // So typing "d" should be an error
      validateInput('d');
      expect(hasError).toBe(true);
      expect(errorChar).toBe('d');
      expect(userInput).toBe(''); // Reset to empty (nothing valid typed)
    });
    
    it('should complete conjugation phase', () => {
      validateInput('hörst');
      
      expect(phase).toBe('translation');
      expect(completedSegments).toHaveLength(3);
      expect(completedSegments[0].text).toBe('hören');
      expect(completedSegments[1].text).toBe(', du '); // Separator with "du " prefix
      expect(completedSegments[2].text).toBe('hörst');
    });
  });
  
  describe('Backspace handling', () => {
    it('should clear error state on backspace', () => {
      validateInput('hören'); // Complete infinitive
      
      // Now in conjugation phase, type wrong character
      validateInput('x');
      expect(hasError).toBe(true);
      expect(errorChar).toBe('x');
      expect(userInput).toBe('');
      
      // Backspace should clear error
      simulateBackspace();
      expect(hasError).toBe(false);
      expect(errorChar).toBe('');
    });
    
    it('should remove last character when no error', () => {
      validateInput('hör');
      expect(userInput).toBe('hör');
      
      simulateBackspace();
      expect(userInput).toBe('hö');
      
      simulateBackspace();
      expect(userInput).toBe('h');
    });
    
    it('should NOT remove extra characters after clearing error', () => {
      // This tests the bug: typing "duh" then backspace
      // should not remove both "u" and "h"
      
      validateInput('hören'); // Complete infinitive
      
      // Type "hö" correctly
      validateInput('h');
      validateInput('hö');
      expect(userInput).toBe('hö');
      
      // Type wrong character
      validateInput('höx');
      expect(hasError).toBe(true);
      expect(userInput).toBe('hö'); // Valid prefix preserved
      
      // Backspace clears error
      simulateBackspace();
      expect(hasError).toBe(false);
      expect(userInput).toBe('hö'); // Should still be "hö", not "h"
    });
  });
  
  describe('Full verb flow display', () => {
    it('should produce correct visual output: "hören, du hörst"', () => {
      validateInput('hören');
      validateInput('hörst');
      
      // Reconstruct what should be displayed
      const display = completedSegments.map(s => s.text).join('');
      expect(display).toBe('hören, du hörst');
    });
  });
});

describe('Edge cases with umlauts in conjugation', () => {
  it('should handle "schlafen → schläfst" correctly', () => {
    const verb = { infinitive: 'schlafen', conjugation: 'schläfst' };
    let userInput = '';
    let phase: 'infinitive' | 'conjugation' = 'infinitive';
    let completedSegments: Array<{ text: string }> = [];
    
    function getExpected() {
      return phase === 'infinitive' ? verb.infinitive : verb.conjugation;
    }
    
    function validate(value: string) {
      const expected = getExpected();
      if (value === expected.substring(0, value.length)) {
        userInput = value;
        if (userInput === expected) {
          if (phase === 'infinitive') {
            completedSegments.push({ text: userInput });
            userInput = '';
            phase = 'conjugation';
          } else {
            completedSegments.push({ text: ', du ' });
            completedSegments.push({ text: userInput });
          }
        }
        return true;
      }
      return false;
    }
    
    // Type infinitive
    expect(validate('schlafen')).toBe(true);
    expect(phase).toBe('conjugation');
    
    // Type conjugation (with umlaut change: a → ä)
    expect(validate('s')).toBe(true);
    expect(validate('sc')).toBe(true);
    expect(validate('sch')).toBe(true);
    expect(validate('schl')).toBe(true);
    expect(validate('schlä')).toBe(true); // Umlaut!
    expect(validate('schläf')).toBe(true);
    expect(validate('schläfs')).toBe(true);
    expect(validate('schläfst')).toBe(true);
    
    const display = completedSegments.map(s => s.text).join('');
    expect(display).toBe('schlafen, du schläfst');
  });
});

