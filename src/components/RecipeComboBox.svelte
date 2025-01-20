<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import TrashIcon from 'phosphor-svelte/lib/Trash';

  export let selectedRecipesArray: Writable<Set<string>> = writable(new Set());
  export let placeholder: string;

  let recipes = writable<Set<NDKEvent>>(new Set()); // Store for fetched recipe events
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
  onMount(() => {
    fetchRecipes();
  });

  function handleSelection(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;
    selectedRecipesArray.update((store) => store.add(selectedId));
  }

  function removeItem(index: string) {
	selectedRecipesArray.update((store) => store.delete(index) ? store : store);
  }

</script>

<div class="mb-0 flex flex-col gap-2">
  <select id="recipe-select" on:change={handleSelection} disabled={$loading}>
    {#if $loading}
      <option value="" disabled>Loading recipes...</option>
    {:else if $recipes.size > 0}
      <option value="" disabled selected>{placeholder}</option>
      {#each $recipes as recipe (recipe.id)}
        <option value={recipe.id}
          >{recipe.tags.find((tag) => tag[0] === 'title')?.[1] || 'Untitled Recipe'}</option
        >
      {/each}
    {:else}
      <option value="" disabled>No recipes found</option>
    {/if}
  </select>
  {#if $selectedRecipesArray.size > 0}
  <ul class="flex flex-col gap-2">
	{#each $selectedRecipesArray as item}
	  <li class="flex input">
		  <span class="grow">{item}</span
		  >
		  <div class="flex gap-2">
			<button class="self-center text-danger" on:click={() => removeItem(item)}>
			  <TrashIcon />
			</button>
		  </div>
	  </li>
	{/each}
  </ul>

  {/if}
</div>

<style>
  select {
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
</style>
