<script lang="ts">
  import MagnifyingIcon from 'phosphor-svelte/lib/MagnifyingGlass';
  import LightningIcon from 'phosphor-svelte/lib/Lightning';
  import BookmarkIcon from 'phosphor-svelte/lib/Bookmark';
</script>

<nav
  class="fixed bottom-0 left-0 grid w-full grid-cols-3 grid-rows-1 bg-white pt-2 text-center lg:hidden"
>
  <a href="/recent" class="flex flex-col">
    <MagnifyingIcon class="self-center" size={24} />
    Discover
  </a>
  <a href="/tags" class="flex flex-col">
    <LightningIcon class="self-center" size={24} />
    Categories
  </a>
  <a href="/bookmarks" class="flex flex-col">
    <BookmarkIcon class="self-center" size={24} />
    Bookmarks
  </a>
</nav>
