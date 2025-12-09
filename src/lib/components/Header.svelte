<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { progressStore } from '$lib/stores/progress.svelte';
  import { isSupabaseConfigured } from '$lib/supabase';
  import { getLanguageName, type Language } from '$lib/data/vocabulary';

  let showSettings = $state(false);

  const auth = $derived(authStore.state);
  const settings = $derived(settingsStore.value);

  // All available languages
  const languages: { code: Language; flag: string; name: string }[] = [
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'de', flag: '🇩🇪', name: 'German' },
    { code: 'fr', flag: '🇫🇷', name: 'French' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish' },
    { code: 'no', flag: '🇳🇴', name: 'Norwegian' },
  ];

  // Get flag emoji for a language code
  function getFlag(code: Language): string {
    return languages.find(l => l.code === code)?.flag || '';
  }
</script>

<header class="header">
  <div class="header-content">
    <div class="logo">
      <span class="logo-icon">{getFlag(settings.targetLanguage)}</span>
      <span class="logo-text">Language Drills</span>
    </div>

    <nav class="nav">
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

  <!-- Settings dropdown -->
  {#if showSettings}
    <div class="dropdown settings-dropdown animate-fade-in">
      <h3>Settings</h3>
      
      <div class="setting-row">
        <span class="setting-label">I'm Learning (Target)</span>
        <div class="language-grid">
          {#each languages as lang}
            <button 
              class="lang-btn" 
              class:active={settings.targetLanguage === lang.code}
              class:disabled={settings.baseLanguage === lang.code}
              disabled={settings.baseLanguage === lang.code}
              onclick={() => settingsStore.setTargetLanguage(lang.code)}
              title={settings.baseLanguage === lang.code ? "Can't learn the same language you know" : lang.name}
            >
              {lang.flag} {lang.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="setting-row">
        <span class="setting-label">I Know (Base)</span>
        <div class="language-grid">
          {#each languages as lang}
            <button 
              class="lang-btn" 
              class:active={settings.baseLanguage === lang.code}
              class:disabled={settings.targetLanguage === lang.code}
              disabled={settings.targetLanguage === lang.code}
              onclick={() => settingsStore.setBaseLanguage(lang.code)}
              title={settings.targetLanguage === lang.code ? "Can't know the same language you're learning" : lang.name}
            >
              {lang.flag} {lang.name}
            </button>
          {/each}
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
        <p class="setting-hint">Practice all verb persons</p>
      </div>

      <div class="setting-row">
        <span class="setting-label">Word Types</span>
        <div class="toggle-group">
          <button 
            class="toggle-btn" 
            class:active={settings.wordTypes === 'nouns'}
            onclick={() => settingsStore.setWordTypes('nouns')}
          >
            Nouns
          </button>
          <button 
            class="toggle-btn" 
            class:active={settings.wordTypes === 'verbs'}
            onclick={() => settingsStore.setWordTypes('verbs')}
          >
            Verbs
          </button>
          <button 
            class="toggle-btn" 
            class:active={settings.wordTypes === 'both'}
            onclick={() => settingsStore.setWordTypes('both')}
          >
            Both
          </button>
        </div>
        <p class="setting-hint">Choose which word types to practice</p>
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
{#if showSettings}
  <button 
    class="backdrop" 
    onclick={() => { showSettings = false; }}
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
    min-width: 320px;
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

  .language-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xs);
  }

  .lang-btn {
    padding: var(--space-sm) var(--space-md);
    background: var(--color-bg);
    border: 1px solid var(--color-bg-elevated);
    border-radius: var(--radius-md);
    font-size: 0.8rem;
    color: var(--color-text-muted);
    transition: all var(--transition-fast);
    text-align: left;
  }

  .lang-btn:hover:not(.disabled) {
    background: var(--color-bg-elevated);
    color: var(--color-text);
  }

  .lang-btn.active {
    background: var(--color-accent);
    color: var(--color-bg);
    border-color: var(--color-accent);
  }

  .lang-btn.disabled {
    opacity: 0.4;
    cursor: not-allowed;
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

    .language-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
