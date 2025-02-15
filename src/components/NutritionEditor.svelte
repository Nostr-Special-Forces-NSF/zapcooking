<script lang="ts">
  import { type Writable } from 'svelte/store';
  import Button from './Button.svelte';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import { slide } from 'svelte/transition';

  // Define the types we can add
  const nutritionTypes = [
    { key: 'calories', label: 'Calories', emoji: '🔥' },
    { key: 'carbohydrate_content', label: 'Carbohydrates', emoji: '🍞' },
    { key: 'protein_content', label: 'Protein', emoji: '🍗' },
    { key: 'fat_content', label: 'Fat', emoji: '🥑' },
    { key: 'saturated_fat_content', label: 'Saturated Fat', emoji: '🧈' },
    { key: 'cholesterol_content', label: 'Cholestrerol', emoji: '🫀' },
    { key: 'sodium_content', label: 'Sodium', emoji: '🧂' },
    { key: 'fiber_content', label: 'Fiber', emoji: '🌾' },
    { key: 'sugar_content', label: 'Sugar', emoji: '🍭' },
    { key: 'serving_size', label: 'Serving Size', emoji: '🍽️' }
  ];

  /**
   * A writable dictionary (Record) of nutrition entries, e.g.:
   * {
   *   "calories": "200 kcal",
   *   "proteinContent": "25 g",
   *   ...
   * }
   */
  export let nutritionValues: Writable<Record<string, string>>;

  // For adding a new entry
  let newTypeKey: string = '';
  let newValue: string = '';

  // For editing an existing entry
  let editingKey: string | null = null; // which key is being edited
  let editingValue: string = ''; // temporary edited value

  /**
   * Add a new nutrition entry (if it doesn't already exist).
   */
  function addNutrition() {
    if (!newTypeKey || !newValue.trim()) return;

    // If that key doesn't exist, add or overwrite it
    nutritionValues.update((dict) => {
      dict[newTypeKey] = newValue.trim();
      return { ...dict };
    });

    // Reset form
    newTypeKey = '';
    newValue = '';
  }

  /**
   * Remove an existing nutrition entry.
   */
  function removeNutrition(key: string) {
    nutritionValues.update((dict) => {
      delete dict[key];
      return { ...dict };
    });
  }

  /**
   * Start editing an existing item when user double clicks
   */
  function startEditing(key: string) {
    editingKey = key;
    editingValue = $nutritionValues[key] || '';
  }

  /**
   * Save the edits and reset editing state
   */
  function saveEditing() {
    if (editingKey !== null) {
      nutritionValues.update((dict) => {
        dict[editingKey!] = editingValue.trim();
        return { ...dict };
      });
    }
    editingKey = null;
    editingValue = '';
  }

  /**
   * Cancel editing (revert changes).
   */
  function cancelEditing() {
    editingKey = null;
    editingValue = '';
  }
</script>

<!-- Existing items -->
{#if Object.keys($nutritionValues).length > 0}
  <ul class="mb-4 flex flex-col gap-2">
    {#each Object.entries($nutritionValues) as [key, value]}
      <li class="input flex items-center" transition:slide|global={{ duration: 300 }}>
        {#if editingKey === key}
          <!-- Edit mode -->
          <div class="flex grow gap-2">
            <span class="flex items-center gap-1">
              {nutritionTypes.find((nt) => nt.key === key)?.emoji}
              {nutritionTypes.find((nt) => nt.key === key)?.label}
            </span>
            <input
              type="text"
              class="input w-32 text-right"
              bind:value={editingValue}
              placeholder="Value"
            />
          </div>
          <div class="flex gap-2">
            <Button on:click={saveEditing}>Save</Button>
            <Button on:click={cancelEditing}>Cancel</Button>
          </div>
        {:else}
          <!-- Display mode -->
          <span class="flex grow items-center gap-1">
            {#if nutritionTypes.find((nt) => nt.key === key)?.emoji}
              <span>{nutritionTypes.find((nt) => nt.key === key)?.emoji}</span>
            {/if}
            <div
              role="button"
              tabindex="0"
              on:dblclick={() => startEditing(key)}
              class="cursor-pointer"
            >
              {nutritionTypes.find((nt) => nt.key === key)?.label || key}:
            </div>
            <div
              role="button"
              tabindex="0"
              on:dblclick={() => startEditing(key)}
              class="cursor-pointer"
            >
              {value}
            </div>
          </span>
          <button
            type="button"
            class="text-danger self-center"
            on:click={() => removeNutrition(key)}
          >
            <TrashIcon />
          </button>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<!-- Add a new item form -->
<form on:submit|preventDefault={addNutrition} class="flex flex-col gap-2 md:flex-row md:items-end">
  <!-- Choose a type that hasn't been used yet -->
  <select class="input w-full md:w-auto" bind:value={newTypeKey}>
    <option value="" disabled selected>Select a Nutrition Type</option>
    {#each nutritionTypes as nt}
      {#if !$nutritionValues[nt.key]}
        <option value={nt.key}>
          {nt.emoji}
          {nt.label}
        </option>
      {/if}
    {/each}
  </select>

  <!-- Input for the new value -->
  <input
    type="text"
    class="input w-full md:w-auto"
    bind:value={newValue}
    placeholder="Value (e.g. '200 kcal')"
  />

  <button type="submit" class="btn md:ml-2">Add</button>
</form>
