<script lang="ts">
  import { recipeTags, type recipeTagSimple } from '$lib/consts';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  export let event: NDKEvent;

  let nameTagFound = false;

  let tags: recipeTagSimple[] = [];

  tags = event.tags
    .filter((t) => t[0] === 'category' || t[0] === 'cuisine')
    .map<recipeTagSimple>((t) => {
      return {
        title: t[1].toLowerCase()
      };
    });
</script>

<div class="flex flex-wrap gap-2 text-[14px]">
  {#each tags as tag}
    <a
      href="/tag/{tag.title}"
      class="rounded-full px-2 py-1 bg-input text-black hover:bg-accent-gray transition duration-300
     cursor-pointer"
    >
      {tag.title}
    </a>
  {/each}
</div>
