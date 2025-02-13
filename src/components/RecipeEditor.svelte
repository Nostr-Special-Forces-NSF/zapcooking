<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  import TagsComboBox from './TagsComboBox.svelte';
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import { recipeTags, toolTags, dietaryRestrictions, type recipeTagSimple } from '$lib/consts';
  import FeedItem from './RecipeCard.svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import ImagesComboBox from './ImagesComboBox.svelte';
  import Button from './Button.svelte';
  import { onMount } from 'svelte';
  import TupleComboBox from './TupleComboBox.svelte';
  import RecipeComboBox from './RecipeComboBox.svelte';
  import { nip19 } from 'nostr-tools';
  import NutritionEditor from './NutritionEditor.svelte';
  import MarkdownEditor from './MarkdownEditor.svelte';

  export let recipeData: NDKEvent | null = null;
  export let naddr: string | null = null;

  onMount(async () => {
    if ($userPublickey == '') goto('/login');

    if (naddr) {
      recipeData = await loadData();
    }
  });

  let title = '';
  let images: Writable<string[]> = writable(
    recipeData?.tags.filter((t) => t[0] === 'image').map((t) => t[1]) || []
  );
  let selectedTags: Writable<recipeTagSimple[]> = writable([]);
  let selectedRecipesArray: Writable<Map<string, string>> = writable(new Map());
  let summary = '';
  let preptime = '';
  let cooktime = '';
  let servings = '';
  let ingredientsArray: Writable<Array<[string, string]>> = writable([]);
  let directionsArray: Writable<string[]> = writable([]);
  let directions = writable('');
  let disablePublishButton = false;
  let resultMessage = '';
  let previewEvent: NDKEvent | undefined = undefined;
  let nutritionValues: Writable<Record<string, string>> = writable({});
  let toolValues: Writable<recipeTagSimple[]> = writable([]);
  let dietValues: Writable<recipeTagSimple[]> = writable([]);

  function addTag(query: string) {
    let tag = recipeTags.find(
      (e) => query.toLowerCase().replaceAll(' ', '-') == e.title.toLowerCase().replaceAll(' ', '-')
    );
    if (!tag) {
      tag = { title: query };
    }
    $selectedTags.push(tag);
    selectedTags = selectedTags;
  }

  function addTool(query: string) {
    let tag = toolTags.find(
      (e) => query.toLowerCase().replaceAll(' ', '-') == e.title.toLowerCase().replaceAll(' ', '-')
    );
    if (!tag) {
      tag = { title: query };
    }
    toolValues.update((v) => [...v, tag]);
  }

  function addDiet(query: string) {
    let tag = dietaryRestrictions.find(
      (e) => query.toLowerCase().replaceAll(' ', '-') == e.title.toLowerCase().replaceAll(' ', '-')
    );
    if (!tag) {
      tag = { title: query };
    }
    dietValues.update((v) => [...v, tag]);
  }

  async function loadData(): Promise<NDKEvent | null> {
    let event: NDKEvent | null = null;
    if (naddr && naddr.startsWith('naddr1')) {
      const b = nip19.decode(naddr).data as nip19.AddressPointer;
      let e = await $ndk.fetchEvent({
        '#d': [b.identifier],
        authors: [b.pubkey],
        kinds: [35000 as NDKKind]
      });
      if (e) {
        event = e;
      }
    } else {
      let e = await $ndk.fetchEvent(naddr!);
      if (e) {
        event = e;
        const c = nip19.naddrEncode({
          identifier: e.tags.find((z) => z[0] == 'd')?.[1] as string,
          kind: e.kind as number,
          pubkey: e.author.pubkey
        });
        goto(`/fork/${c}`);
      }
    }
    if (event) {
      if (event.content) {
        directions.update((e) => event.content);
        directionsArray.set(event?.content.split('\n') ?? []);
        let titleTagValue = event.tags.find((e) => e[0] == 'title')?.[1];
        if (titleTagValue) title = titleTagValue;
        let summaryTagValue = event.tags.find((e) => e[0] == 'summary')?.[1];
        if (summaryTagValue) summary = summaryTagValue;
        let imageTagsValue = event.tags.filter((e) => e[0] == 'image');
        if (imageTagsValue) {
          for (let i = 0; i < imageTagsValue.length; i++) {
            $images.push(imageTagsValue[i][1]);
          }
          images.set($images); // svelte reactivity
        }
        selectedTags.set([]);
        let tagTags = event.tags.filter((e) => e[0] == 't');
        tagTags.forEach((t) => {
          addTag(t[1]);
        });

        let ingredients = new Array<[string, string]>();
        let ingredientTags = event.tags.filter((e) => e[0] === 'ingredient');
        ingredientTags.forEach((e) => {
          ingredients.push([e[2], e[1]]);
        });
        ingredientsArray.set(ingredients);

        event.tags.forEach(async (e) => {
          if (e[0] === 'cook_time') cooktime = e[1];
          if (e[0] === 'prep_time') preptime = e[1];
          if (e[0] === 'servings') servings = e[1];
          if (e[0] === 'a') {
            const addr = e[1].split(':');
            if (addr[0] === '35000') {
              const ne = await $ndk.fetchEvent(addr[1]);
              $selectedRecipesArray.set(addr[1], ne?.tagValue('title')!);
              selectedRecipesArray.set($selectedRecipesArray);
            }
          }
          if (e[0] === 'nutrition') {
            nutritionValues.update((v) => {
              return { ...v, [e[1]]: e[2] };
            });
          }
          if (e[0] === 'tool') addTool(e[1]);
          if (e[0] === 'dietary_restrictions') addDiet(e[1]);
        });
      }
    }
    return event;
  }

  async function loadPreview() {
    if (browser && $images.length > 0 && $directionsArray.length > 0) {
      previewEvent = new NDKEvent($ndk);
      previewEvent.kind = 35000;
      previewEvent.content = $directionsArray.join('\n');
      previewEvent.tags.push(['d', title.toLowerCase().replaceAll(' ', '-')]);
      previewEvent.tags.push(['title', title]);
      if (preptime !== '') previewEvent.tags.push(['prep_time', preptime]);
      if (cooktime !== '') previewEvent.tags.push(['cook_time', cooktime]);
      if (servings !== '') previewEvent.tags.push(['servings', servings]);
      if (summary !== '') previewEvent.tags.push(['summary', summary]);

      $images.forEach((img) => previewEvent?.tags.push(['image', img]));
      $ingredientsArray.forEach(([amount, ingredient]) =>
        previewEvent?.tags.push(['ingredient', ingredient, amount])
      );
      previewEvent.author.pubkey = $userPublickey;
      $selectedTags.forEach((t) => previewEvent?.tags.push(['t', t.title.toLowerCase()]));
    }
  }

  async function publishRecipe() {
    disablePublishButton = true;
    try {
      if ($images.length == 0) {
        resultMessage = `Error: No Image Uploaded`;
      } else if ($directionsArray.length > 0) {
        const event = new NDKEvent($ndk);
        event.kind = 35000;
        event.content = $directionsArray.join('\n');
        event.tags.push(['d', title.toLowerCase().replaceAll(' ', '-')]);
        event.tags.push(['title', title]);
        if (preptime !== '') {
          event.tags.push(['prep_time', preptime]);
        }
        if (cooktime !== '') {
          event.tags.push(['cook_time', cooktime]);
        }
        if (servings !== '') {
          event.tags.push(['servings', servings]);
        }
        if (summary !== '') {
          event.tags.push(['summary', summary]);
          event.tags.push(['alt', `recipe:${title}`]);
        }
        if ($images.length > 0) {
          for (let i = 0; i < $images.length; i++) {
            event.tags.push(['image', $images[i]]);
          }
        }
        $ingredientsArray.forEach(([amount, ingredient]) => {
          event.tags.push(['ingredient', ingredient, amount]);
        });
        $selectedTags.forEach((t) => {
          if (t.title) {
            event.tags.push(['t', `${t.title.toLowerCase()}`]);
          }
        });
        for (const key in $nutritionValues) {
          event.tags.push(['nutrition', key, $nutritionValues[key]]);
        }
        $toolValues.forEach((r) => event.tags.push(['tool', r.title]));
        $dietValues.forEach((d) => event.tags.push(['dietary_restrictions', d.title]));
        /*
		event.tags.push([
          'client',
          `35000:cooking.nostrsf.org:${title.toLowerCase().replaceAll(' ', '-')}`,
          'wss://relay.nostrsf.org'
        ]);
		*/
        console.log('event to publish:', event);
        let relays = await event.publish();
        resultMessage = 'Succes!';
        relays.forEach((relay) => {
          relay.once('published', () => {
            console.log('published to', relay);
          });
          relay.once('publish:failed', (relay, err) => {
            console.log('publish failed to', relay, err);
          });
        });
        const naddr = nip19.naddrEncode({
          identifier: title.toLowerCase().replaceAll(' ', '-'),
          pubkey: event.author.pubkey,
          kind: 35000
        });
        setTimeout(() => {
          goto(`/recipe/${naddr}`);
        }, 2500);
      }
    } catch (err) {
      console.error('error while publishing', err);
      resultMessage = 'Error: Something went wrong, Error: ' + String(err);
    } finally {
      disablePublishButton = false;
      if (resultMessage == 'Processing...') {
        resultMessage = ' ';
      }
    }
  }
