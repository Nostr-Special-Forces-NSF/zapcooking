<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';

  export let selectedRecipe: Writable<string | null>; // Store for selected recipe ID
  export let placeholderString: string;

  let recipes = writable<Set<NDKEvent>>(); // Store for fetched recipe events
  let loading = writable(true); // Loading indicator

  // Fetch recipes for the given npub
  async function fetchRecipes() {
    loading.set(true);

    try {
      const filter = {
        kinds: [35000],
        authors: [$userPublickey]
      };

      // Query relays for the user's recipes
      const events = await $ndk.fetchEvents(filter);

      if (events) {
        recipes.set(events);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      loading.set(false);
    }
  }

  // Fetch recipes on mount
  onMount(fetchRecipes);

  function handleSelection(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    selectedRecipe.set(selectedId);
  }
</script>

<div>
  <label for="recipe-select">Select a Recipe:</label>
  <select id="recipe-select" on:change={handleSelection} disabled={$loading} placeholder={placeholderString}>
    {#if $loading}
      <option value="" disabled>Loading recipes...</option>
    {:else if $recipes.size > 0}
      <option value="" disabled selected>Select a recipe</option>
      {#each $recipes as recipe (recipe.id)}
        <option value={recipe.id}
          >{recipe.tags.find((tag) => tag[0] === 'title')?.[1] || 'Untitled Recipe'}</option
        >
      {/each}
    {:else}
      <option value="" disabled>No recipes found</option>
    {/if}
  </select>
</div>

<style>
  select {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .loading {
    color: gray;
    font-size: 0.9rem;
  }
</style>
