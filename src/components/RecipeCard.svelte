<script lang="ts">
  import { userPublickey } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import { get, writable, type Writable } from 'svelte/store';

  export let event: NDKEvent;
  export let list = false;
  export let selectable = false; // Enables the selection checkbox
  export let selected = false; // Track if selected
  export let selectedRecipes: Writable<Set<string>>;

  let link = '';
  $: {
    if (event) {
      const d = event.tags.find((t) => t[0] == 'd')?.[1];
      if (d) {
        const naddr = nip19.naddrEncode({
          identifier: d,
          kind: event.kind as number,
          pubkey: event.author.pubkey ?? userPublickey
        });
        link = `/${list ? 'list' : 'recipe'}/${naddr}`;
      }
    }
  }

  // Image Lazy Loading
  let imageElement: HTMLDivElement | null = null;
  onMount(() => {
    if (!imageElement) return; // Ensure element exists before observing

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && imageElement) {
          imageElement!.style.backgroundImage = `url('${
            event.tags.find((e) => e[0] == 'image')?.[1] || ''
          }')`;
          observer.unobserve(imageElement);
        }
      });
    });
    observer.observe(imageElement);
  });

  function toggleSelection(e: { stopPropagation: () => void }) {
    e.stopPropagation(); // Prevents navigation when clicking the checkbox
    selected = !selected;
	if (selected) {
		selectedRecipes.update((s) => s.add(event.id));
	}
  }
</script>

<div
  class="hover:text-primary relative flex max-w-[160px] flex-col place-self-center self-start transition-colors duration-300 md:place-self-start"
>
  <!-- Selection Checkbox -->
  {#if selectable}
    <input
      type="checkbox"
      bind:checked={selected}
      on:click={toggleSelection}
      class="accent-primary absolute top-2 left-2 z-10 h-5 w-5 rounded border-2 border-gray-300 bg-white"
    />
  {/if}

  <!-- Clickable Recipe Card -->
  <a
    href={link}
    on:click={(e) => e.stopPropagation()}
    data-sveltekit-preload
    class="flex flex-col gap-4"
  >
    <div class="image relative" style={`background-image: url('/placeholder.png');`}>
      <div
        bind:this={imageElement}
        class="image absolute top-0 right-0 bottom-0 left-0 transition-transform duration-700 ease-in-out hover:scale-105"
      ></div>
    </div>

    <h5 class="text-md leading-tight text-wrap">
      {#if event?.tags.find((e) => e[0] == 'title')?.[0] && event?.tags.find((e) => e[0] == 'title')?.[1]}
        {event.tags.find((e) => e[0] == 'title')?.[1]}
      {:else}
        {event.tags.find((e) => e[0] == 'd')?.[1]}
      {/if}
    </h5>
  </a>
</div>

<style>
  @reference "../app.css";

  .image {
    @apply relative aspect-auto h-[237px] w-[160px] cursor-pointer overflow-hidden rounded-2xl bg-cover bg-center object-cover before:animate-pulse;
  }
</style>
