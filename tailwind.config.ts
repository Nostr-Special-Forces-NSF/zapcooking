import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme';

import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts,css}'],

  theme: {
	extend: {
	  fontFamily: {
		sans: ['Geist', ...defaultTheme.fontFamily.sans]
	  },
	  colors: {
		primary: '#EC4700',
		danger: '#FF3535',
		input: '#F6F6F6',
		'accent-gray': '#DDDDDD',
		caption: '#716F6C'
	  }
	}
  },

  plugins: [typography, forms]
} satisfies Config;
