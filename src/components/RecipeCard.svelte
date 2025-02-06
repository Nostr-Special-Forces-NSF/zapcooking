<script lang="ts">
  import { userPublickey } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';

  export let event: NDKEvent;
  export let list = false;

  let link = '';
  $: {
    if (event) {
      const d = event.tags.find((t) => t[0] == 'd')?.[1];
      if (d) {
        const naddr = nip19.naddrEncode({
          identifier: d,
          kind: event.kind,
          pubkey: event.author.pubkey ?? userPublickey
        });
        link = `/${list ? 'list' : 'recipe'}/${naddr}`;
      }
    }
  }

  // TODO FIX TYPES HERE
  let imageElement;

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.style.backgroundImage = `url('${
            event.tags.find((e) => e[0] == 'image')?.[1] || ''
          }')`;
          observer.unobserve(lazyImage);
        }
      });
    });

    observer.observe(imageElement);
  });

  $: console.log('Generated link:', link);
</script>

<a
  href={link}
  on:click={(e) => e.stopPropagation()}
  data-sveltekit-preload
  class="hover:text-primary flex max-w-[160px] flex-col gap-4 place-self-center self-start transition-colors duration-300 md:place-self-start"
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

<style>
  @reference "../app.css";

  .image {
    @apply relative aspect-auto h-[237px] w-[160px] cursor-pointer overflow-hidden rounded-2xl bg-cover bg-center object-cover before:animate-pulse;
  }
</style>
