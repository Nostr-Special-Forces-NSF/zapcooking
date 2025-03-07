export const standardRelays = [
  'wss://relay.nostrsf.org'
  //'wss://nostr.mom',
  //'wss://relay.nostr.bg',
  //'wss://nostr.wine',
  //'wss://relay.nostr.band'
];

export type recipeTag =
  | string
  | {
      title: string;
      visableTitle?: string;
      emoji?: string;
    };

export type recipeTagSimple = {
  title: string;
  emoji?: string;
};

export const dietaryRestrictions: recipeTagSimple[] = [
  { title: 'Vegan', emoji: '🌱' },
  { title: 'Vegetarian', emoji: '🥕' },
  { title: 'Pescatarian', emoji: '🐟' },
  { title: 'Keto', emoji: '🥩' },
  { title: 'Paleo', emoji: '🍖' },
  { title: 'Diabetic-Friendly', emoji: '🩸' },
  { title: 'Gluten-Free', emoji: '🚫🌾' },
  { title: 'Dairy-Free', emoji: '🥛🚫' },
  { title: 'Nut-Free', emoji: '🥜🚫' },
  { title: 'Soy-Free', emoji: '🌱🚫' },
  { title: 'Shellfish-Free', emoji: '🦐🚫' },
  { title: 'Kosher', emoji: '✡️' },
  { title: 'Halal', emoji: '☪️' },
  { title: 'Low-Carb', emoji: '⚡' },
  { title: 'Low-Fat', emoji: '🩻' },
  { title: 'Low-Sodium', emoji: '🧂🚫' },
  { title: 'High-Protein', emoji: '💪' },
  { title: 'Whole30', emoji: '🥑' },
  { title: 'Raw Food', emoji: '🥗' },
  { title: 'Fruitarian', emoji: '🍎' },
  { title: 'Flexitarian', emoji: '🔀' },
  { title: 'No Added Sugar', emoji: '🍭🚫' },
  { title: 'Anti-Inflammatory', emoji: '🔥🚫' },
  { title: 'Gut-Friendly (Low FODMAP)', emoji: '🥒' },
  { title: 'Carnivore', emoji: '🥩🍖' },
  { title: 'Mediterranean Diet', emoji: '🇬🇷' },
  { title: 'DASH Diet', emoji: '💙' },
  { title: 'GAPS Diet', emoji: '🥄' },
  { title: 'Autoimmune Protocol (AIP)', emoji: '🛡️' },
  { title: 'Lectin-Free', emoji: '🍅🚫' },
  { title: 'Blood Type Diet', emoji: '🩸🔬' },
  { title: 'Macrobiotic', emoji: '🌾🍵' },
  { title: 'Ayurvedic Diet', emoji: '🕉️' },
  { title: 'Sattvic Diet', emoji: '☀️' },
  { title: 'Primal Diet', emoji: '🦴' },
  { title: 'Plant-Based', emoji: '🌿' },
  { title: 'Glucose-Control', emoji: '🩸💉' },
  { title: 'Weight Loss', emoji: '⚖️' },
  { title: 'Muscle Gain', emoji: '🏋️' },
  { title: 'Intermittent Fasting', emoji: '⏳' },
  { title: 'OMAD (One Meal A Day)', emoji: '🍽️' },
  { title: 'Mind Diet', emoji: '🧠' },
  { title: 'Heart-Healthy', emoji: '❤️' },
  { title: 'Kidney-Friendly', emoji: '🫘' },
  { title: 'Liver Detox', emoji: '🫁' },
  { title: 'Pregnancy-Safe', emoji: '🤰' },
  { title: 'Baby Food Diet', emoji: '👶' }
];

