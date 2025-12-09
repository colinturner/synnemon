import { browser } from '$app/environment';
import { supabase, isSupabaseConfigured } from '$lib/supabase';
import { authStore } from './auth.svelte';
import type { UserProgress } from '$lib/types';
import { vocabulary } from '$lib/data/vocabulary';

const LOCAL_PROGRESS_KEY = 'german-drills-progress';

// SM-2 Spaced Repetition Algorithm
function calculateNextReview(
  correct: boolean,
  currentEaseFactor: number,
  currentInterval: number
): { easeFactor: number; interval: number; nextReview: Date } {
  let easeFactor = currentEaseFactor;
  let interval = currentInterval;

  if (correct) {
    // Increase interval
    if (interval === 0) {
      interval = 1;
    } else if (interval === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    // Slightly increase ease factor for correct answers
    easeFactor = Math.min(2.5, easeFactor + 0.1);
  } else {
    // Reset interval on incorrect
    interval = 0;
    // Decrease ease factor (minimum 1.3)
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { easeFactor, interval, nextReview };
}

function createProgressStore() {
  let progress = $state<Map<string, UserProgress>>(new Map());
  let loading = $state(true);
  let syncing = $state(false);

  // Generate word ID
  function getWordId(item: typeof vocabulary[number]): string {
    if (item.type === 'noun') {
      return `noun:${item.german}`;
    } else {
      return `verb:${item.infinitive}`;
    }
  }

  // Load progress from localStorage
  function loadLocalProgress(): Map<string, UserProgress> {
    if (!browser) return new Map();
    
    try {
      const stored = localStorage.getItem(LOCAL_PROGRESS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProgress[];
        return new Map(parsed.map(p => [p.word_id, p]));
      }
    } catch (e) {
      console.error('Failed to load local progress:', e);
    }
    return new Map();
  }

  // Save progress to localStorage
  function saveLocalProgress() {
    if (!browser) return;
    
    try {
      const data = Array.from(progress.values());
      localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save local progress:', e);
    }
  }

  // Load progress from Supabase
  async function loadCloudProgress(): Promise<Map<string, UserProgress>> {
    if (!supabase || !authStore.state.isAuthenticated || !authStore.state.isAllowed) {
      return new Map();
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', authStore.state.user?.id);

      if (error) {
        console.error('Failed to load cloud progress:', error);
        return new Map();
      }

      return new Map((data || []).map((p: UserProgress) => [p.word_id, p]));
    } catch (e) {
      console.error('Failed to load cloud progress:', e);
      return new Map();
    }
  }

  // Sync progress to Supabase
  async function syncToCloud() {
    if (!supabase || !authStore.state.isAuthenticated || !authStore.state.isAllowed) {
      return;
    }

    syncing = true;

    try {
      const data = Array.from(progress.values()).map(p => ({
        ...p,
        user_id: authStore.state.user?.id
      }));

      if (data.length === 0) {
        syncing = false;
        return;
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert(data, { onConflict: 'user_id,word_id' });

      if (error) {
        console.error('Failed to sync progress:', error);
      }
    } catch (e) {
      console.error('Failed to sync progress:', e);
    }

    syncing = false;
  }

  // Initialize progress
  async function init() {
    loading = true;

    // Always load local progress first
    progress = loadLocalProgress();

    // If authenticated and allowed, merge with cloud progress
    if (authStore.state.isAuthenticated && authStore.state.isAllowed) {
      const cloudProgress = await loadCloudProgress();
      
      // Merge: use whichever has more recent last_reviewed
      cloudProgress.forEach((cloudItem, wordId) => {
        const localItem = progress.get(wordId);
        if (!localItem || new Date(cloudItem.last_reviewed) > new Date(localItem.last_reviewed)) {
          progress.set(wordId, cloudItem);
        }
      });

      // Sync merged progress back to cloud
      await syncToCloud();
    }

    loading = false;
  }

  // Record a drill attempt
  async function recordAttempt(wordId: string, correct: boolean) {
    const existing = progress.get(wordId);
    const now = new Date().toISOString();

    const currentEaseFactor = existing?.ease_factor ?? 2.5;
    const currentInterval = existing?.interval ?? 0;

    const { easeFactor, interval, nextReview } = calculateNextReview(
      correct,
      currentEaseFactor,
      currentInterval
    );

    const updated: UserProgress = {
      user_id: authStore.state.user?.id || 'local',
      word_id: wordId,
      correct_count: (existing?.correct_count ?? 0) + (correct ? 1 : 0),
      incorrect_count: (existing?.incorrect_count ?? 0) + (correct ? 0 : 1),
      last_reviewed: now,
      next_review: nextReview.toISOString(),
      ease_factor: easeFactor,
      interval
    };

    progress.set(wordId, updated);
    saveLocalProgress();

    // Sync to cloud in background
    if (authStore.state.isAuthenticated && authStore.state.isAllowed) {
      syncToCloud();
    }
  }

  // Get words due for review (spaced repetition)
  function getWordsDueForReview(): typeof vocabulary {
    const now = new Date();
    
    return vocabulary.filter(item => {
      const wordId = getWordId(item);
      const prog = progress.get(wordId);
      
      // New words are always due
      if (!prog) return true;
      
      // Check if review date has passed
      return new Date(prog.next_review) <= now;
    }).sort((a, b) => {
      // Sort by next_review date (earliest first), new words last
      const progA = progress.get(getWordId(a));
      const progB = progress.get(getWordId(b));
      
      if (!progA && !progB) return 0;
      if (!progA) return 1;
      if (!progB) return -1;
      
      return new Date(progA.next_review).getTime() - new Date(progB.next_review).getTime();
    });
  }

  // Get statistics
  function getStats() {
    const total = vocabulary.length;
    const learned = Array.from(progress.values()).filter(p => p.correct_count > 0).length;
    const mastered = Array.from(progress.values()).filter(p => p.interval >= 21).length; // 21+ days = mastered
    const totalCorrect = Array.from(progress.values()).reduce((sum, p) => sum + p.correct_count, 0);
    const totalIncorrect = Array.from(progress.values()).reduce((sum, p) => sum + p.incorrect_count, 0);
    const totalAttempts = totalCorrect + totalIncorrect;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    return {
      total,
      learned,
      mastered,
      totalCorrect,
      totalIncorrect,
      accuracy,
      dueForReview: getWordsDueForReview().length
    };
  }

  return {
    get progress() {
      return progress;
    },
    get loading() {
      return loading;
    },
    get syncing() {
      return syncing;
    },
    getWordId,
    init,
    recordAttempt,
    getWordsDueForReview,
    getStats,
    syncToCloud
  };
}

export const progressStore = createProgressStore();

