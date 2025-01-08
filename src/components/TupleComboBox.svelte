<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import Button from './Button.svelte';
	import TrashIcon from 'phosphor-svelte/lib/Trash';
	import { slide } from 'svelte/transition';
  
	export let selected: Writable<[string, string][]>; // Array of tuples [amount, ingredient]
	export let placeholderAmount: string;
	export let placeholderIngredient: string;
  
	let editingIndex: number | null = null;
	let inputAmount: string = '';
	let inputIngredient: string = '';
  
	function addTuple() {
	  if (inputAmount.trim() && inputIngredient.trim()) {
		selected.update(items => [...items, [inputAmount, inputIngredient]]);
		inputAmount = '';
		inputIngredient = '';
	  }
	}
  
	function removeTuple(index: number) {
	  selected.update(items => items.filter((_, i) => i !== index));
	}
  
	function startEditing(index: number) {
	  const item = $selected[index];
	  inputAmount = item[0];
	  inputIngredient = item[1];
	  editingIndex = index;
	}
  
	function saveEditing() {
	  if (editingIndex !== null) {
		selected.update(items =>
		  items.map((item, i) => (i === editingIndex ? [inputAmount, inputIngredient] : item))
		);
		editingIndex = null;
		inputAmount = '';
		inputIngredient = '';
	  }
	}
  
	function cancelEditing() {
	  editingIndex = null;
	  inputAmount = '';
	  inputIngredient = '';
	}
  </script>
  
  <div>
	<ul class="flex flex-col gap-2">
	  {#each $selected as [amount, ingredient], index}
		<li
		  class="flex items-center gap-4 input"
		  transition:slide|global={{ duration: 300 }}
		>
		  {#if editingIndex === index}
			<div class="flex gap-2 grow">
			  <input
				class="input"
				bind:value={inputAmount}
				placeholder={placeholderAmount}
			  />
			  <input
				class="input"
				bind:value={inputIngredient}
				placeholder={placeholderIngredient}
			  />
			</div>
			<div class="flex gap-2">
			  <Button on:click={saveEditing}>Save</Button>
			  <Button on:click={cancelEditing}>Cancel</Button>
			</div>
		  {:else}
			<div
			  class="grow flex items-center justify-between"
			  on:dblclick={() => startEditing(index)}
			>
			  <span>{amount} - {ingredient}</span>
			</div>
			<Button class="text-danger" on:click={() => removeTuple(index)}>
			  <TrashIcon />
			</Button>
		  {/if}
		</li>
	  {/each}
	</ul>
  
	<form on:submit|preventDefault={addTuple} class="flex gap-2 mt-4">
	  <input
		class="input"
		bind:value={inputAmount}
		placeholder={placeholderAmount}
	  />
	  <input
		class="input"
		bind:value={inputIngredient}
		placeholder={placeholderIngredient}
	  />
	  <Button on:click={addTuple}>Add</Button>
	</form>
  </div>
  