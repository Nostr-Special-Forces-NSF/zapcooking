<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import HeartIcon from 'phosphor-svelte/lib/Heart';

  export let event: NDKEvent;
  let loading = true;
  let totalLikeAmount: number = 0;
  let liked = false;

  $: {
    (async () => {
      const evs = await $ndk.fetchEvents({
        kinds: [7],
        '#a': [`${event.kind}:${event.author.pubkey}:${event.tags.find((e) => e[0] == 'd')?.[1]}`]
      });
      if (Array.from(evs).find((e) => e.pubkey == $userPublickey)) liked = true;
      totalLikeAmount = evs.size;
    })();
  }
  loading = false;
  async function likePost() {
    if (liked) return;
    await event.react('+', true);
  }
</script>

<button
  on:click={likePost}
  class="hover:bg-input flex cursor-pointer gap-1.5 rounded-sm px-0.5 transition duration-300"
>
  <HeartIcon size={24} />
  {#if loading}...{:else}{totalLikeAmount}{/if}
</button>
