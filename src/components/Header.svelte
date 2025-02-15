<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from './Button.svelte';
  import { Avatar } from '@nostr-dev-kit/ndk-svelte-components';
  import { ndk, userPublickey } from '$lib/nostr';
  import SVGNostrCookingWithText from '../assets/nostr.cooking-withtext.svg';
  import UserIcon from 'phosphor-svelte/lib/User';
  import GearIcon from 'phosphor-svelte/lib/Gear';
  import AddIcon from 'phosphor-svelte/lib/Plus';
  import SignOutIcon from 'phosphor-svelte/lib/SignOut';
  import SearchIcon from 'phosphor-svelte/lib/MagnifyingGlass';
  import BookmarkIcon from 'phosphor-svelte/lib/Bookmark';
  import { nip19 } from 'nostr-tools';
  import { clickOutside } from '$lib/clickOutside';
  import { fade, blur } from 'svelte/transition';
  import TagsSearchAutocomplete from './TagsSearchAutocomplete.svelte';

  let dropdownActive = false;
  let searchActive = false;

  function openTag(query: string) {
    searchActive = false;
    if (query.startsWith('npub')) {
      goto(`/user/${query}`);
    } else if (query.startsWith('naddr')) {
      goto(`/recipe/${query}`);
    } else {
      goto(`/tag/${query}`);
    }
  }

  function logout() {
    localStorage.removeItem('nostrcooking_loggedInPublicKey');
    localStorage.removeItem('nostrcooking_privateKey');
    userPublickey.set('');
    setTimeout(() => (window.location.href = ''), 1);
  }
</script>

{#if searchActive}
  <div
    class="bg-opacity-50 fixed top-0 left-0 z-20 h-full w-full backdrop-blur-xs transition-opacity duration-500"
    transition:blur={{ amount: 10, duration: 300 }}
  >
    <div
      class="fixed inset-x-0 top-20 z-25 mx-auto w-3/4 md:w-1/2 lg:w-1/3"
      use:clickOutside
      on:click_outside={() => (searchActive = false)}
    >
      <TagsSearchAutocomplete
        placeholderString={"Search by tag, like 'italian', 'steak' or 'glutenfree'."}
        action={openTag}
        autofocus={true}
      />
    </div>
  </div>
{/if}

<div class="flex justify-between gap-9">
  <a href="/recent" class="flex-none">
    <img src={SVGNostrCookingWithText} class="my-3 w-40" alt="Nostr.Cooking Logo With Text" />
  </a>

  <div class="hidden gap-10 self-center font-semibold lg:flex">
    <a class="hover:text-primary transition duration-300" href="/recent">Discover</a>
    <a class="hover:text-primary transition duration-300" href="/tags">Categories</a>
  </div>

  <div class="hidden flex-1 grow self-center sm:flex">
    <TagsSearchAutocomplete
      placeholderString={"Search by tag, like 'italian', 'steak' or 'glutenfree'."}
      action={openTag}
    />
  </div>
  <div class="flex flex-none gap-4 self-center">
    <div class="block self-center sm:hidden">
      <!-- for some reason if i have all of these selector classes then it styles correctly. wtf. -->
      <Button
        class="flex self-center bg-[#FFECE8]! font-semibold max-md:h-10 max-md:w-10 max-md:justify-center max-md:px-1 max-md:py-1"
        on:click={() => (searchActive = true)}
      >
        <SearchIcon class="text-primary self-center" size={16} weight="bold" />
      </Button>
    </div>
    {#if $userPublickey !== ''}
      <a
        class="hover:text-primary hidden gap-2 self-center font-semibold transition duration-300 lg:flex"
        href="/bookmarks"
      >
        <BookmarkIcon class="self-center" size="30px" weight="bold" />
        <span class="self-center">Bookmarks</span>
      </a>
      <Button
        class="flex gap-2 self-center font-semibold max-md:h-10 max-md:w-10 max-md:justify-center max-md:px-1 max-md:py-1"
        on:click={() => goto('/create')}
      >
        <AddIcon class="self-center" size={16} />
        <div class="hidden md:flex">Add Recipe</div>
      </Button>
    {/if}
    <div class="self-center">
      {#if $userPublickey !== ''}
        <button class="flex self-center" on:click={() => (dropdownActive = !dropdownActive)}>
          <Avatar
            class="h-12 w-12 cursor-pointer rounded-full object-center"
            ndk={$ndk}
            pubkey={$userPublickey}
          />
        </button>
        {#if dropdownActive}
          <div class="relative z-20" transition:fade={{ delay: 0, duration: 150 }}>
            <div
              role="button"
              tabindex="-1"
              on:click={() => (dropdownActive = false)}
              on:keydown={(e) => e.key === 'Escape' && (dropdownActive = false)}
              use:clickOutside
              on:click_outside={() => (dropdownActive = false)}
              class="absolute right-3 z-10 flex flex-col gap-4 rounded-3xl bg-white px-5 py-6 drop-shadow-sm"
            >
              <button
                class="flex cursor-pointer gap-2"
                on:click={() => goto(`/user/${nip19.npubEncode($userPublickey)}`)}
              >
                <UserIcon class="self-center" size={18} />
                Profile
              </button>
              <button class="flex cursor-pointer gap-2" on:click={() => goto('/settings')}>
                <GearIcon class="self-center" size={18} />
                Settings
              </button>
              <button class="flex cursor-pointer gap-2" on:click={logout}>
                <SignOutIcon class="self-center" size={18} />
                Log out
              </button>
            </div>
          </div>
        {/if}
      {:else}
        <Button on:click={() => goto('/login')} class="font-semibold" primary={false}
          >Sign in</Button
        >
      {/if}
    </div>
  </div>
</div>
