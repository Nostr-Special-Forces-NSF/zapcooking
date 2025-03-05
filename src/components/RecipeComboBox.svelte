<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import TrashIcon from 'phosphor-svelte/lib/Trash';

  export let selectedRecipesArray: Writable<Map<string, string>> = writable();
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
    console.log($selectedRecipesArray);
  });

  function handleSelection(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedId = select.value;
    const selectedText = select.options[select.selectedIndex].text;
    selectedRecipesArray.update((store) => store.set(selectedId, selectedText));
  }

  function removeItem(index: string) {
    selectedRecipesArray.update((store) => (store.delete(index) ? store : store));
  }
</script>

<div class="mb-0 flex flex-col gap-2">
  <select
    class="input flex rounded-xl border-none p-3"
    id="recipe-select"
    on:change={handleSelection}
    disabled={$loading}
  >
    {#if $loading}
      <option value="" disabled>Loading recipes...</option>
    {:else if $recipes.size > 0}
      <option value="" disabled selected>{placeholder}</option>
      {#each $recipes as recipe (recipe.id)}
        <option value={`35000:${$userPublickey}:${recipe.dTag}`}
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
        <li class="input flex">
          <span class="grow">{item[1]}</span>
          <div class="flex gap-2">
            <button
              type="button"
              class="text-danger self-center"
              on:click={() => removeItem(item[0])}
            >
              <TrashIcon />
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
</style>
