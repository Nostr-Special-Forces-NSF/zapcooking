<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import RecipeCard from './RecipeCard.svelte';
  import { writable, type Writable } from 'svelte/store';

  export let events: NDKEvent[];
  export let lists = false;
  export let selectable = false;
  export let selectedRecipes = writable(new Set<string>());
</script>

<svelte:head>
  <link rel="preload" as="image" href="/placeholder.png" />
</svelte:head>

<div
  class="grid grid-cols-2 gap-x-2 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
>
  {#if events.length > 0}
    {#each events as event}
      <RecipeCard
        list={lists}
        {event}
        {selectable}
        selected={$selectedRecipes.has(event.id)}
        {selectedRecipes}
      />
    {/each}
  {:else}
    {#each new Array(24) as i}
      <div
        class="hover:text-primary flex max-w-[160px] flex-col gap-4 place-self-center self-start transition-colors duration-300 md:place-self-start"
      >
        <div
          class="relative h-[237px] w-[160px] animate-pulse cursor-pointer overflow-hidden rounded-3xl bg-cover bg-center transition"
          style="background-image: url('/placeholder.png');"
        ></div>

        <h5 class="text-md text-input bg-input animate-pulse leading-tight text-wrap">
          PLACEHOLDER RECIPE {i}
        </h5>
      </div>
    {/each}
  {/if}
</div>
