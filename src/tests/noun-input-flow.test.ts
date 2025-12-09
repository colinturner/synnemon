/**
 * Tests for natural noun input flow
 * 
 * Users should be able to type "die Mutter" naturally (article + space + noun)
 * with the cursor blinking the whole time. Only after typing the full noun
 * should the app auto-fill ", " for the plural form.
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Natural Noun Input Flow', () => {
  // Simulate the drill state for a noun
  type DrillPhase = 'article' | 'singular' | 'plural' | 'translation' | 'complete';
  
  let phase: DrillPhase;
  let userInput: string;
  let hasError: boolean;
  let errorChar: string;
  let completedSegments: Array<{ text: string; colorClass?: string }>;
  let inputElementValue: string;
  
  // Simulated noun data
  const noun = {
    german: 'Mutter',
    gender: 'feminine',
    plural: 'Mütter'
  };
  
  function getArticle(gender: string): string {
    switch (gender) {
      case 'masculine': return 'der';
      case 'feminine': return 'die';
      case 'neuter': return 'das';
      default: return '';
    }
  }
  
  function getGenderColorClass(gender: string): string {
    switch (gender) {
      case 'masculine': return 'text-masculine';
      case 'feminine': return 'text-feminine';
      case 'neuter': return 'text-neuter';
      default: return '';
    }
  }
  
  function getExpectedInput(): string {
    switch (phase) {
      case 'article': return getArticle(noun.gender);
      case 'singular': return noun.german;
      case 'plural': return noun.plural;
      default: return '';
    }
  }
  
  function validateInput(newValue: string) {
    const expectedInput = getExpectedInput();
    const expectedPrefix = expectedInput.substring(0, newValue.length);
    
    if (newValue === expectedPrefix) {
      hasError = false;
      errorChar = '';
      userInput = newValue;
      inputElementValue = newValue;
      
      // Check if segment is complete
      if (userInput === expectedInput) {
        // For article phase, keep cursor blinking - user will type space naturally
        if (phase === 'article') {
          // Don't auto-advance, wait for user to type space
        } else if (phase === 'singular') {
          // Auto-advance to plural - space was already added when transitioning from article
          // Add the noun AND the ", " separator for plural
          completedSegments = [
            ...completedSegments,
            { text: userInput },
            { text: ', ' }
          ];
          userInput = '';
          inputElementValue = '';
          phase = 'plural';
        } else if (phase === 'plural') {
          // Comma was already added when transitioning from singular
          completedSegments = [
            ...completedSegments,
            { text: userInput }
          ];
          userInput = '';
          inputElementValue = '';
          phase = 'translation';
        }
      }
    } else {
      // Find error
      let errorIndex = 0;
      for (let i = 0; i < newValue.length; i++) {
        if (newValue[i] !== expectedInput[i]) {
          errorIndex = i;
          break;
        }
      }
      
      hasError = true;
      errorChar = newValue[errorIndex] || '';
      
      // Reset to valid part
      const validPart = expectedInput.substring(0, errorIndex);
      userInput = validPart;
      inputElementValue = validPart;
    }
  }
  
  function handleInput(newValue: string) {
    const expectedInput = getExpectedInput();
    
    // Special case: user typed space after completing the article - advance to singular
    if (phase === 'article' && userInput === expectedInput && newValue === userInput + ' ') {
      // Add the article AND the space to completed segments
      completedSegments = [
        { text: userInput, colorClass: getGenderColorClass(noun.gender) },
        { text: ' ' }
      ];
      // Clear input and advance to singular phase
      userInput = '';
      inputElementValue = '';
      phase = 'singular';
      return;
    }
    
    validateInput(newValue);
  }
  
  beforeEach(() => {
    phase = 'article';
    userInput = '';
    hasError = false;
    errorChar = '';
    completedSegments = [];
    inputElementValue = '';
  });
  
  describe('Article typing with cursor', () => {
    it('should keep cursor visible while typing article', () => {
      handleInput('d');
      expect(phase).toBe('article');
      expect(userInput).toBe('d');
      expect(hasError).toBe(false);
      
      handleInput('di');
      expect(phase).toBe('article');
      expect(userInput).toBe('di');
      expect(hasError).toBe(false);
      
      handleInput('die');
      expect(phase).toBe('article');
      expect(userInput).toBe('die');
      expect(hasError).toBe(false);
      // Article is complete but cursor should still be visible
      // (userInput is not cleared, no "Press Space" state)
    });
    
    it('should not auto-advance after completing article (cursor stays)', () => {
      handleInput('die');
      
      // Should still be in article phase with the typed text visible
      expect(phase).toBe('article');
      expect(userInput).toBe('die');
      expect(completedSegments).toHaveLength(0);
    });
  });
  
  describe('Natural space to advance', () => {
    it('should advance to singular when user types space after article', () => {
      // Type the article
      handleInput('die');
      expect(phase).toBe('article');
      expect(userInput).toBe('die');
      
      // Type space naturally
      handleInput('die ');
      
      // Should have advanced to singular phase
      expect(phase).toBe('singular');
      expect(userInput).toBe('');
      // completedSegments should have article AND the space
      expect(completedSegments).toHaveLength(2);
      expect(completedSegments[0].text).toBe('die');
      expect(completedSegments[0].colorClass).toBe('text-feminine');
      expect(completedSegments[1].text).toBe(' ');
    });
    
    it('should show error if space typed before article is complete', () => {
      handleInput('di');
      expect(userInput).toBe('di');
      
      // Type space too early
      handleInput('di ');
      
      // Should show error (space doesn't match expected 'e')
      expect(hasError).toBe(true);
      expect(errorChar).toBe(' ');
      expect(userInput).toBe('di'); // Valid part preserved
      expect(phase).toBe('article'); // Still in article phase
    });
  });
  
  describe('Complete noun flow', () => {
    it('should allow typing full "die Mutter" naturally', () => {
      // Type "die"
      handleInput('d');
      handleInput('di');
      handleInput('die');
      expect(phase).toBe('article');
      expect(userInput).toBe('die');
      
      // Type space
      handleInput('die ');
      expect(phase).toBe('singular');
      expect(completedSegments[0].text).toBe('die');
      expect(completedSegments[1].text).toBe(' '); // Space is added immediately
      
      // Type "Mutter"
      handleInput('M');
      expect(phase).toBe('singular');
      expect(userInput).toBe('M');
      
      handleInput('Mu');
      handleInput('Mut');
      handleInput('Mutt');
      handleInput('Mutte');
      handleInput('Mutter');
      
      // After completing noun, should auto-advance to plural with ", " separator
      expect(phase).toBe('plural');
      expect(completedSegments).toHaveLength(4);
      expect(completedSegments[0].text).toBe('die');
      expect(completedSegments[1].text).toBe(' ');
      expect(completedSegments[2].text).toBe('Mutter');
      expect(completedSegments[3].text).toBe(', '); // Comma added when transitioning to plural
    });
    
    it('should auto-fill comma after completing noun', () => {
      // Complete article + space + noun
      handleInput('die');
      handleInput('die ');
      handleInput('M');
      handleInput('Mu');
      handleInput('Mut');
      handleInput('Mutt');
      handleInput('Mutte');
      handleInput('Mutter');
      
      // Now in plural phase - segments are: die, ' ', Mutter, ', '
      expect(phase).toBe('plural');
      expect(completedSegments).toHaveLength(4);
      expect(completedSegments[3].text).toBe(', '); // Comma added when transitioning to plural
      
      // Type plural
      handleInput('M');
      handleInput('Mü');
      handleInput('Müt');
      handleInput('Mütt');
      handleInput('Mütte');
      handleInput('Mütter');
      
      // After completing plural, should advance to translation
      // Segments are: die, ' ', Mutter, ', ', Mütter
      expect(phase).toBe('translation');
      expect(completedSegments).toHaveLength(5);
      expect(completedSegments[4].text).toBe('Mütter');
    });
  });
  
  describe('Visual appearance while typing', () => {
    it('should show proper spacing while typing noun', () => {
      // Type article + space
      handleInput('die');
      handleInput('die ');
      
      // Now typing the noun - display should show "die " + userInput
      handleInput('M');
      handleInput('Mu');
      
      // Verify segments have the space for proper visual display
      expect(completedSegments).toHaveLength(2);
      expect(completedSegments[0].text).toBe('die');
      expect(completedSegments[1].text).toBe(' ');
      expect(userInput).toBe('Mu');
      // Visual: "die " + "Mu|" = "die Mu|"
    });
    
    it('should show comma while typing plural', () => {
      // Complete article + space + noun
      handleInput('die');
      handleInput('die ');
      handleInput('Mutter');
      
      // Now in plural phase, typing the plural
      handleInput('M');
      handleInput('Mü');
      
      // Verify segments have the comma for proper visual display
      expect(completedSegments).toHaveLength(4);
      expect(completedSegments[0].text).toBe('die');
      expect(completedSegments[1].text).toBe(' ');
      expect(completedSegments[2].text).toBe('Mutter');
      expect(completedSegments[3].text).toBe(', ');
      expect(userInput).toBe('Mü');
      // Visual: "die " + "Mutter" + ", " + "Mü|" = "die Mutter, Mü|"
    });
  });
  
  describe('Error handling during natural flow', () => {
    it('should handle errors while typing article', () => {
      handleInput('d');
      handleInput('dx'); // Wrong character
      
      expect(hasError).toBe(true);
      expect(errorChar).toBe('x');
      expect(userInput).toBe('d'); // Valid part preserved
    });
    
    it('should handle errors while typing noun', () => {
      handleInput('die');
      handleInput('die ');
      handleInput('M');
      handleInput('Mx'); // Wrong character
      
      expect(hasError).toBe(true);
      expect(errorChar).toBe('x');
      expect(userInput).toBe('M'); // Valid part preserved
      expect(phase).toBe('singular');
    });
  });
});
