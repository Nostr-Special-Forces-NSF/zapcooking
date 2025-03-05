<script lang="ts">
  import { get, writable, type Writable } from 'svelte/store';
  import { parseMarkdown } from '$lib/marked';
  import Button from './Button.svelte';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import { slide } from 'svelte/transition';
  import MarkdownToolbar from './MarkdownToolbar.svelte';

  export let isEditing: boolean = false;
  export let content: Writable<string>;
  let markdownLines: Writable<string[]> = writable(splitByOrderedList($content));

  // For editing lines individually
  let editingIndex: number | null = null;
  let editingValue = writable('');
  let editingContainer: HTMLDivElement | null = null;

  // For the single-line "textarea" we show on row editing
  let userInput = writable(''); // The content of that row while editing

  // Keep a combined string for preview
  let combinedMarkdown: string;
  let combinedRenderedMarkdown: string;
  // The rendered result for each line
  let renderedLines: Writable<string[]> = writable([]);

  let preview = false; // Toggles preview mode

  /**
   * Splits a Markdown string into an array of "chunks," starting a new chunk
   * whenever a line begins with a typical ordered-list pattern like "1. " or "2) ".
   *
   * Example:
   *   "Hello\n1. Step one\nMore text\n2. Step two\nEven more text"
   * becomes:
   *   [
   *     "Hello",
   *     "1. Step one\nMore text",
   *     "2. Step two\nEven more text"
   *   ]
   */
  export function splitByOrderedList(markdown: string): string[] {
    // Split into lines (handling Windows \r\n too)
    const lines = markdown.split(/\r?\n/);
    const result: string[] = [];
    let currentChunk = '';
    // Regex to detect lines that start with:
    //   1. or 1) or 2. or 2) etc.
    //   e.g. "^\d+(\.|\))\s+"
    const orderedListRegex = /^[0-9]+(\.|\))/;

    for (const line of lines) {
      // Trim left for consistency (optional, if you want exact line starts)
      const trimmedLine = line;
      // Check if this line starts with an ordered-list pattern
      if (orderedListRegex.test(trimmedLine)) {
        // If we already have text in currentChunk, push it to results
        if (currentChunk.trim()) {
          result.push(currentChunk.trimEnd());
        }
        // Start a new chunk with this line
        currentChunk = line;
      } else {
        // Continue adding lines to the current chunk
        if (currentChunk.length === 0) {
          // If it's the first line in the chunk
          currentChunk = line;
        } else {
          currentChunk += '\n' + line;
        }
      }
    }
    // Push any leftover chunk
    if (currentChunk.trim()) {
      result.push(currentChunk.trimEnd());
    }
    return result;
  }

  $: if ($content) {
    markdownLines.set(splitByOrderedList($content));
    reRenderLines();
  }

  async function reRenderLines() {
    const linesArray = $markdownLines;
    const result: string[] = [];
    for (let line of linesArray) {
      let rline = await parseMarkdown(line);
      result.push(rline);
    }
    renderedLines.set(result);
    combinedMarkdown = get(markdownLines).join('\n');
    combinedRenderedMarkdown = await parseMarkdown(combinedMarkdown);
  }

  function startEditing(index: number) {
    editingIndex = index;
    editingValue.set($markdownLines[index].trim() || '');
  }

  function saveEditing() {
    if (editingIndex === null) return;

    const orderedListRegex = /^[0-9]+(\.|\))\s+/;
    let addLine = $editingValue.split('\n');
    const newLine = addLine.map((l, i) =>
      orderedListRegex.test(l) ? (i > 0 ? `    ${l}` : l) : i > 0 ? l : `${editingIndex! + 1}. ${l}`
    );
    console.log(newLine);

    markdownLines.update((lines) => {
      const updated = [...lines];
      updated[editingIndex!] = newLine.join('\n');
      return updated;
    });

    // Reconstruct the entire content
    const newLines = $markdownLines.join('\n');
    content.set(newLines);
    editingIndex = null;
    editingValue.set('');
  }

  function cancelEditing() {
    editingIndex = null;
    editingValue.set('');
  }

  /**
   * Add a new line using the chosen transform
   */
  function addLine() {
    const orderedListRegex = /^[0-9]+(\.|\))\s+/;
    let addLine = $userInput.split('\n');
    const newLine = addLine.map((l, i) =>
      orderedListRegex.test(l)
        ? i > 0
          ? `    ${l}`
          : l
        : i > 0
          ? l
          : `${$markdownLines.length + 1}. ${l}`
    );
    console.log(newLine);
    content.update((c) => `${c}\n${newLine.join('\n')}`);
    userInput.set('');
  }

  function removeLine(index: number) {
    markdownLines.update((lines) => lines.filter((_, i) => i !== index));
    content.set($markdownLines.join('\n'));
  }
</script>

<!-- MAIN COMPONENT UI -->
<div class="mb-0">
  <!-- Existing lines (each line is editable) -->
  {#if $markdownLines.length > 0}
    <ul class="direction-steps flex flex-col gap-2">
      {#each $markdownLines as line, index}
        <li class="input flex items-start" transition:slide|global={{ duration: 300 }}>
          {#if editingIndex === index}
            <!-- Edit mode for this line -->
            <div class="editor-container" bind:this={editingContainer}>
              <MarkdownToolbar content={editingValue} textareaId={'editing-area-' + index} />
              <textarea
                class="input h-auto w-full"
                id={'editing-area-' + index}
                bind:value={$editingValue}
                style="min-height: 100px;"
              ></textarea>
              <div class="mt-2 flex gap-2">
                <Button on:click={saveEditing}>Save</Button>
                <Button on:click={cancelEditing}>Cancel</Button>
              </div>
            </div>
          {:else}
            <!-- Display mode for this line -->
            <div class="flex w-full items-center gap-2">
              <span
                class="step-preview grow cursor-pointer"
                on:dblclick={() => startEditing(index)}
                role="button"
                tabindex="-1"
                title="Double Click to edit Direction Step"
              >
                {@html $renderedLines[index]}
              </span>
              <button
                type="button"
                class="text-danger shrink-0 cursor-pointer self-center"
                on:click={() => removeLine(index)}
                title="Delete Direction Step"
              >
                <TrashIcon />
              </button>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Add new line form -->
  <div class="mt-4 mb-4 flex flex-col items-end gap-2 md:flex-row">
    <!-- Edit/Preview Container -->
    <div class="editor-container">
      <!-- Markdown Editor or Preview -->
      {#if preview}
        <!-- Show combined rendered preview -->
        <div class="prose">
          {@html combinedRenderedMarkdown}
        </div>
        <div class="flex gap-2">
          <Button on:click={() => (preview = !preview)}>Edit</Button>
        </div>
      {:else}
        <MarkdownToolbar content={userInput} textareaId={'editing-area-35000'} />
        <textarea
          id="editing-area-35000"
          class="input"
          bind:value={$userInput}
          style="min-height: 150px;"
        ></textarea>
        <div class="flex gap-2">
          <Button on:click={addLine}>Add</Button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .editor-container {
    border-radius: 6px;
    font-family: Arial, sans-serif;
    width: 100%;
    max-width: 800px;
    margin: auto;
  }

  textarea {
    width: 100%;
    border: none;
    padding: 10px;
    font-size: 14px;
    resize: vertical;
    outline: none;
    line-height: 1.4;
    field-sizing: content;
  }
</style>
