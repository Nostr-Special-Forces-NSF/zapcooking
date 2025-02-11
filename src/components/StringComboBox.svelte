<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Button from './Button.svelte';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import { slide } from 'svelte/transition';

  export let selected: Writable<string[]>;
  export let placeholder: string;
  export let showIndex: boolean = false;

  let inputNewThing: string = '';
  let editingIndex: number | null = null;

  function removeTag(index: number) {
    selected.update((items) => items.filter((_, i) => i !== index));
  }

  function addTag() {
    if (inputNewThing.trim()) {
      selected.update((items) => [...items, inputNewThing.trim()]);
      inputNewThing = '';
    }
  }

  function moveTagUp(index: number) {
    selected.update((items) => {
      if (index > 0) {
        const updatedItems = [...items];
        [updatedItems[index], updatedItems[index - 1]] = [
          updatedItems[index - 1],
          updatedItems[index]
        ];
        return updatedItems;
      }
      return items;
    });
  }

  function moveTagDown(index: number) {
    selected.update((items) => {
      if (index < items.length - 1) {
        const updatedItems = [...items];
        [updatedItems[index], updatedItems[index + 1]] = [
          updatedItems[index + 1],
          updatedItems[index]
        ];
        return updatedItems;
      }
      return items;
    });
  }

  function startEditing(index: number) {
    const item = $selected[index];
    editingIndex = index;
  }

  function saveEditing() {
    if (editingIndex !== null) {
      editingIndex = null;
      inputNewThing = '';
    }
  }

  function cancelEditing() {
    editingIndex = null;
    inputNewThing = '';
  }

  function adjustHeight(event: Event) {
    const el = event.target as HTMLTextAreaElement | null;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }
</script>

<div class="mb-0 flex flex-col gap-2">
  {#if $selected.length > 0}
    <ul class="flex flex-col gap-2">
      {#each $selected as tag, index}
        <li class="input" transition:slide|global={{ duration: 300 }}>
          {#if editingIndex === index}
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <textarea
                  class="input h-auto w-full"
                  bind:value={tag}
                  {placeholder}
                  on:input={adjustHeight}
                  style="min-height: 40px;"
                ></textarea>
              </div>
              <div class="flex gap-2">
                <Button class="shrink-0" on:click={saveEditing}>Save</Button>
                <Button class="shrink-0" on:click={cancelEditing}>Cancel</Button>
              </div>
            </div>
          {:else}
            <div class="flex gap-2">
              <span class="grow" on:dblclick={() => startEditing(index)} role="button" tabindex="-1"
                >{tag}</span
              >
              <div class="flex gap-2">
                {#if showIndex && index > 0}
                  <button
                    type="button"
                    class="rounded-sm px-2 py-[0.05rem]"
                    on:click={() => moveTagUp(index)}
                  >
                    ↑
                  </button>
                {/if}
                {#if showIndex && index < $selected.length - 1}
                  <button
                    type="button"
                    class="rounded-sm px-2 py-[0.05rem]"
                    on:click={() => moveTagDown(index)}
                  >
                    ↓
                  </button>
                {/if}
                <button
                  type="button"
                  class="text-danger self-center"
                  on:click={() => removeTag(index)}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  <div class="flex gap-2">
    <input bind:value={inputNewThing} class="input grow" {placeholder} />
    <Button on:click={addTag} primary={false}>Add</Button>
  </div>
</div>
