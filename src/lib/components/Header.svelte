<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { progressStore } from '$lib/stores/progress.svelte';
  import { isSupabaseConfigured } from '$lib/supabase';

  let showSettings = $state(false);
  let showStats = $state(false);

  const auth = $derived(authStore.state);
  const settings = $derived(settingsStore.value);
  const stats = $derived(progressStore.getStats());
</script>

<header class="header">
  <div class="header-content">
    <div class="logo">
      <span class="logo-icon">🇩🇪</span>
      <span class="logo-text">German Drills</span>
    </div>

    <nav class="nav">
      <!-- Stats button -->
      <button 
        class="nav-btn" 
        onclick={() => showStats = !showStats}
        title="Statistics"
      >
        📊
      </button>

      <!-- Settings button -->
      <button 
        class="nav-btn" 
        onclick={() => showSettings = !showSettings}
        title="Settings"
      >
        ⚙️
      </button>

      <!-- Auth -->
      {#if isSupabaseConfigured()}
        {#if auth.loading}
          <span class="loading-indicator">...</span>
        {:else if auth.isAuthenticated}
          <div class="user-menu">
            {#if auth.user?.avatar}
              <img src={auth.user.avatar} alt="" class="avatar" />
            {:else}
              <div class="avatar-placeholder">
                {auth.user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            {/if}
            {#if progressStore.syncing}
              <span class="sync-indicator" title="Syncing...">🔄</span>
            {/if}
          </div>
        {:else}
          <button class="btn btn-secondary btn-sm" onclick={() => authStore.signInWithGoogle()}>
            Sign in
          </button>
        {/if}
      {/if}
    </nav>
  </div>

  <!-- Stats dropdown -->
  {#if showStats}
    <div class="dropdown stats-dropdown animate-fade-in">
      <h3>Your Progress</h3>
      <div class="stats-grid">
        <div class="stat">
          <span class="stat-value">{stats.dueForReview}</span>
          <span class="stat-label">Due for review</span>
        </div>
        <div class="stat">
          <span class="stat-value">{stats.learned}</span>
          <span class="stat-label">Words learned</span>
        </div>
        <div class="stat">
          <span class="stat-value">{stats.mastered}</span>
          <span class="stat-label">Mastered</span>
        </div>
        <div class="stat">
          <span class="stat-value">{stats.accuracy}%</span>
          <span class="stat-label">Accuracy</span>
        </div>
      </div>
      <div class="stats-total">
        {stats.totalCorrect} correct / {stats.totalIncorrect} incorrect
      </div>
      <button class="close-btn" onclick={() => showStats = false}>×</button>
    </div>
  {/if}

  <!-- Settings dropdown -->
  {#if showSettings}
    <div class="dropdown settings-dropdown animate-fade-in">
      <h3>Settings</h3>
      
      <div class="setting-row">
        <span class="setting-label">Base Language</span>
        <div class="toggle-group">
          <button 
            class="toggle-btn" 
            class:active={settings.baseLanguage === 'en'}
            onclick={() => settingsStore.setBaseLanguage('en')}
          >
            🇬🇧 English
          </button>
          <button 
            class="toggle-btn" 
            class:active={settings.baseLanguage === 'no'}
            onclick={() => settingsStore.setBaseLanguage('no')}
          >
            🇳🇴 Norwegian
          </button>
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-label">Audio</span>
        <button 
          class="toggle-btn full-width" 
          class:active={settings.audioEnabled}
          onclick={() => settingsStore.toggleAudio()}
        >
          {settings.audioEnabled ? '🔊 On' : '🔇 Off'}
        </button>
      </div>

      <div class="setting-row">
        <span class="setting-label">Full Conjugation Mode</span>
        <button 
          class="toggle-btn full-width" 
          class:active={settings.fullConjugationMode}
          onclick={() => settingsStore.toggleFullConjugationMode()}
        >
          {settings.fullConjugationMode ? '✓ Enabled' : 'Disabled'}
        </button>
        <p class="setting-hint">Practice all verb persons (ich, du, er/sie/es...)</p>
      </div>

      {#if auth.isAuthenticated}
        <div class="setting-row">
          <button class="btn btn-secondary full-width" onclick={() => authStore.signOut()}>
            Sign out
          </button>
        </div>
      {/if}

      <button class="close-btn" onclick={() => showSettings = false}>×</button>
    </div>
  {/if}
</header>

<!-- Click outside to close -->
{#if showSettings || showStats}
  <button 
    class="backdrop" 
    onclick={() => { showSettings = false; showStats = false; }}
    aria-label="Close dropdown"
  ></button>
{/if}

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 10, 15, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-bg-card);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    max-width: 1200px;
    margin: 0 auto;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .logo-text {
    font-weight: 700;
    font-size: 1.125rem;
    letter-spacing: -0.02em;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    font-size: 1.25rem;
    transition: background var(--transition-fast);
  }

  .nav-btn:hover {
    background: var(--color-bg-elevated);
  }

  .btn-sm {
    padding: var(--space-xs) var(--space-md);
    font-size: 0.875rem;
  }

  .user-menu {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }

  .sync-indicator {
    font-size: 0.875rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .loading-indicator {
    color: var(--color-text-muted);
  }

  .dropdown {
    position: absolute;
    top: 100%;
    right: var(--space-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-bg-elevated);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    min-width: 280px;
    box-shadow: var(--shadow-lg);
  }

  .dropdown h3 {
    font-size: 1rem;
    margin-bottom: var(--space-md);
    color: var(--color-text);
  }

  .close-btn {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    font-size: 1.25rem;
    color: var(--color-text-muted);
  }

  .close-btn:hover {
    background: var(--color-bg-elevated);
    color: var(--color-text);
  }

  /* Stats dropdown */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }

  .stat {
    text-align: center;
    padding: var(--space-sm);
    background: var(--color-bg);
    border-radius: var(--radius-md);
  }

  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-accent);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stats-total {
    text-align: center;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  /* Settings dropdown */
  .setting-row {
    margin-bottom: var(--space-md);
  }

  .setting-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: var(--space-xs);
    color: var(--color-text-muted);
  }

  .toggle-group {
    display: flex;
    gap: var(--space-xs);
  }

  .toggle-btn {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    background: var(--color-bg);
    border: 1px solid var(--color-bg-elevated);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    color: var(--color-text-muted);
    transition: all var(--transition-fast);
  }

  .toggle-btn:hover {
    background: var(--color-bg-elevated);
    color: var(--color-text);
  }

  .toggle-btn.active {
    background: var(--color-accent);
    color: var(--color-bg);
    border-color: var(--color-accent);
  }

  .toggle-btn.full-width {
    width: 100%;
  }

  .setting-hint {
    font-size: 0.75rem;
    color: var(--color-text-dim);
    margin-top: var(--space-xs);
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: transparent;
    z-index: 99;
  }

  @media (max-width: 640px) {
    .logo-text {
      display: none;
    }

    .dropdown {
      left: var(--space-md);
      right: var(--space-md);
      min-width: auto;
    }
  }
</style>

