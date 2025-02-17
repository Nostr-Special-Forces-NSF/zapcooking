<script lang="ts">
  import { get, writable, type Writable } from 'svelte/store';
  import { parseMarkdown } from '$lib/marked';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import { slide } from 'svelte/transition';

  export let content: Writable<string>;
  let markdownLines: Writable<string[]> = writable(splitByOrderedList($content));

  // A list of transformations for quick insert
  const markdownOptions = [
    { label: 'Heading 1', emoji: '🔠', transform: (text: string) => `# ${text}` },
    { label: 'Heading 2', emoji: '🔡', transform: (text: string) => `## ${text}` },
    { label: 'Heading 3', emoji: '🔤', transform: (text: string) => `### ${text}` },
    { label: 'Bold', emoji: '💪', transform: (text: string) => `**${text}**` },
    { label: 'Italic', emoji: '🎨', transform: (text: string) => `_${text}_` },
    { label: 'Strikethrough', emoji: '❌', transform: (text: string) => `~~${text}~~` },
    { label: 'Blockquote', emoji: '💬', transform: (text: string) => `> ${text}` },
    { label: 'Inline Code', emoji: '⚙️', transform: (text: string) => `\`${text}\`` },
    {
      label: 'Code Fence',
      emoji: '💻',
      transform: (text: string) => '```\n' + text + '\n```'
    },
    { label: 'Ordered List', emoji: '🔢', transform: (text: string) => `1. ${text}` },
    { label: 'Unordered List', emoji: '•', transform: (text: string) => `- ${text}` },
    { label: 'Task List', emoji: '☑️', transform: (text: string) => `- [ ] ${text}` },
    { label: 'Link', emoji: '🔗', transform: (url: string) => `[Link Title](${url})` },
    { label: 'Image (URL)', emoji: '🖼️', transform: (url: string) => `![Image](${url})` },
    { label: 'Horizontal Rule', emoji: '➖', transform: () => `---` },
    {
      label: 'Table',
      emoji: '📊',
      transform: (placeholder: string) =>
        `| Column1 | Column2 |\n|---------|---------|\n| ${placeholder} | ${placeholder} |`
    }
  ];

  let selectedOption: string = '';
  let userInput: string = '';

  // For editing lines individually
  let editingIndex: number | null = null;
  let editingValue: string = '';

  // Keep a combined string for preview
  let combinedMarkdown: string;
  let combinedRenderedMarkdown: string;

  let preview = false; // Toggles preview mode

  // For link/image insertion
  let modalType = ''; // "link" or "image"
  let inputText = '';
  let inputAltText = '';
  let open = false;

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
    const orderedListRegex = /^[0-9]+(\.|\))\s+/;

    for (const line of lines) {
      // Trim left for consistency (optional, if you want exact line starts)
      const trimmedLine = line.trimStart();

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

  // Textarea ID for referencing
  let textareaId = `editor-${Math.random().toString(36).substring(2, 11)}`;

  /**
   * 1) Keep a local undo/redo history for `content`.
   */
  let history: string[] = [];
  let historyIndex = -1;

  // Push a new state to the history
  function pushHistory(newState: string) {
    if (newState.length < 0) return;
    // If user did partial redo, drop subsequent states
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    history.push(newState);
    historyIndex = history.length - 1;
  }

  // Undo: revert to the previous state
  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      userInput = history[historyIndex];
    }
  }

  // Redo: go to the next state
  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      userInput = history[historyIndex];
    }
  }

  $: if ($content) {
    markdownLines.set(splitByOrderedList($content));
    reRenderLines();
  }

  // The rendered result for each line
  let renderedLines: Writable<string[]> = writable([]);

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

  /**
   * 4) Whenever content changes (typing, transforms) => push to undo history
   */
  $: if (userInput) {
    pushHistory(userInput);
  }

  /**
   * Add a new line using the chosen transform
   */
  function addLine() {
    content.update((c) => `${c}\n${userInput}`);
    selectedOption = '';
    userInput = '';
  }

  function startEditing(index: number) {
    editingIndex = index;
    editingValue = $markdownLines[index] || '';
  }

  function saveEditing() {
    if (editingIndex !== null) {
      markdownLines.update((lines) => {
        const updated = [...lines];
        updated[editingIndex as number] = editingValue;
        return updated;
      });
    }
    editingIndex = null;
    editingValue = '';
  }

  function cancelEditing() {
    editingIndex = null;
    editingValue = '';
  }

  function removeLine(index: number) {
    markdownLines.update((lines) => lines.filter((_, i) => i !== index));
    content.set($markdownLines.join('\n'));
  }

  function openModal(type: 'link' | 'image') {
    modalType = type;
    inputText = '';
    inputAltText = '';
    open = true;
  }

  // Insert link/image from modal
  function insertMarkdown() {
    const textarea = getTextarea();
    if (!textarea || !inputText) return;

    const { selectionStart, selectionEnd } = textarea;
    const before = $content.substring(0, selectionStart);
    const after = $content.substring(selectionEnd);
    let markdown = '';

    if (modalType === 'link') {
      markdown = `[${inputAltText || 'Link'}](${inputText})`;
    } else if (modalType === 'image') {
      markdown = `![${inputAltText || 'Image'}](${inputText})`;
    }

    content.set(before + markdown + after);
    open = false;
    textarea.focus();
  }

  // For applying any inline transform
  function formatText(formatFn: (text: string) => string) {
    const textarea = getTextarea();
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const before = userInput.substring(0, selectionStart);
    const selected = userInput.substring(selectionStart, selectionEnd);
    const after = userInput.substring(selectionEnd);

    userInput = before + formatFn(selected) + after;
    textarea.focus();
  }

  // Reference the textarea to auto-expand
  function getTextarea(): HTMLTextAreaElement | null {
    return document.getElementById(textareaId) as HTMLTextAreaElement;
  }

  // Auto-expand logic
  function adjustHeight(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    if (!el) return;
    console.log(`Scroll Height: ${el.scrollHeight}`);
    el.style.height = '';
    el.style.height = `${el.scrollHeight}px`;
  }
