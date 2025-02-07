<script lang="ts">
  import type { Writable } from 'svelte/store';
  import ImageUploader from './ImageUploader.svelte';
  import StringComboBox from './StringComboBox.svelte';

  export let uploadedImages: Writable<string[]>;
  // 0 is unlimited, and anything above that has a hard limit.
  export let limit = 0;

  function removeImage(index: number) {
    let nSelected = $uploadedImages;
    if (index < 0 || index >= nSelected.length) {
      return; // Index out of bounds
    }

    nSelected = [...nSelected.slice(0, index), ...nSelected.slice(index + 1)];
    uploadedImages.set(nSelected);
  }

  function addImage(url: string) {
    if (limit > 0 && $uploadedImages.length > limit) return; // forbid if limit is hit.
    let nSelected = $uploadedImages;
    nSelected.push(url);
    uploadedImages.set(nSelected);
    return true;
  }

  let refresh = {};
</script>

{#key refresh}
  <div class="sm:col-span-6">
    <div class="mt-1">
      <ImageUploader setUrl={(a) => addImage(a) && (refresh = {})} />
    </div>
    <div class="mt-4 flex flex-col gap-4">
      <StringComboBox placeholder="Or input an existing URL" selected={uploadedImages} />
    </div>
  </div>
{/key}

<div class="mb-2">
  {#if $uploadedImages.length > 0}
    <ul class="mt-1 rounded-lg border border-gray-300 bg-white">
      {#each $uploadedImages as image, index}
        <li class="flex items-center justify-between p-2 hover:bg-gray-100">
          <div class="flex items-center">
            <img class="rounded-sm" src={image} alt="Uploaded" />
          </div>
          <button
            type="button"
            class="ml-2 rounded-sm bg-red-500 px-3 py-[0.05rem] text-white hover:bg-red-600"
            on:click={() => removeImage(index)}
          >
            X
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
