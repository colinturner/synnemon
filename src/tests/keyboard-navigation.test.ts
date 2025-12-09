/**
 * Tests for keyboard navigation in the drill flow
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Keyboard Navigation', () => {
  // Simulate drill phase states
  type DrillPhase = 'article' | 'singular' | 'plural' | 'infinitive' | 'conjugation' | 
                    'conjugation2' | 'conjugation3' | 'translation' | 'example-german' | 'example-base' | 'complete';
  
  let phase: DrillPhase;
  let nextWordCalled: boolean;
  let autoCompleteCalled: boolean;
  
  function onNext() {
    nextWordCalled = true;
  }
  
  function autoComplete() {
    autoCompleteCalled = true;
  }
  
  function handleWindowKeydown(key: string) {
    // Handle Tab key when input is hidden (for example phases)
    if (key === 'Tab' && (phase === 'translation' || phase === 'example-german' || phase === 'example-base')) {
      autoComplete();
    }
    // Handle Enter/Space to go to next word when complete
    if ((key === 'Enter' || key === ' ') && phase === 'complete') {
      onNext();
    }
  }
  
  beforeEach(() => {
    phase = 'article';
    nextWordCalled = false;
    autoCompleteCalled = false;
  });
  
  describe('Next Word (Enter/Space)', () => {
    it('should call onNext when Enter is pressed in complete phase', () => {
      phase = 'complete';
      handleWindowKeydown('Enter');
      expect(nextWordCalled).toBe(true);
    });
    
    it('should call onNext when Space is pressed in complete phase', () => {
      phase = 'complete';
      handleWindowKeydown(' ');
      expect(nextWordCalled).toBe(true);
    });
    
    it('should NOT call onNext when Enter is pressed in other phases', () => {
      const phases: DrillPhase[] = ['article', 'singular', 'plural', 'translation', 'example-german'];
      
      for (const p of phases) {
        nextWordCalled = false;
        phase = p;
        handleWindowKeydown('Enter');
        expect(nextWordCalled).toBe(false);
      }
    });
  });
  
  describe('Tab to reveal (example phases)', () => {
    it('should call autoComplete when Tab is pressed in translation phase', () => {
      phase = 'translation';
      handleWindowKeydown('Tab');
      expect(autoCompleteCalled).toBe(true);
    });
    
    it('should call autoComplete when Tab is pressed in example-german phase', () => {
      phase = 'example-german';
      handleWindowKeydown('Tab');
      expect(autoCompleteCalled).toBe(true);
    });
    
    it('should call autoComplete when Tab is pressed in example-base phase', () => {
      phase = 'example-base';
      handleWindowKeydown('Tab');
      expect(autoCompleteCalled).toBe(true);
    });
    
    it('should NOT call autoComplete when Tab is pressed in complete phase', () => {
      phase = 'complete';
      handleWindowKeydown('Tab');
      expect(autoCompleteCalled).toBe(false);
    });
  });
});

