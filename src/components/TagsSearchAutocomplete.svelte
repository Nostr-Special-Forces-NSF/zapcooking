<script lang="ts">
  import { onMount } from 'svelte';
  import { type recipeTagSimple } from '$lib/consts';

  const maxAutocompleteOptions = 7;

  export let placeholderString: string;
  export let autofocus = false;
  export let action: (query: string) => void;
  export let recipeTags: recipeTagSimple[] = [];

  let tagquery = '';
  let filteredTags: recipeTagSimple[] = [];
  let showAutocomplete = false;
  let inputFocused = false;

  function handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    tagquery = input.value.toLowerCase();

    filteredTags = recipeTags
      .map((tag) => ({
        tag,
        relevancy: tag.title.toLowerCase().split(tagquery).length - 1
      }))
      .sort((a, b) => {
        // Sort by relevancy (more exact matches come first)
        if (a.relevancy > b.relevancy) return -1;
        if (a.relevancy < b.relevancy) return 1;
        return 0;
      })
      .map((item) => item.tag)
      .slice(0, 512);

    showAutocomplete = tagquery.length > 0 && (inputFocused || autofocus);
    console.debug(showAutocomplete, tagquery, inputFocused);

    // Listen for mousedown events on the autocomplete items to prevent event propagation
    const autocompleteItems = document.querySelectorAll('.autocomplete-item');
    autocompleteItems.forEach((item) => {
      item.addEventListener('mousedown', (event) => {
        event.stopPropagation();
      });
    });
  }

  function handleInputFocus() {
    inputFocused = true;
    showAutocomplete = tagquery.length > 0;
  }

  function handleInputBlur() {
    // Close autocomplete on blur
    inputFocused = false;

    // Delay setting showAutocomplete to false to allow click events to propagate
    setTimeout(() => {
      showAutocomplete = false;
    }, 200);
  }

  let inputElement: HTMLInputElement;

  onMount(() => {
    // Initialize filteredTags with all tags on component mount
    filteredTags = recipeTags.slice(0, maxAutocompleteOptions);
    if (autofocus) inputElement?.focus();
  });
</script>

<div class="relative flex-1">
  <form
    class="bg-input flex rounded-xl shadow-xs"
    on:submit|preventDefault={() => {
      if (tagquery) {
        action(tagquery);
        tagquery = '';
      }
    }}
  >
    <div class="mx-0.5 flex grow items-stretch focus-within:z-10">
      <input
        bind:value={tagquery}
        on:input={handleInputChange}
        on:focus={handleInputFocus}
        on:blur={handleInputBlur}
        class="input block w-full"
        placeholder={placeholderString}
        bind:this={inputElement}
      />
    </div>
    <input type="submit" class="hidden" />
  </form>
  {#if showAutocomplete && filteredTags.length > 0}
    <ul
      class="absolute top-full left-0 z-60 mt-1 max-h-[256px] w-full overflow-y-scroll rounded-xl border border-gray-300 bg-white shadow-lg"
    >
      {#each filteredTags as tag (tag.title)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <li
          on:click={() => {
            tagquery = tag.title;
            action(tagquery);
            tagquery = '';
          }}
          class="autocomplete-item cursor-pointer p-2 hover:bg-gray-100"
        >
          {#if tag.emoji}
            <span>{tag.emoji} </span>
          {/if}
          {tag.title}
        </li>
      {/each}
    </ul>
  {/if}
</div>
