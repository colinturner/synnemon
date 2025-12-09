/**
 * Tests for composition input (dead keys / umlaut input)
 * 
 * On Mac with US keyboard, typing umlauts works like this:
 * 1. Press Option+U - starts composition, may insert combining diaeresis (¨)
 * 2. Press a vowel (a, o, u, etc.) - completes composition, produces umlaut (ä, ö, ü)
 * 
 * The browser fires these events:
 * - compositionstart
 * - input (during composition, value may include dead key char)
 * - compositionupdate (optional)
 * - input (final value with composed character)
 * - compositionend
 * 
 * BUG: Some browsers replace more than just the dead key char, losing the prefix.
 * FIX: Track the "known good" prefix before composition and restore it if lost.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Simulate the FIXED logic from DrillInput
class CompositionHandler {
  userInput = '';
  isComposing = false;
  hasError = false;
  errorChar = '';
  inputElementValue = '';
  
  // NEW: Track what was validated BEFORE composition started
  prefixBeforeComposition = '';
  
  constructor(private expectedInput: string) {}
  
  simulateCompositionStart() {
    this.isComposing = true;
    // Remember the validated input before composition
    this.prefixBeforeComposition = this.userInput;
  }
  
  simulateCompositionEnd(compositionData: string, inputValue: string) {
    this.isComposing = false;
    this.inputElementValue = inputValue;
    
    // KEY FIX: If the input value appears to have lost the prefix (browser bug),
    // restore the prefix before validating
    let valueToValidate = inputValue;
    
    // Check if the input value is suspiciously short (likely lost the prefix)
    // The composed character should be at position prefixBeforeComposition.length
    if (this.prefixBeforeComposition.length > 0 && 
        !inputValue.startsWith(this.prefixBeforeComposition)) {
      // Browser dropped the prefix - restore it
      valueToValidate = this.prefixBeforeComposition + compositionData;
      this.inputElementValue = valueToValidate;
    }
    
    this.validateInput(valueToValidate);
  }
  
  simulateInput(newValue: string) {
    this.inputElementValue = newValue;
    
    if (this.isComposing) {
      // During composition, just track the value without validating
      this.userInput = newValue;
      return;
    }
    
    this.validateInput(newValue);
  }
  
  validateInput(newValue: string) {
    const expectedPrefix = this.expectedInput.substring(0, newValue.length);
    
    if (newValue === expectedPrefix) {
      this.hasError = false;
      this.errorChar = '';
      this.userInput = newValue;
    } else {
      // Find error position
      let errorIndex = 0;
      for (let i = 0; i < newValue.length; i++) {
        if (newValue[i] !== this.expectedInput[i]) {
          errorIndex = i;
          break;
        }
      }
      
      this.hasError = true;
      this.errorChar = newValue[errorIndex] || '';
      
      // Reset to last valid state
      const validPart = this.expectedInput.substring(0, errorIndex);
      this.userInput = validPart;
      this.inputElementValue = validPart;
    }
  }
}

describe('Composition Input Logic', () => {
  let handler: CompositionHandler;
  
  beforeEach(() => {
    handler = new CompositionHandler('hören');
  });
  
  it('should handle normal character input', () => {
    handler.simulateInput('h');
    expect(handler.userInput).toBe('h');
    expect(handler.hasError).toBe(false);
    
    handler.simulateInput('hö');
    expect(handler.userInput).toBe('hö');
    expect(handler.hasError).toBe(false);
  });
  
  it('should reject incorrect characters', () => {
    handler.simulateInput('h');
    expect(handler.userInput).toBe('h');
    
    handler.simulateInput('ha'); // Wrong - should be 'hö'
    expect(handler.hasError).toBe(true);
    expect(handler.errorChar).toBe('a');
    expect(handler.userInput).toBe('h'); // Reset to last valid
  });
  
  it('should handle composition when browser preserves prefix (ideal case)', () => {
    // Step 1: Type 'h' normally
    handler.simulateInput('h');
    expect(handler.userInput).toBe('h');
    
    // Step 2: Start composition (Option+U pressed)
    handler.simulateCompositionStart();
    expect(handler.isComposing).toBe(true);
    expect(handler.prefixBeforeComposition).toBe('h');
    
    // Step 3: Input event during composition
    handler.simulateInput('h¨');
    expect(handler.userInput).toBe('h¨');
    
    // Step 4: Composition ends with correct full value
    handler.simulateCompositionEnd('ö', 'hö');
    
    expect(handler.isComposing).toBe(false);
    expect(handler.userInput).toBe('hö');
    expect(handler.hasError).toBe(false);
  });
  
  it('should handle composition when browser drops prefix (THE BUG)', () => {
    // Step 1: Type 'h' normally
    handler.simulateInput('h');
    expect(handler.userInput).toBe('h');
    
    // Step 2: Start composition
    handler.simulateCompositionStart();
    expect(handler.prefixBeforeComposition).toBe('h');
    
    // Step 3: Input during composition
    handler.simulateInput('h¨');
    
    // Step 4: BUG - browser returns just 'ö', dropping 'h'!
    // Our fix should restore the prefix
    handler.simulateCompositionEnd('ö', 'ö');
    
    expect(handler.userInput).toBe('hö'); // Should have restored 'h'
    expect(handler.hasError).toBe(false);
    expect(handler.inputElementValue).toBe('hö');
  });
  
  it('should handle typing "Väter" with umlaut at position 2', () => {
    const vaterHandler = new CompositionHandler('Väter');
    
    // Type 'V'
    vaterHandler.simulateInput('V');
    expect(vaterHandler.userInput).toBe('V');
    
    // Start composition for ä
    vaterHandler.simulateCompositionStart();
    expect(vaterHandler.prefixBeforeComposition).toBe('V');
    
    // During composition
    vaterHandler.simulateInput('V¨');
    
    // Composition ends - browser might drop 'V'
    vaterHandler.simulateCompositionEnd('ä', 'ä');
    
    expect(vaterHandler.userInput).toBe('Vä');
    expect(vaterHandler.hasError).toBe(false);
    
    // Continue typing
    vaterHandler.simulateInput('Vät');
    expect(vaterHandler.userInput).toBe('Vät');
    
    vaterHandler.simulateInput('Väte');
    expect(vaterHandler.userInput).toBe('Väte');
    
    vaterHandler.simulateInput('Väter');
    expect(vaterHandler.userInput).toBe('Väter');
  });
  
  it('should handle "du schläfst" with umlaut in the middle', () => {
    const schlafenHandler = new CompositionHandler('du schläfst');
    
    // Type "du schl"
    schlafenHandler.simulateInput('d');
    schlafenHandler.simulateInput('du');
    schlafenHandler.simulateInput('du ');
    schlafenHandler.simulateInput('du s');
    schlafenHandler.simulateInput('du sc');
    schlafenHandler.simulateInput('du sch');
    schlafenHandler.simulateInput('du schl');
    expect(schlafenHandler.userInput).toBe('du schl');
    
    // Start composition for ä
    schlafenHandler.simulateCompositionStart();
    expect(schlafenHandler.prefixBeforeComposition).toBe('du schl');
    
    // During composition
    schlafenHandler.simulateInput('du schl¨');
    
    // Bug case: browser returns just 'ä'
    schlafenHandler.simulateCompositionEnd('ä', 'ä');
    
    expect(schlafenHandler.userInput).toBe('du schlä');
    expect(schlafenHandler.hasError).toBe(false);
    
    // Continue
    schlafenHandler.simulateInput('du schläf');
    schlafenHandler.simulateInput('du schläfs');
    schlafenHandler.simulateInput('du schläfst');
    expect(schlafenHandler.userInput).toBe('du schläfst');
  });
  
  it('should reject wrong composed character', () => {
    handler.simulateInput('h');
    handler.simulateCompositionStart();
    handler.simulateInput('h¨');
    
    // User typed wrong vowel - 'ü' instead of 'ö'
    handler.simulateCompositionEnd('ü', 'ü');
    
    // Even with prefix restoration, 'hü' is wrong
    expect(handler.hasError).toBe(true);
    expect(handler.userInput).toBe('h'); // Reset to before the wrong char
  });
});
