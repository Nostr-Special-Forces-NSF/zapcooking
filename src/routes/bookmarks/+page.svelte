<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent, type NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';
  import Feed from '../../components/Feed.svelte';
  import { formatDate } from '$lib/utils';
  import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlass';

  let loaded = false;
  let event: NDKEvent;
  let events: NDKEvent[] = [];
  let user: NDKUserProfile;
  let tried = 0;
  let naddr = '...';

  async function loadData() {
    loaded = false;

    if (!$userPublickey) {
      goto('/login');
      return;
    } else {
      naddr = nip19.naddrEncode({
        identifier: 'nostrcooking-bookmarks',
        pubkey: $userPublickey,
        kind: 30003
      });
    }

    // load user
    const u = await $ndk.getUser({ hexpubkey: $userPublickey }).fetchProfile();
    if (u) {
      user = u;
    }
    // load event
    let e = await $ndk.fetchEvent({
      // @ts-ignore
      '#d': ['nostrcooking-bookmarks'],
      // @ts-ignore
      authors: [$userPublickey],
      kinds: [30003]
    });
    if (e) {
      event = e;
    } else {
      try {
        const event = new NDKEvent($ndk);
        event.kind = 30003;
        event.tags.push(['d', 'nostrcooking-bookmarks']);
        event.tags.push(['name', 'Nostr Cooking Bookmarks']);
        let relays = await event.publish();
        relays.forEach((relay) => {
          relay.once('published', () => {
            console.log('published to', relay);
          });
          relay.once('publish:failed', (relay, err) => {
            console.log('publish failed to', relay, err);
          });
        });
        setTimeout(() => {
          tried++;
          loadData();
        }, 250);
      } catch (err) {
        alert('error: ' + err);
      }
    }

    // load list
    if (event) {
      event.tags.forEach(async (a) => {
        if (a[0] == 'a') {
          const parts = a[1].split(':');
          if (parts.length !== 3) {
            return;
          }
          const [kind, pubkey, identifier] = parts;
          if (
            typeof kind !== 'string' ||
            typeof pubkey !== 'string' ||
            typeof identifier !== 'string'
          ) {
            return;
          }
          const newEv = await $ndk.fetchEvent({
            kinds: [Number(kind)],
            '#d': [identifier],
            authors: [pubkey]
          });
          if (newEv) {
            events.push(newEv);
            events = events;
          }
        }
      });
    }

    loaded = true;
  }

  onMount(() => {
    loadData();
  });
</script>

<svelte:head>
  <title>your bookmarks on zap.cooking</title>
</svelte:head>

{#if event}
  <div class="flex flex-col gap-4">
    <div>
      <h1>Bookmarked Recipes</h1>
      {#if $userPublickey == event.author.hexpubkey}
        <a class="underline" href={`/bookmarks/edit`}>Edit</a>
      {/if}
    </div>

    <!--
    NONFUNCTIONAL:
    <div class="flex bg-input mx-0.5 rounded-xl">
      <input class="rounded-xl bg-input border-none grow" type="search" placeholder="Search" />
      <MagnifyingGlassIcon class="self-center mr-3" />
    </div>
    -->

    <Feed {events} />
  </div>
{:else}
  <div class="flex h-screen items-center justify-center">
    <img class="w-64" src="/pan-animated.svg" alt="Loading" />
  </div>
{/if}
