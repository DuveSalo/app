/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'-apple-system',
  				'sans-serif'
  			],
  			display: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'IBM Plex Mono',
  				'Menlo',
  				'monospace'
  			]
  		},
  		colors: {
  			content: {
  				DEFAULT: '#18181b',
  				secondary: '#52525b',
  				muted: '#71717a',
  				light: '#a1a1aa',
  				inverse: '#fafafa'
  			},
  			surface: {
  				DEFAULT: '#fafafa',
  				card: '#ffffff',
  				elevated: '#ffffff',
  				subtle: '#f4f4f5',
  				muted: '#e4e4e7',
  				hover: '#f8f8f9'
  			},
  			borderClr: {
  				DEFAULT: '#e4e4e7',
  				subtle: '#f4f4f5',
  				strong: '#d4d4d8',
  				focus: '#18181b'
  			},
  			brand: {
  				'50': '#fafafa',
  				'100': '#f4f4f5',
  				'200': '#e4e4e7',
  				'300': '#d4d4d8',
  				'400': '#a1a1aa',
  				'500': '#71717a',
  				'700': '#27272a',
  				'800': '#18181b',
  				'900': '#09090b',
  				DEFAULT: '#18181b'
  			},
  			accent: {
  				'50': '#eef2ff',
  				'100': '#e0e7ff',
  				'200': '#c7d2fe',
  				'300': '#a5b4fc',
  				'400': '#818cf8',
  				'500': '#6366f1',
  				'700': '#4338ca',
  				'800': '#3730a3',
  				'900': '#312e81',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			status: {
  				success: {
  					'50': '#ecfdf5',
  					'100': '#d1fae5',
  					'200': '#a7f3d0',
  					bg: '#ecfdf5',
  					DEFAULT: '#059669',
  					text: '#047857',
  					dark: '#047857'
  				},
  				warning: {
  					'50': '#fffbeb',
  					'100': '#fef3c7',
  					'200': '#fde68a',
  					bg: '#fffbeb',
  					DEFAULT: '#d97706',
  					text: '#b45309',
  					dark: '#b45309'
  				},
  				danger: {
  					'50': '#fff1f2',
  					'100': '#ffe4e6',
  					'200': '#fecdd3',
  					bg: '#fff1f2',
  					DEFAULT: '#e11d48',
  					text: '#be123c',
  					dark: '#be123c'
  				},
  				info: {
  					'50': '#f0f9ff',
  					'100': '#e0f2fe',
  					'200': '#bae6fd',
  					bg: '#f0f9ff',
  					DEFAULT: '#0284c7',
  					text: '#0369a1',
  					dark: '#0369a1'
  				}
  			},
  			metric: {
  				total: {
  					bg: '#f4f4f5',
  					icon: '#71717a',
  					text: '#52525b',
  					accent: '#18181b'
  				},
  				valid: {
  					bg: '#ecfdf5',
  					icon: '#059669',
  					text: '#047857',
  					accent: '#059669'
  				},
  				warning: {
  					bg: '#fffbeb',
  					icon: '#d97706',
  					text: '#b45309',
  					accent: '#d97706'
  				},
  				danger: {
  					bg: '#fff1f2',
  					icon: '#e11d48',
  					text: '#be123c',
  					accent: '#e11d48'
  				}
  			},
  			primary: {
  				'50': '#eef2ff',
  				'100': '#e0e7ff',
  				'200': '#c7d2fe',
  				'700': '#4338ca',
  				'800': '#3730a3',
  				'900': '#312e81',
  				light: '#818cf8',
  				DEFAULT: 'hsl(var(--primary))',
  				dark: '#4338ca',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#fafafa',
  				'100': '#f4f4f5',
  				'200': '#e4e4e7',
  				'300': '#d4d4d8',
  				'400': '#a1a1aa',
  				'500': '#71717a',
  				'700': '#3f3f46',
  				'800': '#27272a',
  				'900': '#18181b',
  				light: '#71717a',
  				DEFAULT: 'hsl(var(--secondary))',
  				dark: '#3f3f46',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			danger: {
  				'50': '#fff1f2',
  				'100': '#ffe4e6',
  				light: '#fecdd3',
  				DEFAULT: '#e11d48',
  				dark: '#be123c'
  			},
  			success: {
  				'50': '#ecfdf5',
  				'100': '#d1fae5',
  				light: '#a7f3d0',
  				DEFAULT: '#059669',
  				dark: '#047857'
  			},
  			warning: {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				light: '#fde68a',
  				DEFAULT: '#d97706',
  				dark: '#b45309'
  			},
  			info: {
  				'50': '#f0f9ff',
  				'100': '#e0f2fe',
  				light: '#bae6fd',
  				DEFAULT: '#0284c7',
  				dark: '#0369a1'
  			},
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
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			xs: '0 1px 2px 0 rgb(0 0 0 / 0.02)',
  			sm: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.02)',
  			DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 2px 6px -1px rgb(0 0 0 / 0.03)',
  			md: '0 2px 4px 0 rgb(0 0 0 / 0.03), 0 4px 12px -2px rgb(0 0 0 / 0.04)',
  			lg: '0 4px 6px 0 rgb(0 0 0 / 0.03), 0 10px 20px -4px rgb(0 0 0 / 0.06)',
  			xl: '0 8px 16px 0 rgb(0 0 0 / 0.04), 0 20px 40px -8px rgb(0 0 0 / 0.08)',
  			card: '0 1px 2px 0 rgb(0 0 0 / 0.02), 0 1px 4px 0 rgb(0 0 0 / 0.02)',
  			'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.06), 0 8px 20px -4px rgb(0 0 0 / 0.04)',
  			dropdown: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 12px 24px -4px rgb(0 0 0 / 0.08)',
  			inner: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.03)',
  			ring: '0 0 0 3px rgb(24 24 27 / 0.08)',
  			'ring-accent': '0 0 0 3px rgb(79 70 229 / 0.15)'
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			DEFAULT: '0.5rem',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '0.875rem',
  			'2xl': '1rem',
  			'3xl': '1.25rem'
  		},
  		keyframes: {
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(6px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.97)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-6px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(8px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'pulse-soft': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.75'
  				}
  			},
  			spin: {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'fade-in': 'fade-in 0.15s ease-out',
  			'fade-in-up': 'fade-in-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  			'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-in-right': 'slide-in-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-up': 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			spin: 'spin 1s linear infinite',
  			shimmer: 'shimmer 2s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'4.5': '1.125rem',
  			'5.5': '1.375rem'
  		},
  		letterSpacing: {
  			tighter: '-0.03em',
  			tight: '-0.015em',
  			normal: '0',
  			wide: '0.015em',
  			wider: '0.05em',
  			widest: '0.1em'
  		},
  		lineHeight: {
  			tighter: '1.1',
  			tight: '1.25',
  			snug: '1.375',
  			normal: '1.5',
  			relaxed: '1.625',
  			loose: '1.75'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
