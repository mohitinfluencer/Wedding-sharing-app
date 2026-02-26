import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
                serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
            },
            colors: {
                gold: {
                    50: '#fdf9f0',
                    100: '#faf0d7',
                    200: '#f5dea8',
                    300: '#efc76e',
                    400: '#e8ad3f',
                    500: '#d4941e',
                    600: '#b87415',
                    700: '#925613',
                    800: '#794617',
                    900: '#673a18',
                },
                rose: {
                    50: '#fff1f2',
                    100: '#ffe4e6',
                    200: '#fecdd3',
                    300: '#fda4af',
                    400: '#fb7185',
                    500: '#f43f5e',
                    600: '#e11d48',
                    700: '#be123c',
                    800: '#9f1239',
                    900: '#881337',
                },
                cream: {
                    50: '#fdfaf7',
                    100: '#faf3ec',
                    200: '#f5e6d3',
                    300: '#ecd2b0',
                    400: '#e1b882',
                    500: '#d4a060',
                    600: '#c4854a',
                    700: '#a36a3b',
                    800: '#855634',
                    900: '#6e472d',
                },
                slate: {
                    850: '#1a2035',
                    950: '#0d1117',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-up': 'fadeUp 0.6s ease-out forwards',
                'scale-in': 'scaleIn 0.3s ease-out forwards',
                shimmer: 'shimmer 1.5s infinite',
                float: 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-golden': 'linear-gradient(135deg, #d4941e 0%, #e8c66a 50%, #d4941e 100%)',
                'gradient-romantic': 'linear-gradient(135deg, #ff6b9d 0%, #ffeaa7 50%, #ff6b9d 100%)',
            },
        },
    },
    plugins: [],
};

export default config;
