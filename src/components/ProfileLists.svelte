<script lang="ts">
  import { page } from '$app/stores';
  import { ndk } from '$lib/nostr';
  import type { NDKEvent, NDKFilter, NDKUserProfile } from '@nostr-dev-kit/ndk';
  import Feed from './Feed.svelte';

  export let hexpubkey: string | undefined = undefined;
  let events: NDKEvent[] = [];
  let user: NDKUserProfile;
  let loaded = false;

  $: {
    if ($page.params.slug) {
      loadData();
    }
  }

  async function loadData() {
    if (hexpubkey) {
      // load user
      const u = await $ndk.getUser({ hexpubkey: hexpubkey }).fetchProfile();
      if (u) {
        user = u;
      }

      // load feed
      let filter: NDKFilter = {
        authors: [hexpubkey],
        limit: 256,
        kinds: [30003]
      };
      const evts = await $ndk.fetchEvents(filter);
      let evtsArr = Array.from(evts);
      events = evtsArr;

      loaded = true;
    }
  }
</script>

<Feed lists={true} {events} />