export const toolTags: recipeTagSimple[] = [
  { title: 'Knife', emoji: '🔪' },
  { title: 'Cutting Board', emoji: '🪵' },
  { title: 'Measuring Cups', emoji: '🧮' },
  { title: 'Measuring Spoons' },
  { title: 'Mixing Bowl', emoji: '🥣' },
  { title: 'Spatula', emoji: '🍳' },
  { title: 'Whisk', emoji: '🎚️' },
  { title: 'Tongs' },
  { title: 'Colander', emoji: '🕳️' },
  { title: 'Peeler' },
  { title: 'Grater' },
  { title: 'Rolling Pin', emoji: '🪁' },
  { title: 'Kitchen Scissors' },
  { title: 'Meat Thermometer', emoji: '🌡️' },
  { title: 'Can Opener' },
  { title: 'Meat Tenderizer' },
  { title: 'Mandoline' },
  { title: 'Mortar and Pestle', emoji: '🪨' },
  { title: 'Hand Mixer', emoji: '🔌' },
  { title: 'Stand Mixer', emoji: '🌀' },
  { title: 'Oven Mitts', emoji: '🧤' },
  { title: 'Timer', emoji: '⏲️' },
  { title: 'Air Fryer', emoji: '🌬️' },
  { title: 'Instant Pot' },
  { title: 'Slow Cooker' },
  { title: 'Toaster', emoji: '🍞' },
  { title: 'Blender', emoji: '🔌' },
  { title: 'Food Processor' },
  { title: 'Microwave', emoji: '📡' },
  { title: 'Rice Cooker', emoji: '🍚' },
  { title: 'Deep Fryer', emoji: '🥘' },
  { title: 'Electric Kettle', emoji: '♨️' },
  { title: 'Waffle Maker', emoji: '🧇' },
  { title: 'Grill', emoji: '🔥' },
  { title: 'Sous Vide' },
  { title: 'Pressure Cooker' },
  { title: 'Stove', emoji: '🔥' },
  { title: 'Oven', emoji: '🍳' },
  { title: 'Fridge', emoji: '❄️' },
  { title: 'Freezer', emoji: '🧊' }
];

