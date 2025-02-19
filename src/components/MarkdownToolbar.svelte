<script lang="ts">
  import type { Writable } from 'svelte/store';
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';
  import {
    TextB,
    TextItalic,
    TextStrikethrough,
    ListNumbers,
	ListBullets,
    Quotes,
    Link,
    Image,
    Code,
    BracketsAngle,
    TextHOne,
    TextHTwo,
    TextHThree,
    Table,
    ArrowCounterClockwise,
    ArrowClockwise,
    Minus,
    CheckSquare,
  } from 'phosphor-svelte';
  import { faUndo, faRedo, faMinus } from '@fortawesome/free-solid-svg-icons';

  export let formatText: (transformFn: (text: string) => string) => void = formatTextFn;
  export let content: Writable<string>;
  export let textareaId: string;

  // For link/image insertion
  let modalType = ''; // "link" or "image"
  let inputText = '';
  let inputAltText = '';
  let open = false;

  $: if ($content) {
    pushHistory($content);
  }

  // Keep a local undo/redo history for `content`
  let history: string[] = [];
  let historyIndex = -1;

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

  // A list of transformations for quick insert
  const markdownOptions = [
    // Headings
    { icon: TextHOne, tooltip: 'Heading 1', transform: (text: string) => `# ${text}` },
    { icon: TextHTwo, tooltip: 'Heading 2', transform: (text: string) => `## ${text}` },
    { icon: TextHThree, tooltip: 'Heading 3', transform: (text: string) => `### ${text}` },

    // Text Formatting
    { icon: TextB, tooltip: 'Bold', transform: (text: string) => `**${text}**` },
    { icon: TextItalic, tooltip: 'Italic', transform: (text: string) => `_${text}_` },
    {
      icon: TextStrikethrough,
      tooltip: 'Strikethrough',
      transform: (text: string) => `~~${text}~~`
    },

    // Quotes & Code
    { icon: Quotes, tooltip: 'Blockquote', transform: (text: string) => `> ${text}` },
    { icon: Code, tooltip: 'Inline Code', transform: (text: string) => `\`${text}\`` },
    {
      icon: BracketsAngle,
      tooltip: 'Code Block',
      transform: (text: string) => '```\n' + text + '\n```'
    },

    // Lists
    { icon: ListNumbers, tooltip: 'Ordered List', transform: (text: string) => `1. ${text}` },
    { icon: ListBullets, tooltip: 'Unordered List', transform: (text: string) => `- ${text}` },
    { icon: CheckSquare, tooltip: 'Task List', transform: (text: string) => `- [ ] ${text}` },
	
	// Layout
    { icon: Minus, faIcon: faMinus, tooltip: 'Horizontal Rule', transform: () => `---` },
    {
      icon: Table,
      tooltip: 'Table',
      transform: (placeholder: string) =>
        `| Column1 | Column2 |\n|---------|---------|\n| ${placeholder} | ${placeholder} |`
    }
  ];

  // Called by the child toolbar to transform the currently selected text
  function formatTextFn(formatFn: (text: string) => string) {
    if (textareaId === null) return;
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const before = $content.substring(0, selectionStart);
    const selected = $content.substring(selectionStart, selectionEnd);
    const after = $content.substring(selectionEnd);

    content.set(before + formatFn(selected) + after);
    textarea.focus();
  }

  /**
   * Insert link/image from a modal
   */
  function insertMarkdown() {
    if (!inputText) {
      open = false;
      return;
    }
    if (textareaId === null) {
      open = false;
      return;
    }
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

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

  function openModal(type: 'link' | 'image') {
    modalType = type;
    inputText = '';
    inputAltText = '';
    open = true;
  }
</script>

<div class="toolbar">
  <!-- Undo/Redo -->
  <button type="button" on:click={undo} title="Undo" ><ArrowCounterClockwise/></button>
  <button type="button" on:click={redo} title="Redo"><ArrowClockwise /></button>

  <!-- Markdown transformations -->
  {#each markdownOptions as option}
    <button type="button" on:click={() => formatText(option.transform)} title={option.tooltip}>
      <option.icon size="20" />
    </button>
  {/each}

  <!-- Link & Image Modals -->
  <button type="button" on:click={() => openModal('link')} title="Insert Link"><Link/></button>
  <button type="button" on:click={() => openModal('image')} title="Insert Image"><Image /></button>
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
</style>