</script>

<!-- MAIN COMPONENT UI -->
<div class="mb-0">
  <!-- Existing lines (each line is editable) -->
  {#if $markdownLines.length > 0}
    <ul class="flex flex-col gap-2">
      {#each $markdownLines as line, index}
        <li class="input flex items-start" transition:slide|global={{ duration: 300 }}>
          {#if editingIndex === index}
            <!-- Edit mode for this line -->
            <div class="flex grow flex-col gap-2">
              <textarea rows="2" class="input h-auto w-full" bind:value={editingValue}></textarea>
              <div class="flex gap-2">
                <Button on:click={saveEditing}>Save</Button>
                <Button on:click={cancelEditing}>Cancel</Button>
              </div>
            </div>
          {:else}
            <!-- Display mode for this line -->
            <div class="flex items-center gap-2 w-full">
              <div
                class="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-white"
                aria-label="Line Number"
              >
                {index + 1}
              </div>
              <span
                class="grow cursor-pointer"
                on:dblclick={() => startEditing(index)}
                role="button"
                tabindex="-1"
              >
                {@html $renderedLines[index]}
              </span>
              <button
                type="button"
                class="text-danger shrink-0 self-center cursor-pointer"
                on:click={() => removeLine(index)}
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
        <!-- Toolbar -->
        <div class="toolbar">
          {#each markdownOptions as option}
            <button type="button" on:click={() => formatText(option.transform)}>
              {option.emoji}
              {option.label}
            </button>
          {/each}
          <button type="button" on:click={undo} title="Undo">↩️ Undo</button>
          <button type="button" on:click={redo} title="Redo">↪️ Redo</button>
          <button type="button" on:click={() => openModal('link')}>🔗 Link</button>
          <button type="button" on:click={() => openModal('image')}>🖼 Image</button>
        </div>
        <textarea
          id={textareaId}
          class="input"
          bind:value={userInput}
          on:input={adjustHeight}
          style="min-height: 100px;"
        ></textarea>
        <div class="flex gap-2">
          <Button on:click={addLine}>Save</Button>
          <Button on:click={() => (preview = !preview)}>Preview</Button>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Modal for link/image insertion -->
<Modal bind:open>
  <h1 slot="title">{modalType === 'link' ? 'Insert Link' : 'Insert Image'}</h1>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-3">
      <input
        type="text"
        class="input"
        bind:value={inputText}
        placeholder={modalType === 'link' ? 'Enter URL' : 'Enter Image URL'}
      />
      <input
        type="text"
        class="input"
        bind:value={inputAltText}
        placeholder="Enter alt text (optional)"
      />
    </div>
    <div class="flex justify-end gap-2">
      <Button on:click={() => (open = false)}>Cancel</Button>
      <Button on:click={insertMarkdown}>Insert</Button>
    </div>
  </div>
</Modal>

<style>
  .editor-container {
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: Arial, sans-serif;
    width: 100%;
    max-width: 800px;
    margin: auto;
  }

  .toolbar {
    background: #f6f8fa;
    padding: 6px;
    border-bottom: 1px solid #ddd;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .toolbar button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
  }

  .toolbar button:hover {
    background: #e1e4e8;
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
