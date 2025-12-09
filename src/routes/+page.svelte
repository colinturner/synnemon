<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import Header from '$lib/components/Header.svelte';
  import AuthGate from '$lib/components/AuthGate.svelte';
  import DrillInput from '$lib/components/DrillInput.svelte';
  import { progressStore } from '$lib/stores/progress.svelte';
  import { vocabulary, type VocabularyItem } from '$lib/data/vocabulary';

  // Check for offline mode
  const isOffline = $derived(browser && $page.url.searchParams.get('offline') === 'true');

  // Get words due for review
  let wordQueue = $state<VocabularyItem[]>([]);
  let currentIndex = $state(0);
  let sessionStats = $state({ correct: 0, incorrect: 0 });
  let sessionComplete = $state(false);

  // Initialize word queue when progress loads
  $effect(() => {
    if (!progressStore.loading) {
      const dueWords = progressStore.getWordsDueForReview();
      
      if (dueWords.length > 0) {
        // Shuffle and take up to 20 words per session
        wordQueue = shuffleArray(dueWords).slice(0, 20);
        currentIndex = 0;
        sessionComplete = false;
      } else {
        sessionComplete = true;
      }
    }
  });

  // Current word
  const currentWord = $derived(wordQueue[currentIndex]);

  // Shuffle array (Fisher-Yates)
  function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Handle word completion
  function handleComplete(correct: boolean) {
    if (correct) {
      sessionStats.correct++;
    } else {
      sessionStats.incorrect++;
    }
  }

  // Go to next word
  function handleNext() {
    if (currentIndex < wordQueue.length - 1) {
      currentIndex++;
    } else {
      sessionComplete = true;
    }
  }

  // Start new session
  function startNewSession() {
    const dueWords = progressStore.getWordsDueForReview();
    
    if (dueWords.length > 0) {
      wordQueue = shuffleArray(dueWords).slice(0, 20);
      currentIndex = 0;
      sessionStats = { correct: 0, incorrect: 0 };
      sessionComplete = false;
    }
  }

  // Practice all words (ignore spaced repetition)
  function practiceAll() {
    wordQueue = shuffleArray([...vocabulary]).slice(0, 20);
    currentIndex = 0;
    sessionStats = { correct: 0, incorrect: 0 };
    sessionComplete = false;
  }
</script>

