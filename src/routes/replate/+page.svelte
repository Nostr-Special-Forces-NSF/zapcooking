<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import Feed from '../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import Button from '../../components/Button.svelte';
  import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircle';
  import CaretCircleRightIcon from 'phosphor-svelte/lib/CaretCircleRight';

  import { writable } from 'svelte/store';

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

  let events: NDKEvent[] = [];
  let selectable = true;
  // Store for selected recipes
  let selectedRecipes = writable(new Set<string>());

  function selectAll() {
    selectedRecipes.update((selected) => {
      if (selected.size > 0) {
        return new Set(); // Deselect all
      } else {
        return new Set(events.map((r) => r.id)); // Select all
      }
    });
  }

  function replate() {

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
  <div class="flex gap-2">
    <h2>Replate Recipes</h2>
    <Button
      class="flex gap-2 self-center font-semibold max-md:h-10 max-md:w-10 max-md:justify-center max-md:px-1 max-md:py-1"
      on:click={selectAll}
    >
      <CheckCircleIcon class="self-center" size={16} />
      {$selectedRecipes.size > 0 ? 'Select None' : 'Select All'}
    </Button>
    <Button
      class="flex gap-2 self-center font-semibold max-md:h-10 max-md:w-10 max-md:justify-center max-md:px-1 max-md:py-1"
      disabled={$selectedRecipes.size === 0}
	  on:click={replate}
    >
      <CaretCircleRightIcon class="self-center" size={16} />
      Replate Selected
    </Button>
  </div>
  <div class="flex flex-col gap-2">
    <Feed {events} {selectable} {selectedRecipes} />
  </div>
</div>
