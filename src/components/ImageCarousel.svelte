<script lang="ts">
  export let images: string[] = [];

  let selectedImage: string = images[0] || '';

  function selectImage(image: string) {
    selectedImage = image;
  }
</script>

{#if images.length > 0}
  <!-- Main Image -->
  <div>
    <img src={selectedImage} alt="Selected" class="aspect-video w-full rounded-3xl object-cover" />
  </div>
  <!-- Thumbnail Carousel -->
  {#if images.length > 1}
    <div class="flex gap-2">
      {#each images as image (image)}
        <button
          type="button"
          class="focus:ring-primary h-20 w-32 overflow-hidden rounded-xl transition-transform duration-300 hover:scale-105 focus:ring focus:outline-none"
          on:click={() => selectImage(image)}
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectImage(image)}
          aria-label="Select image"
        >
          <img src={image} alt="Thumbnail" class="h-full w-full object-cover" />
        </button>
      {/each}
    </div>
  {/if}
{/if}
