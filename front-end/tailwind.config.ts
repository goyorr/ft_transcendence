const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx,js}",
    "./components/**/*.{ts,tsx,js}",
    "./app/**/*.{ts,tsx,js}",
    "./src/**/*.{ts,tsx,js}",
    "./node_modules/flowbite/**/*.js",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      height: {
        'screen-minus-180': 'calc(100vh - 200px)',
        'screen-minus-100': 'calc(100vh - 120px)',
      },
      screens: {
        '4xl': '2010px',
      },
      backgroundImage: {
        'custom-gradient': 'red',
      },
      fontFamily: {
        'luckiest-guy': ['"Luckiest Guy"', 'cursive'],
        'press-start': ['"Press Start 2P"', 'cursive'],
        'madimi-one': ['"Madimi One"', 'sans-serif'],
        },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        slideInDown: {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        slideInDown: 'slideInDown 0.5s ease-out forwards',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: (utilities: Record<string, any>, options?: any) => void }) {
		  const newUtilities = {
			'.text-stroke': {
			  'text-shadow': '-4px -4px 0 #000, 4px -4px 0 #000, -4px 4px 0 #000, 4px 4px 0 #000',
			},
		  }
		  addUtilities(newUtilities)
		}
	  ],
}

export default config