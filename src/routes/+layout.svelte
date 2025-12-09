<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { progressStore } from '$lib/stores/progress.svelte';
  import { loadVoices } from '$lib/utils/speech';

  let { children } = $props();

  onMount(async () => {
    // Initialize auth first
    await authStore.init();
    
    // Then load progress (which may sync with cloud)
    await progressStore.init();
    
    // Pre-load speech synthesis voices
    await loadVoices();
  });
</script>

<svelte:head>
  <title>German Drills</title>
  <meta name="description" content="Learn German vocabulary with spaced repetition" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
  <meta name="theme-color" content="#0a0a0f" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</svelte:head>

{@render children()}
