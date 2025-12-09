<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import { isSupabaseConfigured } from '$lib/supabase';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  const auth = $derived(authStore.state);
  const configured = isSupabaseConfigured();
</script>

{#if !configured}
  <!-- Supabase not configured, allow offline use -->
  {@render children()}
{:else if auth.loading}
  <div class="loading-screen">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
{:else if !auth.isAuthenticated}
  <div class="auth-screen">
    <div class="auth-card">
      <div class="auth-header">
        <span class="auth-icon">🇩🇪</span>
        <h1>German Drills</h1>
        <p>Master German vocabulary with spaced repetition</p>
      </div>

      <button class="btn btn-google" onclick={() => authStore.signInWithGoogle()}>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>

      <p class="auth-note">
        Sign in to sync your progress across devices
      </p>

      <div class="divider">
        <span>or</span>
      </div>

      <a href="/?offline=true" class="btn btn-secondary">
        Practice offline
      </a>
    </div>

    <div class="features">
      <div class="feature">
        <span class="feature-icon">📚</span>
        <h3>50+ Words</h3>
        <p>Nouns & verbs with articles, plurals, and conjugations</p>
      </div>
      <div class="feature">
        <span class="feature-icon">🔄</span>
        <h3>Spaced Repetition</h3>
        <p>Smart algorithm prioritizes words you need to practice</p>
      </div>
      <div class="feature">
        <span class="feature-icon">📱</span>
        <h3>Mobile Ready</h3>
        <p>Practice anywhere, sync across all your devices</p>
      </div>
    </div>
  </div>
{:else if !auth.isAllowed}
  <div class="auth-screen">
    <div class="auth-card">
      <div class="auth-header">
        <span class="auth-icon">🔒</span>
        <h1>Access Restricted</h1>
        <p>This app is currently invite-only.</p>
      </div>

      <div class="user-info">
        <p>Signed in as: <strong>{auth.user?.email}</strong></p>
      </div>

      <p class="auth-note">
        Contact the administrator to request access.
      </p>

      <button class="btn btn-secondary" onclick={() => authStore.signOut()}>
        Sign out
      </button>
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: var(--space-md);
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

  .auth-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    gap: var(--space-2xl);
  }

  .auth-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: var(--shadow-lg);
  }

  .auth-header {
    margin-bottom: var(--space-xl);
  }

  .auth-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: var(--space-md);
  }

  .auth-header h1 {
    font-size: 1.75rem;
    margin-bottom: var(--space-sm);
  }

  .auth-header p {
    color: var(--color-text-muted);
  }

  .btn-google {
    width: 100%;
    margin-bottom: var(--space-md);
  }

  .auth-note {
    font-size: 0.875rem;
    color: var(--color-text-dim);
    margin-bottom: var(--space-lg);
  }

  .divider {
    position: relative;
    margin: var(--space-lg) 0;
    text-align: center;
  }

  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--color-bg-elevated);
  }

  .divider span {
    position: relative;
    padding: 0 var(--space-md);
    background: var(--color-bg-card);
    color: var(--color-text-dim);
    font-size: 0.875rem;
  }

  .user-info {
    background: var(--color-bg);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-lg);
  }

  .user-info p {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg);
    max-width: 800px;
  }

  .feature {
    text-align: center;
    padding: var(--space-lg);
  }

  .feature-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: var(--space-sm);
  }

  .feature h3 {
    font-size: 1rem;
    margin-bottom: var(--space-xs);
  }

  .feature p {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  @media (max-width: 640px) {
    .features {
      grid-template-columns: 1fr;
    }
  }
</style>