<AuthGate>
  <div class="app">
    <Header />

    <main class="main">
      {#if progressStore.loading}
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>Loading your progress...</p>
        </div>
      {:else if sessionComplete}
        <div class="session-complete animate-fade-in">
          <div class="complete-card">
            <span class="complete-icon">🎉</span>
            <h2>
              {#if sessionStats.correct + sessionStats.incorrect === 0}
                All caught up!
              {:else}
                Session Complete!
              {/if}
            </h2>

            {#if sessionStats.correct + sessionStats.incorrect > 0}
              <div class="session-stats">
                <div class="stat correct">
                  <span class="stat-value">{sessionStats.correct}</span>
                  <span class="stat-label">Correct</span>
                </div>
                <div class="stat incorrect">
                  <span class="stat-value">{sessionStats.incorrect}</span>
                  <span class="stat-label">Incorrect</span>
                </div>
              </div>
            {/if}

            <p class="complete-message">
              {#if progressStore.getWordsDueForReview().length === 0}
                No words due for review. Great job keeping up with your practice!
              {:else}
                You have {progressStore.getWordsDueForReview().length} more words due for review.
              {/if}
            </p>

            <div class="complete-actions">
              {#if progressStore.getWordsDueForReview().length > 0}
                <button class="btn btn-primary" onclick={startNewSession}>
                  Continue Practice
                </button>
              {/if}
              <button class="btn btn-secondary" onclick={practiceAll}>
                Practice All Words
              </button>
            </div>
          </div>

          <div class="overall-progress">
            <h3>Overall Progress</h3>
            <div class="progress-stats">
              <div class="progress-stat">
                <span class="label">Words Learned</span>
                <span class="value">{progressStore.getStats().learned} / {progressStore.getStats().total}</span>
              </div>
              <div class="progress-stat">
                <span class="label">Mastered</span>
                <span class="value">{progressStore.getStats().mastered}</span>
              </div>
              <div class="progress-stat">
                <span class="label">Accuracy</span>
                <span class="value">{progressStore.getStats().accuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      {:else if currentWord}
        <div class="drill-wrapper">
          <!-- Progress indicator -->
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              style="width: {((currentIndex + 1) / wordQueue.length) * 100}%"
            ></div>
          </div>
          <div class="progress-text">
            {currentIndex + 1} / {wordQueue.length}
          </div>

          <DrillInput 
            word={currentWord}
            onComplete={handleComplete}
            onNext={handleNext}
          />
        </div>
      {/if}
    </main>

    <!-- Keyboard shortcut hints (desktop only) -->
    <footer class="footer">
      <div class="shortcuts">
        <span><kbd>Tab</kbd> Auto-complete</span>
        <span><kbd>Enter</kbd> / <kbd>Space</kbd> Next word</span>
        <span><kbd>Backspace</kbd> Fix errors</span>
      </div>
    </footer>
  </div>
</AuthGate>

<style>
  .app {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    padding-bottom: 80px;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    color: var(--color-text-muted);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-bg-card);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .drill-wrapper {
    width: 100%;
    max-width: 600px;
  }

  .progress-bar {
    height: 4px;
    background: var(--color-bg-card);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: var(--space-xs);
  }

  .progress-fill {
    height: 100%;
    background: var(--color-accent);
    transition: width var(--transition-normal);
  }

  .progress-text {
    text-align: center;
    font-size: 0.75rem;
    color: var(--color-text-dim);
    margin-bottom: var(--space-xl);
  }

  .session-complete {
    text-align: center;
    max-width: 500px;
  }

  .complete-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    margin-bottom: var(--space-xl);
  }

  .complete-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: var(--space-md);
  }

  .complete-card h2 {
    font-size: 1.75rem;
    margin-bottom: var(--space-lg);
  }

  .session-stats {
    display: flex;
    justify-content: center;
    gap: var(--space-xl);
    margin-bottom: var(--space-lg);
  }

  .session-stats .stat {
    text-align: center;
  }

  .session-stats .stat-value {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
  }

  .session-stats .stat-label {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .session-stats .correct .stat-value {
    color: var(--color-success);
  }

  .session-stats .incorrect .stat-value {
    color: var(--color-error);
  }

  .complete-message {
    color: var(--color-text-muted);
    margin-bottom: var(--space-xl);
  }

  .complete-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .overall-progress {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }

  .overall-progress h3 {
    font-size: 1rem;
    color: var(--color-text-muted);
    margin-bottom: var(--space-md);
  }

  .progress-stats {
    display: flex;
    justify-content: space-around;
  }

  .progress-stat {
    text-align: center;
  }

  .progress-stat .label {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-xs);
  }

  .progress-stat .value {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-accent);
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(10, 10, 15, 0.9);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--color-bg-card);
    padding: var(--space-md);
  }

  .shortcuts {
    display: flex;
    justify-content: center;
    gap: var(--space-lg);
    font-size: 0.75rem;
    color: var(--color-text-dim);
  }

  .shortcuts kbd {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    font-family: var(--font-mono);
    background: var(--color-bg-card);
    border: 1px solid var(--color-text-dim);
    border-radius: var(--radius-sm);
    margin-right: var(--space-xs);
  }

  @media (max-width: 640px) {
    .shortcuts {
      flex-wrap: wrap;
      gap: var(--space-sm);
    }

    .footer {
      padding: var(--space-sm);
    }

    .main {
      padding-bottom: 100px;
    }
  }
</style>
