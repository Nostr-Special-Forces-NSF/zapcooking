<script lang="ts">
  import { page } from '$app/stores';
  import RecipeEditor from '../../../components/RecipeEditor.svelte';
</script>

<RecipeEditor naddr={$page.params.slug}></RecipeEditor>
