<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import Feed from '../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import { recipeTags } from '$lib/consts';
  import Button from '../../components/Button.svelte';
  import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircle';
  import { writable } from 'svelte/store';

  function isPopTag(tag: string): boolean {
    switch (tag.toLowerCase()) {
      case 'asian':
      case 'american':
      case 'quick':
      case 'easy':
      case 'beef':
      case 'chicken':
      case 'seafood':
      case 'italian':
      case 'mexican':
      case 'dessert':
      case 'breakfast':
      case 'alcohol':
        return true;
      default:
        return false;
    }
  }

  const popTags = recipeTags.filter((v) => isPopTag(v.title));


  onMount(async () => {
    let filter: NDKFilter = { limit: 256, kinds: [30023], '#t': ['nostrcooking'] };
    const evts = await $ndk.fetchEvents(filter);
    let evtsArr = Array.from(evts);
    evtsArr.forEach((ev, i) => {
      if (validateMarkdownTemplate(ev.content) == null) {
        evtsArr.splice(i, 1);
      }
    });
    events = evtsArr;
  });

  function handleChange(e: any) {
    window.location.href = e.target.value;
  }

  let events: NDKEvent[] = [];
  let selectable = true;
  let recipes: NDKEvent[] = [];
  // Store for selected recipes
  let selectedRecipes = writable(new Set());

  function selectAll() {
	console.log("Selected all recipes")

	selectedRecipes.update((selected) => {
      if (selected.size === recipes.length) {
        return new Set(); // Deselect all
      } else {
		return new Set(recipes.map((r) => r.id)); // Select all
      }
    });
  }
</script>

<svelte:head>
  <title>Replate Recipes</title>
  <meta name="description" content="Replate Recipes to the new NIP format" />
  <meta property="og:url" content="https://zap.cooking/replate" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Replate Recipes" />
  <meta property="og:description" content="Replate Recipes to the new NIP format" />
  <meta property="og:image" content="https://zap.cooking/logo_with_text.png" />

  <meta name="twitter:card" content="summary" />
  <meta property="twitter:domain" content="zap.cooking" />
  <meta property="twitter:url" content="https://zap.cooking/replate" />
  <meta name="twitter:title" content="Replate Recipes" />
  <meta name="twitter:description" content="Replate Recipes to the new NIP format" />
  <meta property="twitter:image" content="https://zap.cooking/logo_with_text.png" />
</svelte:head>

<div class="flex flex-col gap-3 md:gap-10">
  <div class="hidden w-screen gap-6 overflow-x-auto overflow-y-hidden lg:flex">
    {#each popTags as tag}
      <a class="hover:text-primary flex transition duration-300" href="/tag/{tag.title}"
        >{tag.title}</a
      >
    {/each}
  </div>

  <div class="lg:hidden">
    <select class="input w-full" on:change={handleChange}>
      <option value="">All categories</option>
      {#each popTags as tag}
        <option value="/tag/{tag.title}">{tag.title}</option>
      {/each}
    </select>
  </div>

  <div class="flex flex-col gap-2">
    <h2>Replate Recipes</h2>
    <Button
      class="flex gap-2 self-center font-semibold max-md:h-10 max-md:w-10 max-md:justify-center max-md:px-1 max-md:py-1"
      on:click={selectAll}
    >
      <CheckCircleIcon class="self-center" size={16} />
      Select All</Button
    >
    <div><Feed {events} {selectable} {selectedRecipes}/></div>
  </div>
</div>