</script>

<svelte:head>
  <title>{recipeData ? `Edit recipe ${title}` : 'Create a recipe'}</title>
</svelte:head>

<form on:submit|preventDefault={publishRecipe} class="mx-auto flex max-w-[760px] flex-col gap-6">
  <h1>{recipeData ? 'Edit Recipe' : 'Create Recipe'}</h1>
  <div class="flex flex-col gap-2">
    <h3>Title*</h3>
    <span class="text-caption">Remember to make your title unique!</span>
    <input placeholder="Title" bind:value={title} class="input" />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Tags*</h3>
    <TagsComboBox {selectedTags} tagArray={recipeTags} />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Dietary Restrictions</h3>
    <TagsComboBox
      selectedTags={dietValues}
      tagArray={dietaryRestrictions}
      placeholderString={'Add any dietary restrictions like Keto or Vegan'}
    />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Brief Summary</h3>
    <textarea
      placeholder="A brief description of the dish and chef’s notes"
      bind:value={summary}
      rows="6"
      class="input"
    ></textarea>
  </div>

  <div class="flex flex-col gap-4">
    <h3>Related Recipes</h3>
    <RecipeComboBox placeholder="Add related recipes" {selectedRecipesArray} />
  </div>

  <div class="flex flex-col gap-4">
    <h3>Details</h3>
    <div class="flex flex-col gap-2">
      <span class="font-bold">Prep Time</span>
      <input placeholder="20 min" bind:value={preptime} class="input" />
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-bold">Cooking Time</span>
      <input placeholder="1 hour and 5 min" bind:value={cooktime} class="input" />
    </div>
    <div class="flex flex-col gap-2">
      <span class="font-bold">Servings (persons)</span>
      <input placeholder="4" bind:value={servings} class="input" />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h3>Nutrition</h3>
    <NutritionEditor {nutritionValues} />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Ingredients*</h3>
    <TupleComboBox
      selected={ingredientsArray}
      showIndex={false}
      amountPlaceholder="Quantity (e.g., 1 cup)"
      ingredientPlaceholder="Item (e.g., flour)"
    />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Tools</h3>
    <TagsComboBox
      selectedTags={toolValues}
      tagArray={toolTags}
      placeholderString={'Add any special kitchen tools needed like Oven or Food Processor'}
    />
  </div>

  <div class="flex flex-col gap-2">
    <h3>Directions*</h3>
    <MarkdownEditor markdownLines={directionsArray} />
  </div>

  <div>
    <h3>Cover Image*</h3>
    <span class="text-caption">Appears on the recipe card</span>
    <ImagesComboBox uploadedImages={images} />
  </div>

  <div class="flex justify-end">
    {resultMessage}
    <Button disabled={disablePublishButton} type="submit"
      >{recipeData ? 'Update' : 'Publish'}</Button
    >
  </div>

  {#if $images.length > 0 && title && $selectedTags.length > 0 && $directionsArray.length > 0 && $ingredientsArray.length > 0}
    <div class="flex flex-col gap-2">
      <h2>Card Preview</h2>
      <div>
        <Button on:click={loadPreview}>Load Preview</Button>
      </div>
      {#if previewEvent}
        <div>
          <FeedItem event={previewEvent} />
        </div>
      {/if}
    </div>
  {/if}
</form>
