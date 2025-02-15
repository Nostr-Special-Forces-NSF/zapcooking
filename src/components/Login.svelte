<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKNip07Signer, NDKPrivateKeySigner, type NDKUserProfile } from '@nostr-dev-kit/ndk';
  import { nip19 } from 'nostr-tools';
  import { onMount } from 'svelte';

  let showLoginWithPk = false;
  let nsecInput = '';
  let user: NDKUserProfile;

  async function login() {
    if (browser) {
      if (!$ndk.signer) {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
        ndk.set($ndk);
      }
      if ($ndk.signer && $userPublickey == '') {
        const newUserPublicKey = (await $ndk.signer.user()).hexpubkey;
        localStorage.setItem('nostrcooking_loggedInPublicKey', newUserPublicKey);
        $userPublickey = newUserPublicKey;
        userPublickey.set($userPublickey);
      }
    }
  }

  async function loginWithSk() {
    if (browser && nsecInput) {
      let pk = nsecInput;
      if (!$ndk.signer) {
        if (pk.startsWith('nsec1')) {
          pk = nip19.decode(pk).data.toString();
        }
        const signer = new NDKPrivateKeySigner(pk);
        $ndk.signer = signer;
        ndk.set($ndk);
      }
      if ($ndk.signer) {
        localStorage.setItem('nostrcooking_privateKey', pk);
      }
      if ($ndk.signer && $userPublickey == '') {
        const newUserPublicKey = (await $ndk.signer.user()).hexpubkey;
        localStorage.setItem('nostrcooking_loggedInPublicKey', newUserPublicKey);
        $userPublickey = newUserPublicKey;
        userPublickey.set($userPublickey);
      }
    }
  }

  async function logout() {
    localStorage.removeItem('nostrcooking_loggedInPublicKey');
    localStorage.removeItem('nostrcooking_privateKey');
    userPublickey.set('');
    setTimeout(() => (window.location.href = ''), 1);
  }

  onMount(async () => {
    if ($userPublickey !== '') {
      let b = await $ndk.getUser({ hexpubkey: $userPublickey }).fetchProfile();
      if (b) user = b;
    } else {
      userPublickey.subscribe(async (e) => {
        if (e !== '') {
          let b = await $ndk.getUser({ hexpubkey: e }).fetchProfile();
          if (b) user = b;
        }
      });
    }
  });
</script>

{#if $userPublickey == ''}
  <div class="prose mb-2">
    <h1>Welcome</h1>
  </div>
  {#if showLoginWithPk}
    <input
      placeholder="nsec..."
      bind:value={nsecInput}
      class="mb-2 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    />

    <button
      on:click={loginWithSk}
      type="button"
      class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-blue-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
      >Login</button
    >
    <button
      on:click={() => (showLoginWithPk = false)}
      type="button"
      class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-base font-medium text-blue-700 hover:bg-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
      >Cancel</button
    >
  {:else}
    <div class="mb-2">
      <button
        on:click={login}
        type="button"
        class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-blue-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
        >Login with Extention</button
      >
    </div>
    <div class="mb-2">
      <button
        on:click={() => goto('/onboarding')}
        type="button"
        class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-blue-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
        >New to nostr?</button
      >
    </div>
    <div class="mb-2">
      <button
        on:click={() => (showLoginWithPk = true)}
        type="button"
        class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-base font-medium text-blue-700 hover:bg-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
        >Login with private key</button
      >
    </div>

    <div class="text-sm text-gray-700">
      Don't know what this is? Have a look at <a
        class="underline"
        href="https://nostr.how/en/get-started">nostr.how</a
      >.
    </div>
  {/if}
{:else}
  <div class="prose mb-2">
    <h1>Welcome back <a href={`nostr://${nip19.npubEncode($userPublickey)}`}>{user?.name}</a></h1>
    <p>You are logged in as <code>{nip19.npubEncode($userPublickey)}</code></p>
  </div>

  <button
    on:click={logout}
    type="button"
    class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-xs hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-hidden"
    >Logout</button
  >
{/if}
