# Design System Documentation

## Overview
This document defines the design system for the Telko VAS platform, including color schemes, typography, spacing, shadows, gradients, and component styling guidelines.

## Color Palette

### Primary Colors
- **Primary**: `#312e81` (Indigo-900) - Deep dark indigo for buttons, links, and primary actions
- **Primary Dark**: `#1e1b4b` (Indigo-950) - Hover states and active elements
- **Primary Light**: `#4f46e5` (Indigo-600) - Light backgrounds and accents

### Secondary Colors
- **Secondary**: `#7c3aed` (Violet-600) - Deep, vibrant violet for secondary actions and accents
- **Secondary Dark**: `#6d28d9` (Violet-700) - Hover states
- **Secondary Light**: `#8b5cf6` (Violet-500) - Light backgrounds

### Accent Colors
- **Success**: `#10b981` (Emerald-500)
- **Warning**: `#f59e0b` (Amber-500)
- **Error/Destructive**: `#ef4444` (Red-500)
- **Info**: `#3b82f6` (Blue-500)

### Neutral Colors
- **Background**: `#ffffff` (White)
- **Surface**: `#f8fafc` (Slate-50)
- **Card**: `#ffffff` (White) with subtle shadow
- **Border**: `#e2e8f0` (Slate-200)
- **Muted**: `#64748b` (Slate-500)
- **Foreground**: `#0f172a` (Slate-900)

### Sidebar Colors
- **Sidebar Background**: `#8b7fb8` (Periwinkle/Purple) - Medium purple-blue background with subtle gradient
- **Sidebar Hover**: `#9b8fc8` (Lighter Periwinkle) - Hover state with lighter purple tint
- **Sidebar Active**: `#4f46e5` (Indigo-600) - Active item with primary color
- **Sidebar Text**: `#ffffff` (White) - Primary text color for contrast
- **Sidebar Text Muted**: `#e0dfff` (Light Purple) - Secondary text
- **Sidebar Border**: `#7a6da8` (Darker Periwinkle) - Border color with darker purple tint

## Gradients

### Primary Gradients
```css
/* Primary Gradient - Deep indigo-900 to vibrant violet (For hero sections, cards, buttons) */
background: linear-gradient(135deg, #312e81 0%, #7c3aed 100%);

/* Secondary Gradient - Deep violet to purple (For accents and highlights) */
background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);

/* Success Gradient */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* Card Gradient - Subtle background with indigo tint */
background: linear-gradient(135deg, #ffffff 0%, #faf9ff 100%);

/* Sidebar Gradient - Periwinkle/purple gradient */
background: linear-gradient(180deg, #8b7fb8 0%, #7a6da8 100%);
```

### Usage Guidelines
- Use gradients sparingly for emphasis
- Apply to hero sections, important cards, and CTA buttons
- Maintain good contrast for text readability
- Use subtle gradients (10-15% opacity) for backgrounds

## Shadows

### Shadow System
```css
/* Small Shadow - For cards and elevated elements */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

/* Medium Shadow - For modals and dropdowns */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Large Shadow - For popovers and floating elements */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Extra Large Shadow - For modals and overlays */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Colored Shadow - For primary elements (Rich indigo shadow) */
box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.2), 0 2px 4px 0 rgba(79, 70, 229, 0.1);

/* Large Colored Shadow - For prominent elements */
box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.25), 0 4px 6px -2px rgba(79, 70, 229, 0.15);

/* Sidebar Shadow - Deep shadow for sidebar */
box-shadow: 4px 0 20px 0 rgba(30, 27, 75, 0.3);
```

### Tailwind Classes
- `shadow-sm`: Small shadow
- `shadow`: Medium shadow (default)
- `shadow-md`: Medium-large shadow
- `shadow-lg`: Large shadow
- `shadow-xl`: Extra large shadow
- `shadow-2xl`: Maximum shadow

## Typography

### Font Families
- **Primary**: Inter, system-ui, sans-serif
- **Mono**: 'JetBrains Mono', 'Fira Code', monospace

### Font Sizes
- **Display**: 3rem (48px) - Page titles
- **Heading 1**: 2.25rem (36px) - Section titles
- **Heading 2**: 1.875rem (30px) - Subsection titles
- **Heading 3**: 1.5rem (24px) - Card titles
- **Body**: 1rem (16px) - Default text
- **Small**: 0.875rem (14px) - Secondary text
- **Tiny**: 0.75rem (12px) - Labels and captions

### Font Weights
- **Bold**: 700 - Headings and emphasis
- **Semibold**: 600 - Subheadings
- **Medium**: 500 - Important text
- **Regular**: 400 - Body text
- **Light**: 300 - Secondary text

## Spacing

### Spacing Scale
- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-4`: 1rem (16px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)
- `space-12`: 3rem (48px)
- `space-16`: 4rem (64px)

## Component Styling Guidelines

### Cards
- **Background**: White with subtle gradient
- **Border**: 1px solid `#e2e8f0`
- **Border Radius**: 0.5rem (8px)
- **Shadow**: Medium shadow
- **Padding**: 1.5rem (24px)
- **Hover**: Slight shadow increase and scale (1.01)

### Buttons
- **Primary**: Gradient background (primary gradient), white text, medium shadow
- **Secondary**: White background, primary border, primary text
- **Ghost**: Transparent background, text color on hover
- **Destructive**: Red background, white text
- **Border Radius**: 0.375rem (6px)
- **Padding**: 0.5rem 1rem (8px 16px)

### Sidebar
- **Background**: Dark slate (`#1e293b`)
- **Text Color**: Light slate (`#f1f5f9`)
- **Active Item**: Lighter slate background with primary accent
- **Hover**: Medium slate background
- **Border**: Right border in slate-700
- **Icon Size**: 1.25rem (20px)
- **Padding**: 0.75rem 1rem (12px 16px)

