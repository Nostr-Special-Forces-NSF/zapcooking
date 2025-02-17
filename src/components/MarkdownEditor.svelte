<script lang="ts">
  import { get, writable, type Writable } from 'svelte/store';
  import { parseMarkdown } from '$lib/marked';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import { slide } from 'svelte/transition';

  export let markdownLines: Writable<string[]>;

  // Convert lines to a single content string, and vice versa
  let content = writable($markdownLines.join('\n'));

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

  // Textarea ID for referencing
  let textareaId = `editor-${Math.random().toString(36).substring(2, 11)}`;

  /**
   * 1) Keep a local undo/redo history for `content`.
   */
  let history: string[] = [];
  let historyIndex = -1;

  // Push a new state to the history
  function pushHistory(newState: string) {
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
      content.set(history[historyIndex]);
    }
  }

  // Redo: go to the next state
  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      content.set(history[historyIndex]);
    }
  }

  /**
   * 2) Update lines => content => lines
   */
  $: if ($markdownLines) {
    reRenderLines();
    content.set($markdownLines.join('\n'));
  }

  $: if ($content) {
    markdownLines.set($content.split('\n'));
  }

  // The rendered result for each line
  let renderedLines: Writable<string[]> = writable([]);

  function isListMarkdown(line: string): boolean {
    return /^[0-9]+(\.|\))\s/.test(line) || /^[-*+]\s/.test(line);
  }

  async function reRenderLines() {
    const linesArray = $markdownLines;
    const result: string[] = [];
    for (let line of linesArray) {
      let rline = isListMarkdown(line) ? line : await parseMarkdown(line);
      result.push(rline);
    }
    renderedLines.set(result);
    combinedMarkdown = get(markdownLines).join('\n');
    combinedRenderedMarkdown = await parseMarkdown(combinedMarkdown);
  }

  /**
   * 4) Whenever content changes (typing, transforms) => push to undo history
   */
  $: if ($content) {
    pushHistory($content);
  }

  /**
   * Add a new line using the chosen transform
   */
  function addLine() {
    if (!userInput.trim()) return;
    const option = markdownOptions.find((o) => o.label === selectedOption);
    let transformed = userInput.trim();
    if (option) transformed = option.transform(transformed);
    markdownLines.update((lines) => [...lines, transformed]);
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
    const before = $content.substring(0, selectionStart);
    const selected = $content.substring(selectionStart, selectionEnd);
    const after = $content.substring(selectionEnd);

    content.set(before + formatFn(selected) + after);
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
            <div class="flex grow gap-2">
              <span
                class="grow"
                on:dblclick={() => startEditing(index)}
                role="button"
                tabindex="-1"
              >
			  {@html $renderedLines[index]}
			</span>
            </div>
            <button
              type="button"
              class="text-danger self-center"
              on:click={() => removeLine(index)}
            >
              <TrashIcon />
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Add new line form -->
  <div class="mb-4 mt-4 flex flex-col items-end gap-2 md:flex-row">
    <select class="input w-full md:w-auto" bind:value={selectedOption}>
      <option value="" disabled selected>Select Markdown Format</option>
      {#each markdownOptions as option}
        <option value={option.label}>
          {option.emoji}
          {option.label}
        </option>
      {/each}
    </select>
    <input type="text" class="input grow" bind:value={userInput} placeholder="Enter text or URL" />
    <Button on:click={addLine}>Add Line</Button>
</div>
<div class="m-4">
	<hr/>
</div>
  <!-- Edit/Preview Container -->
  <div class="editor-container">
    <!-- Toolbar -->
    <div class="toolbar">
      {#if !preview}
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
      {/if}

      <button type="button" on:click={() => (preview = !preview)}>
        {preview ? '📄 Edit' : '🖥️ Preview'}
      </button>
    </div>

    <!-- Markdown Editor or Preview -->
    {#if preview}
      <!-- Show combined rendered preview -->
      <div class="prose">
        {@html combinedRenderedMarkdown}
      </div>
    {:else}
      <textarea
        id={textareaId}
        class="input"
        bind:value={$content}
        on:input={adjustHeight}
        style="min-height: 250px;"
      ></textarea>
    {/if}
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
