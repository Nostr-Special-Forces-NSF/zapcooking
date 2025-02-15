<script lang="ts">
  import { get, writable, type Writable } from 'svelte/store';
  import Button from './Button.svelte';
  import TrashIcon from 'phosphor-svelte/lib/Trash';
  import { slide } from 'svelte/transition';
  import { parseMarkdown } from '$lib/marked';

  // The store is an array of strings, each representing one line of Markdown
  export let markdownLines: Writable<string[]>;

  // A list of transformations to apply to new lines
  const markdownOptions = [
    // HEADINGS
    {
      label: 'Heading 1',
      emoji: '🔠',
      transform: (text: string) => `# ${text}`
    },
    {
      label: 'Heading 2',
      emoji: '🔡',
      transform: (text: string) => `## ${text}`
    },
    {
      label: 'Heading 3',
      emoji: '🔤',
      transform: (text: string) => `### ${text}`
    },

    // TEXT STYLES
    {
      label: 'Bold',
      emoji: '💪',
      transform: (text: string) => `**${text}**`
    },
    {
      label: 'Italic',
      emoji: '🎨',
      transform: (text: string) => `_${text}_`
    },
    {
      label: 'Strikethrough',
      emoji: '❌',
      transform: (text: string) => `~~${text}~~`
    },

    // QUOTES / CODE
    {
      label: 'Blockquote',
      emoji: '💬',
      transform: (text: string) => `> ${text}`
    },
    {
      label: 'Inline Code',
      emoji: '⚙️',
      transform: (text: string) => `\`${text}\``
    },
    {
      label: 'Code Fence',
      emoji: '💻',
      transform: (text: string) => '```\n' + text + '\n```'
      // or "```js\n" + text + "\n```" if you want a default language
    },

    // LISTS
    {
      label: 'Ordered List',
      emoji: '🔢',
      transform: (text: string) => `1. ${text}`
    },
    {
      label: 'Unordered List',
      emoji: '•',
      transform: (text: string) => `- ${text}`
    },
    {
      label: 'Task List',
      emoji: '☑️',
      transform: (text: string) => `- [ ] ${text}`
    },

    // LINK / IMAGE
    {
      label: 'Link',
      emoji: '🔗',
      transform: (url: string) => `[Link Title](${url})`
    },
    {
      label: 'Image (URL)',
      emoji: '🖼️',
      transform: (url: string) => `![Image](${url})`
    },

    // MISC
    {
      label: 'Horizontal Rule',
      emoji: '➖',
      transform: () => `---`
    },
    {
      label: 'Table',
      emoji: '📊',
      transform: (placeholder: string) =>
        `| Column1 | Column2 |\n|---------|---------|\n| ${placeholder} | ${placeholder} |`
    }
  ];

  // For adding a new line with a transform
  let selectedOption: string = '';
  let userInput: string = '';

  // For editing an existing line
  let editingIndex: number | null = null;
  let editingValue: string = '';
  let combinedMarkdown: string;

  // The rendered result for each line
  let renderedLines: Writable<string[]> = writable([]);

  function isListMarkdown(line: string): boolean {
    return /^[0-9]+(\.|\))\s/.test(line) || /^[-*+]\s/.test(line);
  }

  /**
   * Re-render all lines whenever `markdownLines` changes
   */
  $: if ($markdownLines) {
    reRenderLines();
  }

  // Called whenever lines change or an edit completes
  async function reRenderLines() {
    // Wait for each line to be parsed asynchronously
    const linesArray = $markdownLines;
    const result: string[] = [];
    for (let line of linesArray) {
      let rline = isListMarkdown(line) ? line : await parseMarkdown(line);
      console.log(rline);
      result.push(rline);
    }
    renderedLines.set(result);
    combinedMarkdown = get(markdownLines).join('\n');
    console.log(combinedMarkdown);
  }

  /**
   * Apply the chosen transformation to userInput, then add
   * a new line to the array. (If no transform or input is chosen, do nothing.)
   */
  function addLine() {
    if (!userInput.trim()) return;
    const option = markdownOptions.find((o) => o.label === selectedOption);
    let transformed = userInput.trim();
    if (option) transformed = option.transform(transformed);
    markdownLines.update((lines) => [...lines, transformed]);
    // Reset
    selectedOption = '';
    userInput = '';
  }

  /**
   * Start editing an existing line
   */
  function startEditing(index: number) {
    console.log(index);
    editingIndex = index;
    editingValue = get(markdownLines)[index] || '';
  }

  /**
   * Save the edited line
   */
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

  /**
   * Cancel editing
   */
  function cancelEditing() {
    editingIndex = null;
    editingValue = '';
  }

  /**
   * Remove an existing line
   */
  function removeLine(index: number) {
    markdownLines.update((lines) => {
      return lines.filter((_, i) => i !== index);
    });
  }
</script>

<!-- Existing lines (each line is editable) -->
{#if $markdownLines.length > 0}
  <ul class="mb-4 flex flex-col gap-2">
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
            <span class="grow" on:dblclick={() => startEditing(index)} role="button" tabindex="-1">
              {@html $renderedLines[index]}
            </span>
          </div>
          <button type="button" class="text-danger self-center" on:click={() => removeLine(index)}>
            <TrashIcon />
          </button>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<!-- Add new line form -->
<form on:submit|preventDefault={addLine} class="flex flex-col items-end gap-2 md:flex-row">
  <select class="input md:w-auto" bind:value={selectedOption}>
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
</form>