### Tables
- **Header Background**: Slate-50
- **Row Hover**: Slate-50 background
- **Border**: Slate-200
- **Alternating Rows**: Subtle background difference
- **Cell Padding**: 0.75rem (12px)

### Inputs
- **Border**: Slate-200
- **Focus Border**: Primary color with ring
- **Border Radius**: 0.375rem (6px)
- **Padding**: 0.5rem 0.75rem (8px 12px)
- **Background**: White

### Badges
- **Primary**: Primary gradient background
- **Secondary**: Slate-100 background, slate-700 text
- **Success**: Emerald-100 background, emerald-700 text
- **Destructive**: Red-100 background, red-700 text
- **Border Radius**: 9999px (fully rounded)

## Implementation

### CSS Variables (globals.css)
The color system is implemented using CSS variables in `app/globals.css`:

```css
:root {
  /* Primary: Indigo-900 (#312e81) - Deep dark indigo */
  --primary: oklch(0.35 0.08 270);
  --primary-foreground: oklch(0.985 0 0);
  
  /* Secondary: Vibrant Violet-600 (#7c3aed) - Deep purple */
  --secondary: oklch(0.52 0.22 285);
  --secondary-foreground: oklch(0.985 0 0);
  
  /* Sidebar - Periwinkle/Purple (#8b7fb8) - Medium purple-blue */
  --sidebar: oklch(0.65 0.08 280);
  --sidebar-foreground: oklch(0.98 0 0);
  --sidebar-primary: oklch(0.35 0.08 270);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.7 0.1 280);
  --sidebar-accent-foreground: oklch(0.98 0 0);
  --sidebar-border: oklch(0.6 0.08 280);
}
```

### Utility Classes (globals.css)
Custom utility classes for gradients and shadows:

```css
.gradient-primary {
  background: linear-gradient(135deg, oklch(0.35 0.08 270) 0%, oklch(0.52 0.22 285) 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, oklch(0.52 0.22 285) 0%, oklch(0.58 0.2 300) 100%);
}

.gradient-card {
  background: linear-gradient(135deg, oklch(1 0 0) 0%, oklch(0.99 0.002 270) 100%);
}

.gradient-sidebar {
  background: linear-gradient(180deg, oklch(0.65 0.08 280) 0%, oklch(0.62 0.08 285) 100%);
}

.shadow-primary {
  box-shadow: 0 4px 14px 0 oklch(0.35 0.08 270 / 0.2), 0 2px 4px 0 oklch(0.35 0.08 270 / 0.1);
}

.shadow-lg-primary {
  box-shadow: 0 10px 25px -5px oklch(0.35 0.08 270 / 0.25), 0 4px 6px -2px oklch(0.35 0.08 270 / 0.15);
}

.shadow-sidebar {
  box-shadow: 2px 0 10px 0 oklch(0.1 0.05 270 / 0.1);
}
```

## Best Practices

1. **Consistency**: Always use the defined color palette and utility classes
2. **Contrast**: Ensure WCAG AA contrast ratios (4.5:1 for text)
3. **Shadows**: Use shadows to create depth and hierarchy
   - Cards: `shadow-md` or `shadow-lg`
   - Buttons: `shadow-md` with `hover:shadow-lg-primary` for primary buttons
   - Sidebar: `shadow-lg` for the sidebar container
4. **Gradients**: Apply gradients to important elements only
   - Use `gradient-primary` for primary CTAs and featured cards
   - Use `gradient-card` for subtle card backgrounds
   - Use `bg-gradient-to-r from-primary to-secondary` for custom gradients
5. **Spacing**: Use the spacing scale consistently
6. **Sidebar**: Always use dark theme with `bg-sidebar` and sidebar color variables
7. **Cards**: Add subtle shadows (`shadow-md`) and hover effects (`hover:shadow-lg`)
8. **Buttons**: Use `gradient-primary` class for primary buttons
9. **Borders**: Keep borders subtle using `border-border` or `border-sidebar-border`
10. **Typography**: Maintain consistent font sizes and weights
11. **Transitions**: Add `transition-all duration-200` for smooth interactions
12. **Hover States**: Enhance hover states with shadow increases and color changes

## Examples

### Card with Gradient and Shadow
```tsx
<Card className="gradient-card shadow-lg hover:shadow-xl transition-shadow">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>
```

### Card with Primary Gradient
```tsx
<div className="rounded-lg gradient-primary p-6 shadow-lg-primary">
  <h3 className="text-white font-bold">Featured Card</h3>
  <p className="text-white/90">Card description</p>
</div>
```

### Sidebar Item (Already Implemented)
```tsx
<Link className={cn(
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
  isActive
    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
)}>
  <Icon className="h-5 w-5" />
  <span>Menu Item</span>
</Link>
```

### Button with Gradient
```tsx
<Button className="gradient-primary text-white shadow-md hover:shadow-lg-primary transition-all">
  Click Me
</Button>
```

### KPI Card with Gradient Accent
```tsx
<Card className="gradient-card shadow-md hover:shadow-lg transition-all">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
      ₦1,234,567
    </div>
  </CardContent>
</Card>
```

### Badge with Gradient
```tsx
<Badge className="gradient-primary text-white shadow-sm">
  Premium
</Badge>
```

### Table Row with Hover Effect
```tsx
<TableRow className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-colors">
  <TableCell>Content</TableCell>
</TableRow>
```

## Color Accessibility

- Primary text on white: ✅ Passes WCAG AA
- White text on primary: ✅ Passes WCAG AA
- Sidebar text on dark: ✅ Passes WCAG AA
- Always test contrast ratios for custom combinations

