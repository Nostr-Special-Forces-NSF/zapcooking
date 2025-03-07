<script lang="ts">
  import { browser } from '$app/environment';
  import { standardRelays } from '$lib/consts';
  import { translateOption } from '$lib/state';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import WarningIcon from 'phosphor-svelte/lib/Warning';
  import Button from '../../components/Button.svelte';
  import { nip19 } from 'nostr-tools';

  let relays: string[] = [];
  let newRelay = '';
  let translation = '';
  let translationLanguage = '';
  let translationOption = '';

  function removeRelay(index: number) {
    relays.splice(index, 1);
    relays = [...relays];
  }

  function addRelay() {
    if (newRelay) {
      relays.push(newRelay);
      newRelay = '';
      relays = [...relays];
    }
  }

  function saveData() {
    addRelay();
    if (translation !== '' && translationLanguage !== '') {
      if (translation == 'google' && translationOption == '') {
        translationOption = 'https://corsproxy.io/?';
      }
      if (translation == 'libretranslate' && translationOption == '') {
        translationOption = 'https://libretranslate.de';
      }
      localStorage.setItem(
        'nostrcooking_translationOptions',
        JSON.stringify({ option: translation, lang: translationLanguage, data: translationOption })
      );
    } else {
      localStorage.removeItem('nostrcooking_translationOptions');
    }
    if (relays !== standardRelays) {
      localStorage.setItem('nostrcooking_relays', JSON.stringify(relays));
    }
    setTimeout(() => {
      window.location.href = '';
    }, 1);
  }

  if (browser) {
    const a = localStorage.getItem('nostrcooking_relays');
    if (a) {
      relays = JSON.parse(a);
    } else {
      relays = standardRelays;
    }
    translation = $translateOption.option;
    translationLanguage = $translateOption.lang;
    translationOption = $translateOption.data;
  }

  let showPrivkey = false;
  const sk = localStorage.getItem('nostrcooking_privateKey');
</script>

<svelte:head>
  <title>zap.cooking settings</title>
</svelte:head>

<div class="flex flex-col gap-5">
  <h1>Settings</h1>
  <div class="flex flex-col gap-4">
    <h2>Relays</h2>
    <div class="flex flex-col gap-2">
      {#each relays as relay, index}
        <div class="bg-input flex rounded-xl p-3">
          <span class="grow">{relay}</span>
          <button class="text-danger self-center" on:click={() => removeRelay(index)}>
            <TrashIcon />
          </button>
        </div>
      {/each}
      <div class="mx-0.5 flex gap-4">
        <input
          bind:value={newRelay}
          placeholder="wss://relay.example.com"
          class="bg-input flex rounded-xl border-none p-3"
        />
        <Button on:click={addRelay} primary={false}>Add</Button>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-4">
    <h2>Translation</h2>
    <div class="mx-0.5 flex flex-col gap-4">
      <select bind:value={translation} class="bg-input flex rounded-xl border-none p-3">
        <option value="">Disabled</option>
        <option value="google">Google Translate (with proxy)</option>
        <!--<option value="libretranslate">Libretranslate Instance</option>-->
      </select>
      {#if translation !== ''}
        <input
          bind:value={translationLanguage}
          placeholder="2 letter language code, like: 'en', 'es', 'fr' ect"
          class="bg-input flex rounded-xl border-none p-3"
        />
        <input
          bind:value={translationOption}
          placeholder={(translation == 'google'
            ? 'set CORS proxy url,'
            : translation == 'libretranslate'
              ? 'libretranslate instance url,'
              : '') + ' leave blank for default'}
          class="bg-input flex rounded-xl border-none p-3"
        />
      {/if}
    </div>
    {#if translation !== ''}
      Warning: You may leak data to third parties while using this.
    {/if}
  </div>

  <Button on:click={saveData}>Save</Button>
  <hr />

  <div class="flex flex-col gap-5">
    <h2>Danger</h2>
    {#if sk}
      <h3>Account Private Key</h3>
      <div>
        <div>
          Your Account's Private Key. <span class="text-danger font-bold"
            >DO NOT SHOW THIS TO ANYONE ELSE!</span
          >
        </div>
        <div
          role="button"
          tabindex="0"
          on:keydown={() => (showPrivkey = true)}
          on:click={() => (showPrivkey = true)}
          class="input border-accent-gray! flex flex-wrap border-2! text-wrap break-all"
        >
          {#if showPrivkey}
            {nip19.nsecEncode(sk)}
          {:else}
            Click to show your private key
          {/if}
        </div>
        {#if showPrivkey}
          <button on:click={() => (showPrivkey = false)}>Click here to hide.</button>
        {/if}
      </div>
    {/if}
    <h3>Clear all Data</h3>
    <Button
      class="bg-danger! flex gap-2 self-start"
      primary={false}
      on:click={() => (window.location.href = '/clearall')}
    >
      <WarningIcon class="self-center" />
      Clear all data
    </Button>
  </div>
</div>
