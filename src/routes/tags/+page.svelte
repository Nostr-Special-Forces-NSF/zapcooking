<script>
  import { recipeTags } from '$lib/consts';
</script>

<svelte:head>
  <title>All Categories</title>
  <meta name="description" content="View all Categories on Zap Cooking" />
  <meta property="og:url" content="https://zap.cooking/tags" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="All Categories" />
  <meta property="og:description" content="View all Categories on Zap Cooking" />
  <meta property="og:image" content="https://zap.cooking/logo_with_text.png" />

  <meta name="twitter:card" content="summary" />
  <meta property="twitter:domain" content="zap.cooking" />
  <meta property="twitter:url" content="https://zap.cooking/tags" />
  <meta name="twitter:title" content="All Categories" />
  <meta name="twitter:description" content="View all Categories on Zap Cooking" />
  <meta property="twitter:image" content="https://zap.cooking/logo_with_text.png" />
</svelte:head>

<div class="flex flex-col gap-4">
  <h1>All Categories</h1>

  <div class="grid grid-cols-3 gap-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
    {#each recipeTags as tag}
      <a
        href="/tag/{tag.title}"
        class="hover:text-primary flex flex-col gap-2 transition duration-300"
      >
        <div
          class="bg-input hover:bg-accent-gray table h-[120px] w-[120px] place-self-center rounded-full transition duration-300"
        >
          <div class="table-cell place-self-center text-center align-middle text-7xl">
            {tag.emoji || tag.title.charAt(0).toUpperCase()}
          </div>
        </div>
        <div class="place-self-center">{tag.title}</div>
      </a>
    {/each}
  </div>
</div>

<div class="text-center text-lg">
  Please add more tags <a
    class="underline"
    href="https://github.com/github-tijlxyz/nostr.cooking/blob/main/src/lib/consts.ts#L23">here</a
  >
</div>