export const recipeTags: recipeTagSimple[] = [
  { title: 'Alcohol', emoji: '🍸' },
  { title: 'Almond' },
  { title: 'American', emoji: '🇺🇸' },
  { title: 'Apple', emoji: '🍎' },
  { title: 'Argentinian', emoji: '🇦🇷' },
  { title: 'Asian', emoji: '🥢' },
  { title: 'Australian', emoji: '🇦🇺' },
  { title: 'Austrian', emoji: '🇦🇹' },
  { title: 'Bacon', emoji: '🥓' },
  { title: 'Baked' },
  { title: 'Bariatric' },
  { title: 'Basic' },
  { title: 'Beans', emoji: '🧆' },
  { title: 'Beef', emoji: '🐄' },
  { title: 'Beetroot' },
  { title: 'Belgian', emoji: '🇧🇪' },
  { title: 'Blended' },
  { title: 'Brazilian', emoji: '🇧🇷' },
  { title: 'Bread', emoji: '🍞' },
  { title: 'Breakfast', emoji: '🍳' },
  { title: 'Broccoli' },
  { title: 'Built' },
  { title: 'Cabbage' },
  { title: 'Cajun' },
  { title: 'Cake', emoji: '🍰' },
  { title: 'Cheese', emoji: '🧀' },
  { title: 'Cheesefare' },
  { title: 'Chicken', emoji: '🍗' },
  { title: 'Chinese', emoji: '🥡' },
  { title: 'Chocolate', emoji: '🍫' },
  { title: 'Christmas', emoji: '🎄' },
  { title: 'Cocktail', emoji: '🍹' },
  { title: 'Coconut', emoji: '🥥' },
  { title: 'Cookies', emoji: '🍪' },
  { title: 'Coffee', emoji: '☕' },
  { title: 'Corn', emoji: '🌽' },
  { title: 'Cream', emoji: '🥛' },
  { title: 'Curry' },
  { title: 'Danish' },
  { title: 'Dessert', emoji: '🧁' },
  { title: 'Digestivo' },
  { title: 'Dominican', emoji: '🇩🇴' },
  { title: 'Dough' },
  { title: 'Dressing' },
  { title: 'Drinks', emoji: '🥤' },
  { title: 'Duck', emoji: '🦆' },
  { title: 'Dumpling', emoji: '🥟' },
  { title: 'Dutch', emoji: '🇳🇱' },
  { title: 'Easter', emoji: '🐰' },
  { title: 'Easy', emoji: '😌' },
  { title: 'Eggs', emoji: '🥚' },
  { title: 'English', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { title: 'Fasting' },
  { title: 'Feta', emoji: '🧀' },
  { title: 'Filipino', emoji: '🇵🇭' },
  { title: 'Fish', emoji: '🐟' },
  { title: 'French', emoji: '🇫🇷' },
  { title: 'Frozen', emoji: '🥶' },
  { title: 'Fruit', emoji: '🍇' },
  { title: 'Fry' },
  { title: 'Galician' },
  { title: 'Garlic', emoji: '🧄' },
  { title: 'German', emoji: '🇩🇪' },
  { title: 'Greek', emoji: '🇬🇷' },
  { title: 'Ham', emoji: '🍖' },
  { title: 'Hungarian', emoji: '🇭🇺' },
  { title: 'Indian', emoji: '🇮🇳' },
  { title: 'Irish', emoji: '☘️' },
  { title: 'Israeli', emoji: '🇮🇱' },
  { title: 'Italian', emoji: '🇮🇹' },
  { title: 'Jam' },
  { title: 'Japanese', emoji: '🇯🇵' },
  { title: 'Keto' },
  { title: 'Lamb', emoji: '🐑' },
  { title: 'Layered' },
  { title: 'Lebanese', emoji: '🇱🇧' },
  { title: 'Lemons', emoji: '🍋' },
  { title: 'Lentil' },
  { title: 'Liquor', emoji: '🥃' },
  { title: 'Liver', emoji: '🍖' },
  { title: 'Lunch', emoji: '🍴' },
  { title: 'Meat', emoji: '🥩' },
  { title: 'Mediterranean', emoji: '🏖️' },
  { title: 'Mexican', emoji: '🇲🇽' },
  { title: 'Middle-Eastern' },
  { title: 'Milk', emoji: '🥛' },
  { title: 'Mushrooms', emoji: '🍄' },
  { title: 'Mutton', emoji: '🐑' },
  { title: 'Noodles', emoji: '🍜' },
  { title: 'Oven', emoji: '🔥' },
  { title: 'Palestinian' },
  { title: 'Pancake', emoji: '🥞' },
  { title: 'Pasta', emoji: '🍝' },
  { title: 'Pastry', emoji: '🥐' },
  { title: 'Pate' },
  { title: 'Peppers', emoji: '🌶️' },
  { title: 'Peruvian', emoji: '🇵🇪' },
  { title: 'Pie', emoji: '🥧' },
  { title: 'Pizza', emoji: '🍕' },
  { title: 'Polish', emoji: '🇵🇱' },
  { title: 'Pork', emoji: '🐖' },
  { title: 'Portuguese', emoji: '🇵🇹' },
  { title: 'Potato', emoji: '🥔' },
  { title: 'Pub' },
  { title: 'Quebec', emoji: '🍁' },
  { title: 'Quick', emoji: '🌭' },
  { title: 'Raw' },
  { title: 'Rice', emoji: '🍚' },
  { title: 'Roast', emoji: '🍖' },
  { title: 'Romanian', emoji: '🇷🇴' },
  { title: 'Russian', emoji: '🇷🇺' },
  { title: 'Salad', emoji: '🥗' },
  { title: 'Sandwich', emoji: '🥪' },
  { title: 'Sauce', emoji: '🍲' },
  { title: 'Sausage', emoji: '🌭' },
  { title: 'Seafood', emoji: '🦐' },
  { title: 'Shaken', emoji: '🫨' },
  { title: 'Shrimp', emoji: '🦐' },
  { title: 'Side' },
  { title: 'Slowcooked', emoji: '⏲️' },
  { title: 'Snack', emoji: '🍿' },
  { title: 'Soup', emoji: '🍲' },
  { title: 'Sourdough', emoji: '🍞' },
  { title: 'Southern' },
  { title: 'Southwest' },
  { title: 'Spanish', emoji: '🇪🇸' },
  { title: 'Spice', emoji: '🌶️' },
  { title: 'Spicy', emoji: '🌶️' },
  { title: 'Spinach', emoji: '🍃' },
  { title: 'Spread' },
  { title: 'Squash' },
  { title: 'Steak', emoji: '🥩' },
  { title: 'Stew', emoji: '🍲' },
  { title: 'Stirred', emoji: '🥄' },
  { title: 'Stock', emoji: '🍲' },
  { title: 'Supper', emoji: '🍽️' },
  { title: 'Swedish', emoji: '🇸🇪' },
  { title: 'Sweet', emoji: '🍬' },
  { title: 'Swiss', emoji: '🇨🇭' },
  { title: 'Syrup', emoji: '🍯' },
  { title: 'Thai', emoji: '🇹🇭' },
  { title: 'Tofu', emoji: '🥢' },
  { title: 'Tomato', emoji: '🍅' },
  { title: 'Tortilla', emoji: '🌮' },
  { title: 'Traditional' },
  { title: 'Traybake' },
  { title: 'Tuna', emoji: '🐟' },
  { title: 'Tunisian', emoji: '🇹🇳' },
  { title: 'Turkey', emoji: '🦃' },
  { title: 'Turkish', emoji: '🇹🇷' },
  { title: 'Ukrainian', emoji: '🇺🇦' },
  { title: 'Uzbek', emoji: '🇺🇿' },
  { title: 'Veal', emoji: '🐄' },
  { title: 'Vegetables', emoji: '🥦' },
  { title: 'Vegan', emoji: '🌱' },
  { title: 'Raw Vegan' },
  { title: 'Vietnamese', emoji: '🇻🇳' },
  { title: 'Wholemeal' },
  { title: 'Wine', emoji: '🍷' },
  { title: 'Yucatecan', emoji: '🇲🇽' },
  { title: 'Healthy', emoji: '🍏' },
  { title: 'Gluten Free', emoji: '🥗' }
];
