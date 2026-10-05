/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			gold: {
  				DEFAULT: 'hsl(var(--gold))',
  				foreground: 'hsl(var(--gold-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))'
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			impact: ['var(--font-impact)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  			'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
  			'pop-in': { '0%': { transform: 'scale(0) rotate(-20deg)', opacity: '0' }, '70%': { transform: 'scale(1.15) rotate(6deg)', opacity: '1' }, '100%': { transform: 'scale(1) rotate(0)', opacity: '1' } },
  			'shake': { '0%,100%': { transform: 'rotate(0)' }, '25%': { transform: 'rotate(-2deg)' }, '75%': { transform: 'rotate(2deg)' } },
  			'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
  			'bam': { '0%': { transform: 'scale(0) rotate(-30deg)', opacity: '0' }, '50%': { transform: 'scale(1.3) rotate(10deg)', opacity: '1' }, '100%': { transform: 'scale(1) rotate(0)', opacity: '0' } }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'pop-in': 'pop-in 0.4s ease-out',
  			'shake': 'shake 0.4s ease-in-out',
  			'float': 'float 3s ease-in-out infinite',
  			'bam': 'bam 0.5s ease-out forwards'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
