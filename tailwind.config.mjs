/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
        'dark-yellow': '#fca311',
				'med-blue': '#1C829C'
      },
			fontFamily: {
				'display': ['Urbanist', 'sans-serif'],
				'body': ['Roboto', 'sans-serif']
			}
		},
	},
	plugins: [],
}
