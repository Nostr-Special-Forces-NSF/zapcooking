<script lang="ts">
  export let text: string;
  export let onClick: () => void;
  export let selected: boolean;
</script>

<button
  on:click={onClick}
  type="button"
  class={`
    rounded-full
    py-3
    text-center
    font-semibold
    text-black
    md:px-4
    ${selected ? 'bg-accent-gray' : 'bg-input hover:bg-gray-200'}
    `}>{text}</button
>
