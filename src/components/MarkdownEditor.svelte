<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';

  export let content = ''; // Markdown content
  export let placeholder = 'Write your recipe here...';
  let preview = false; // Toggle preview mode
  let textareaId = `editor-${Math.random().toString(36).substr(2, 9)}`; // Unique textarea ID
  let modalType = ''; // "link" or "image"
  let inputText = '';
  let inputAltText = '';
  let open = false;

  // Find the specific textarea by ID
  function getTextarea(): HTMLTextAreaElement | null {
    return document.getElementById(textareaId) as HTMLTextAreaElement;
  }

  // Open modal for link or image input
  function openModal(type: 'link' | 'image') {
    modalType = type;
    inputText = '';
    inputAltText = '';
    open = true;
  }

  // Format text with Markdown syntax
  function formatText(tag: string, wrap: boolean = true) {
    const textarea = getTextarea();
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const before = content.substring(0, selectionStart);
    const selected = content.substring(selectionStart, selectionEnd);
    const after = content.substring(selectionEnd);

    // Format based on wrap mode
    if (wrap) {
      content = `${before}${tag}${selected}${tag}${after}`;
    } else {
      content = `${before}${tag} ${selected}${after}`;
    }

    textarea.focus();
  }

  // Insert image or link Markdown after modal input
  function insertMarkdown() {
    const textarea = getTextarea();
    if (!textarea || !inputText) return;

    const { selectionStart, selectionEnd } = textarea;
    const before = content.substring(0, selectionStart);
    const after = content.substring(selectionEnd);
    let markdown = '';

    if (modalType === 'link') {
      markdown = `[${inputAltText || 'Link'}](${inputText})`;
    } else if (modalType === 'image') {
      markdown = `![${inputAltText || 'Image'}](${inputText})`;
    }

    content = `${before}${markdown}${after}`;
    open = false;
    textarea.focus();
  }

  // Insert links, images, or recipe sections
  function insertText(template: string) {
    const textarea = getTextarea();
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const before = content.substring(0, selectionStart);
    const after = content.substring(selectionEnd);

    content = `${before}${template}${after}`;
    textarea.focus();
  }

  // Convert Markdown to sanitized HTML for preview mode
  function getPreview() {
    return DOMPurify.sanitize(marked(content));
  }
</script>

<div class="editor-container">
  <!-- Toolbar -->
  <div class="toolbar">
    <button on:click={() => insertText('\n## Directions\n1. Step 1\n2. Step 2\n')}
      >📖 Directions</button
    >
    <button type="button" on:click={() => formatText('# ', false)}>H1</button>
    <button type="button" on:click={() => formatText('## ', false)}>H2</button>
    <button type="button" on:click={() => formatText('**')}>B</button>
    <button type="button" on:click={() => formatText('*')}>I</button>
    <button type="button" on:click={() => formatText('> ', false)}>Quote</button>
    <button type="button" on:click={() => formatText('- ', false)}>List</button>
    <button type="button" on:click={() => openModal('link')}>🔗 Link</button>
    <button type="button" on:click={() => openModal('image')}>🖼 Image</button>
	<button type="button" on:click={() => (preview = !preview)}>{preview ? '📄 Edit Markdown' : '🖥️ Preview'}</button>
  </div>
  <!-- Markdown Editor / Preview -->
  {#if preview}
    <div class="preview">{@html getPreview()}</div>
  {:else}
    <textarea class="input" id={textareaId} bind:value={content} {placeholder}></textarea>
  {/if}
</div>

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
        placeholder="Enter text (optional)"
      />
    </div>
    <div class="flex justify-end gap-2">
      <Button
        class="hover:bg-accent-gray border border-[#ECECEC] bg-white text-black!"
        on:click={() => (open = false)}>Cancel</Button
      >
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
    min-height: 250px;
    border: none;
    padding: 10px;
    font-size: 14px;
    resize: vertical;
    outline: none;
  }

  .preview {
    padding: 10px;
    font-size: 14px;
  }

</style>
