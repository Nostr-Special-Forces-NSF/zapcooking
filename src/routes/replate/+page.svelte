<script lang="ts">
  import { ndk, userPublickey } from '$lib/nostr';
  import { NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';
  import { onMount } from 'svelte';
  import Feed from '../../components/Feed.svelte';
  import { validateMarkdownTemplate } from '$lib/pharser';
  import Button from '../../components/Button.svelte';
  import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircle';
  import CaretCircleRightIcon from 'phosphor-svelte/lib/CaretCircleRight';

  import { writable } from 'svelte/store';

  onMount(async () => {
    let filter: NDKFilter = { limit: 256, kinds: [30023], '#t': ['nostrcooking'] };
    const evts = await $ndk.fetchEvents(filter);
    let evtsArr = Array.from(evts);
    evtsArr.forEach((ev, i) => {
      if (validateMarkdownTemplate(ev.content) == null) {
        evtsArr.splice(i, 1);
      }
    });
    events = evtsArr;
  });

  let events: NDKEvent[] = [];
  let selectable = true;
  // Store for selected recipes
  let selectedRecipes = writable(new Set<string>());

  function selectAll() {
    selectedRecipes.update((selected) => {
      if (selected.size > 0) {
        return new Set(); // Deselect all
      } else {
        return new Set(events.map((r) => r.id)); // Select all
      }
    });
  }

  function replate() {
    events
      .filter((e) => $selectedRecipes.has(e.id))
      .forEach((e) => {
        replateRecipe(e);
      });
  }

  // Map of Unicode fractions to their decimal equivalents
  const unicodeFractionMap: { [key: string]: string } = {
    '¼': '1/4',
    '½': '1/2',
    '¾': '3/4',
    '⅐': '1/7',
    '⅑': '1/9',
    '⅒': '1/10',
    '⅓': '1/3',
    '⅔': '2/3',
    '⅕': '1/5',
    '⅖': '2/5',
    '⅗': '3/5',
    '⅘': '4/5',
    '⅙': '1/6',
    '⅚': '5/6',
    '⅛': '1/8',
    '⅜': '3/8',
    '⅝': '5/8',
    '⅞': '7/8'
  };

  // Convert Unicode fractions to standard format (e.g., ½ → 1/2)
  const convertUnicodeFractions = (input: string): string => {
    return input.replace(/[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, (match) => unicodeFractionMap[match]);
  };

  // Updated regex to handle mixed numbers, fractions, and decimal values
  const ingredientRegex = /^([\d¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞\d\/\.\-\s]*[a-zA-Z%]*)\s+(.*)/;

  // Unit normalization map
  const unitMap: { [key: string]: string } = {
    tbsp: 'tablespoon',
    tsp: 'teaspoon',
    oz: 'ounce',
    lbs: 'pounds',
    lb: 'pound',
    g: 'grams',
    kg: 'kilograms',
    cup: 'cup',
    cups: 'cups',
    clove: 'clove',
    cloves: 'cloves',
    tbspn: 'tablespoon',
    tbl: 'tablespoon',
    tblsp: 'tablespoon',
    tspn: 'teaspoon',
    pint: 'pint',
    pints: 'pints',
    quart: 'quart',
    quarts: 'quarts',
    ml: 'milliliters',
    l: 'liters',
    dl: 'deciliters'
  };

  // Function to normalize unit names
  const normalizeUnits = (unit: string): string => {
    const lowerUnit = unit.toLowerCase().replace(/\.$/, ''); // Remove trailing dots
    return unitMap[lowerUnit] || lowerUnit;
  };

  // Function to strip out unnecessary words from ingredient names
  const cleanIngredientName = (name: string): string => {
    return name.replace(/\b(of|a|an|the)\b/gi, '').trim();
  };

  // Function to parse an ingredient string
  function parseIngredient(ingredient: string): [string, string] {
    // Convert Unicode fractions to standard fraction format
    const convertedIngredient = convertUnicodeFractions(ingredient);

    // Match against updated regex
    const match = convertedIngredient.match(ingredientRegex);
    if (match) {
      const quantity = normalizeUnits(match[1].trim());
      const ingredientName = cleanIngredientName(match[2].trim());
      return [quantity, ingredientName];
    }
    return ['', cleanIngredientName(convertedIngredient.trim())]; // If no match, assume no quantity was provided
  }

  async function replateRecipe(recipe: NDKEvent) {
    const r = validateMarkdownTemplate(recipe.content);
    if (typeof r === 'string') return;
    const event = new NDKEvent($ndk);
    event.kind = 35000;
    event.content = r.directions.map((l, x) => `${x + 1}. ${l}`).join('\n');
    event.content += r.chefNotes ? `\n\n## Chef's notes\n${r.chefNotes}` : '';
    event.content += r.additionalMarkdown
      ? `\n\n## Additional Resources\n${r.additionalMarkdown}`
      : '';
    if (r.information!.prepTime.length > 0)
      event.tags.push(['prep_time', r.information?.prepTime!]);
    if (r.information!.cookTime.length > 0)
      event.tags.push(['cook_time', r.information?.cookTime!]);
    if (r.information!.servings.length > 0) event.tags.push(['servings', r.information?.servings!]);

    recipe.tags.forEach((t) => {
      switch (t[0]) {
        case 'd':
          event.tags.push(['d', t[1]]);
          break;
        case 'image':
          event.tags.push(['image', t[1]]);
          break;
        case 'summary':
          event.tags.push(['summary', t[1]]);
          event.tags.push(['alt', t[1]]);
          break;
        case 'title':
          event.tags.push(['title', t[1]]);
          break;
        case 't':
          const tag = t[1].startsWith('nostrcooking-') ? t[1].substring(13) : t[1];
          event.tags.push(['t', tag]);
          break;
        default:
          break;
      }
    });

    r.ingredients.map(parseIngredient).forEach((i) => {
      event.tags.push(['ingredient', i[1], i[0]]);
    });

    console.log('event to publish:', event);
    let relays = await event.publish();

    relays.forEach((relay) => {
      relay.once('published', () => {
        console.log('published to', relay);
      });
      relay.once('publish:failed', (relay, err) => {
        console.log('publish failed to', relay, err);
      });
    });
  }
</script>

<svelte:head>
  <title>Replate Recipes</title>
  <meta name="description" content="Replate Recipes to the new NIP format" />
  <meta property="og:url" content="https://zap.cooking/replate" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Replate Recipes" />
  <meta property="og:description" content="Replate Recipes to the new NIP format" />
  <meta property="og:image" content="https://zap.cooking/logo_with_text.png" />

  <meta name="twitter:card" content="summary" />
  <meta property="twitter:domain" content="zap.cooking" />
  <meta property="twitter:url" content="https://zap.cooking/replate" />
  <meta name="twitter:title" content="Replate Recipes" />
  <meta name="twitter:description" content="Replate Recipes to the new NIP format" />
  <meta property="twitter:image" content="https://zap.cooking/logo_with_text.png" />
</svelte:head>

<div class="flex flex-col gap-3 md:gap-10">
  <div class="flex gap-2">
    <h2>Replate Recipes</h2>
    <Button
      class="flex gap-2 self-center font-semibold max-md:h-10 max-md:w-10 max-md:justify-center max-md:px-1 max-md:py-1"
      on:click={selectAll}
    >
      <CheckCircleIcon class="self-center" size={16} />
      {$selectedRecipes.size > 0 ? 'Select None' : 'Select All'}
    </Button>
    <Button
      class="flex gap-2 self-center font-semibold max-md:h-10 max-md:w-10 max-md:justify-center max-md:px-1 max-md:py-1"
      disabled={$selectedRecipes.size === 0}
      on:click={replate}
    >
      <CaretCircleRightIcon class="self-center" size={16} />
      Replate Selected
    </Button>
  </div>
  <div class="flex flex-col gap-2">
    <Feed {events} {selectable} {selectedRecipes} />
  </div>
</div>
