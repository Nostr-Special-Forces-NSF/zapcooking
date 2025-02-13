<script lang="ts">
	export let images: string[] = [];
  
	let selectedImage: string = images[0] || "";
  
	function selectImage(image: string) {
	  selectedImage = image;
	}
  </script>
  
  {#if images.length > 0}
	<!-- Main Image -->
	<div>
	  <img src={selectedImage} alt="Selected" class="aspect-video rounded-3xl object-cover w-full">
	</div>
	<!-- Thumbnail Carousel -->
	{#if images.length > 1}
	  <div class="flex gap-2">
		{#each images as image (image)}
		  <button
			type="button"
			class="h-20 w-32 rounded-xl overflow-hidden focus:outline-none focus:ring focus:ring-primary transition-transform duration-300 hover:scale-105"
			on:click={() => selectImage(image)}
			on:keydown={(e) => (e.key === "Enter" || e.key === " ") && selectImage(image)}
			aria-label="Select image"
		  >
			<img src={image} alt="Thumbnail" class="h-full w-full object-cover">
		  </button>
		{/each}
	  </div>
	{/if}
  {/if}
  