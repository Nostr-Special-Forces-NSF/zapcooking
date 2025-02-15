<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Button from './Button.svelte';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import { slide } from 'svelte/transition';

  export let selected: Writable<[string, string][]>;
  export let showIndex: boolean = false;
  export let amountPlaceholder: string = 'Amount (e.g., 2 cups)';
  export let ingredientPlaceholder: string = 'Ingredient (e.g., sugar)';

  let amount: string = '';
  let ingredient: string = '';
  let editingIndex: number | null = null;

  function removeItem(index: number) {
    selected.update((items) => items.filter((_, i) => i !== index));
  }

  function addItem() {
    if (amount.trim() && ingredient.trim()) {
      selected.update((items) => [...items, [amount.trim(), ingredient.trim()]]);
      amount = '';
      ingredient = '';
    }
  }

  function moveItemUp(index: number) {
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

  function moveItemDown(index: number) {
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
    amount = item[0];
    ingredient = item[1];
    editingIndex = index;
  }

  function saveEditing() {
    if (editingIndex !== null) {
      editingIndex = null;
      amount = '';
      ingredient = '';
    }
  }

  function cancelEditing() {
    editingIndex = null;
    amount = '';
    ingredient = '';
  }
</script>

<div class="mb-0">
  {#if $selected.length > 0}
    <ul class="flex flex-col gap-2">
      {#each $selected as [amount, ingredient], index}
        <li class="input flex" transition:slide|global={{ duration: 300 }}>
          {#if editingIndex === index}
            <div class="flex grow gap-2">
              <input class="input" bind:value={amount} placeholder={amountPlaceholder} />
              <input class="input" bind:value={ingredient} placeholder={ingredientPlaceholder} />
            </div>
            <div class="flex gap-2">
              <Button on:click={saveEditing}>Save</Button>
              <Button on:click={cancelEditing}>Cancel</Button>
            </div>
          {:else}
            <span class="grow" on:dblclick={() => startEditing(index)} role="button" tabindex="-1"
              >{amount} {ingredient}</span
            >
            <div class="flex gap-2">
              {#if showIndex && index > 0}
                <button
                  type="button"
                  class="rounded-sm px-2 py-[0.05rem]"
                  on:click={() => moveItemUp(index)}
                >
                  ↑
                </button>
              {/if}
              {#if showIndex && index < $selected.length - 1}
                <button
                  type="button"
                  class="rounded-sm px-2 py-[0.05rem]"
                  on:click={() => moveItemDown(index)}
                >
                  ↓
                </button>
              {/if}
              <button
                type="button"
                class="text-danger self-center"
                on:click={() => removeItem(index)}
              >
                <TrashIcon />
              </button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<form on:submit|preventDefault={addItem} class="flex gap-2">
  <input bind:value={amount} class="input grow" placeholder={amountPlaceholder} />
  <input bind:value={ingredient} class="input grow" placeholder={ingredientPlaceholder} />
  <button type="submit" class="btn">Add</button>
</form>
