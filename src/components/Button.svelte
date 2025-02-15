<script lang="ts">
  export let primary = true;
  export let type: 'button' | 'reset' | 'submit' = 'button';
  export let disabled = false;
</script>

<button
  {type}
  class="rounded-full text-white {primary
    ? 'bg-primary disabled:bg-primary/50 hover:bg-[#d64000]'
    : 'bg-black hover:bg-gray-800 disabled:bg-black/50'} px-4 py-2.5 font-semibold transition duration-300 {$$props.class}"
  on:click
  {disabled}
>
  <slot />
</button>
