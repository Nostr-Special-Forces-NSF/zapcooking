<script lang="ts">
	import type { Writable } from 'svelte/store';
	import Button from './Button.svelte';
	import TrashIcon from 'phosphor-svelte/lib/Trash';
	import { slide } from 'svelte/transition';
  
	let amount = '';
	let ingredient = '';
	export let selected: Writable<Array<[string, string]>>;
	export let showIndex: boolean = false;
	export let amountPlaceholder: string = 'Amount (e.g., 2 cups)';
	export let ingredientPlaceholder: string = 'Ingredient (e.g., sugar)';
  
	function removeItem(index: number) {
	  let nSelected = $selected;
	  if (index < 0 || index >= nSelected.length) {
		return; // Index out of bounds
	  }
  
	  nSelected = [...nSelected.slice(0, index), ...nSelected.slice(index + 1)];
	  selected.set(nSelected);
	}
  
	function addItem() {
	  let nSelected = $selected;
	  if (amount && ingredient) {
		nSelected.push([amount, ingredient]);
		selected.set(nSelected);
		amount = '';
		ingredient = '';
	  }
	}
  
	function moveItemUp(index: number) {
	  let nSelected = $selected;
	  if (index > 0) {
		const temp = nSelected[index];
		nSelected[index] = nSelected[index - 1];
		nSelected[index - 1] = temp;
		selected.set(nSelected);
	  }
	}
  
	function moveItemDown(index: number) {
	  let nSelected = $selected;
	  if (index < nSelected.length - 1) {
		const temp = nSelected[index];
		nSelected[index] = nSelected[index + 1];
		nSelected[index + 1] = temp;
		selected.set(nSelected);
	  }
	}
  </script>
  
  <div class="mb-0">
	{#if $selected.length > 0}
	  <ul class="flex flex-col gap-2">
		{#each $selected as [amount, ingredient], index}
		  <li class="flex input" transition:slide|global={{ duration: 300 }}>
			<span class="grow">{amount} {ingredient}</span>
			<div class="flex gap-2">
			  {#if showIndex && index > 0}
				<button
				  type="button"
				  class="px-2 py-[0.05rem] rounded"
				  on:click={() => moveItemUp(index)}
				>
				  ↑
				</button>
			  {/if}
			  {#if showIndex && index < $selected.length - 1}
				<button
				  type="button"
				  class="px-2 py-[0.05rem] rounded"
				  on:click={() => moveItemDown(index)}
				>
				  ↓
				</button>
			  {/if}
			  <button class="self-center text-danger" on:click={() => removeItem(index)}>
				<TrashIcon />
			  </button>
			</div>
		  </li>
		{/each}
	  </ul>
	{/if}
  </div>
  
  <form on:submit|preventDefault={addItem} class="flex gap-2">
	<input bind:value={amount} class="input grow" placeholder={amountPlaceholder} />
	<input bind:value={ingredient} class="input grow" placeholder={ingredientPlaceholder} />
	<Button on:click={addItem} primary={false}>Add</Button>
  </form>
  