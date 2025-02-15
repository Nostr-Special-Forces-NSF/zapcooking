<script lang="ts">
  import { blur, scale } from 'svelte/transition';
  import CloseIcon from 'phosphor-svelte/lib/XCircle';
  export let open = false;
  export let cleanup: (() => void) | null = null;

  // if some variables need to be erased when it's closed, we can do that here.
  function close() {
    if (cleanup !== null) cleanup();
    // for good measure
    open = false;
  }
</script>

{#if open}
  <div
    on:click|self={close}
    role="presentation"
    transition:blur={{ duration: 250 }}
    class="fixed top-0 left-0 z-30 h-full w-full backdrop-blur-sm backdrop-brightness-50"
  >
    <dialog
      transition:scale={{ duration: 250 }}
      aria-labelledby="title"
      aria-modal="true"
      class="md:w-[calc(100vw - 4em)] h-[calc(100vh - 4em)] absolute top-1/2 left-1/2 m-0 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white px-2 pt-6 pb-8 md:px-8"
      open
    >
      <div class="flex flex-col gap-6">
        <div class="flex justify-between">
          <slot class="self-center" id="title" name="title" />
          <button class="cursor-pointer self-center" on:click={close}>
            <CloseIcon size={24} />
          </button>
        </div>
        <slot />
      </div>
    </dialog>
  </div>
{/if}
