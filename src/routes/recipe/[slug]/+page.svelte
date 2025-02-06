<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { ndk } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { goto } from '$app/navigation';
  import Recipe from '../../../components/Recipe/Recipe.svelte';

  let event: NDKEvent | null = null;
  let embeddedRecipes: NDKEvent[] = [];
  let prepTime = 0;
  let cookTime = 0;
  let parsedTime = false;
  let loading = true;

  onMount(async () => {
    await loadData();
    if (event) {
      await loadEmbedded();
    }
    loading = false;
  });

  async function loadData() {
    console.log('Fetching event for slug:', $page.params.slug);

    try {
      if ($page.params.slug.startsWith('naddr1')) {
        const a = nip19.decode($page.params.slug);
        if (!(a.type == 'naddr')) throw new Error('Invalid Nostr address');

        const b = a.data as nip19.AddressPointer;
        event = await $ndk.fetchEvent({
          '#d': [b.identifier],
          authors: [b.pubkey],
          kinds: [35000]
        });
      } else {
        event = await $ndk.fetchEvent($page.params.slug);

        if (event) {
          const id = event.tags.find((z) => z[0] == 'd')?.[1];
          if (!id || !event.kind) throw new Error('Invalid event data');

          // Redirect if needed
          const c = nip19.naddrEncode({
            identifier: id,
            kind: event.kind,
            pubkey: event.author.pubkey
          });
          goto(`/recipe/${c}`);
        }
      }
    } catch (error) {
      console.error('Error loading event:', error);
    }
  }

  async function loadEmbedded() {
    if (!event) return;
    console.log('Loading embedded recipes...');

    try {
      const addrs = event.tags
        .filter((t) => t[0] === 'a')
        .map((t) => {
          const atags = t[1].split(':');
          return atags[0] === '35000' ? atags[1] : undefined;
        });

      const results = await Promise.all(
        addrs.map((a) => (a ? $ndk.fetchEvent(a) : Promise.resolve(undefined)))
      );

      embeddedRecipes = results as NDKEvent[];

      if (!parsedTime) {
        getTimes();
        parsedTime = true;
      }
    } catch (error) {
      console.error('Error loading embedded recipes:', error);
    }
  }

  function getTimes() {
    prepTime = parseInt(event?.tagValue('prep_time') ?? '0');
    cookTime = parseInt(event?.tagValue('cook_time') ?? '0');

    embeddedRecipes.forEach((e) => {
      prepTime += parseInt(e.tagValue('prep_time') ?? '0');
      cookTime += parseInt(e.tagValue('cook_time') ?? '0');
    });
  }
</script>

{#if loading}
  <div class="flex h-screen items-center justify-center">
    <img class="w-64" src="/pan-animated.svg" alt="Loading" />
  </div>
{:else if event}
  <Recipe {event} {embeddedRecipes} {prepTime} {cookTime} />
{:else}
  <div class="flex h-screen items-center justify-center">
    <p class="text-red-500">Failed to load recipe. Check console logs.</p>
  </div>
{/if}
