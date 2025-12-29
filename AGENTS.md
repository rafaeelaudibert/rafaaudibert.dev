# Agent Guidelines for rafaaudibert.dev

This document provides guidelines for AI agents working on this codebase.

## Project Overview

This is a personal portfolio website built with [Astro](https://astro.build/). It uses:

- **Astro** for static site generation
- **TypeScript** for type safety
- **CSS custom properties** for theming (light/dark mode)
- **Custom web components** for interactive elements

## Accessibility Requirements

All changes must maintain or improve keyboard accessibility. Follow these practices:

### 1. Focus Indicators

- **Always use `:focus-visible`** instead of just `:focus` to avoid showing focus rings on mouse clicks
- Focus indicators should use `outline: 2px solid var(--accent-regular)` with `outline-offset: 2px`
- Never use `outline: none` without providing an alternative focus indicator
- The global styles in `src/styles/global.css` provide baseline focus styles

```css
/* Good - only shows on keyboard navigation */
element:focus-visible {
  outline: 2px solid var(--accent-regular);
  outline-offset: 2px;
}

/* Bad - removes focus indicator entirely */
element:focus {
  outline: none;
}
```

### 2. Interactive Elements

- **Buttons**: Use native `<button>` elements when possible - they're keyboard accessible by default
- **Links**: Use `<a>` elements for navigation, `<button>` for actions
- **Custom interactive elements**: Must have:
  - `tabindex="0"` to make them focusable
  - `role` attribute (e.g., `role="button"`)
  - `aria-label` for non-text content
  - Keyboard event handlers for Enter and Space keys

```astro
<!-- Good - keyboard accessible custom element -->
<div
  tabindex="0"
  role="button"
  aria-label="Description of action"
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction();
    }
  }}
>
  Interactive content
</div>
```

### 3. Skip Links

- The `BaseLayout.astro` includes a skip link that targets `#main-content`
- All pages should ensure their main content container has `tabindex="-1"` so it can receive focus
- The skip link is visually hidden until focused

### 4. Mobile Menu / Modals

- Menus and modals should close when Escape key is pressed
- Focus should return to the trigger element when closed
- Consider focus trapping for modal dialogs

### 5. External Links

- Links that open in new tabs should indicate this to screen readers
- Use the `Link.astro` component which adds "(opens in new tab)" for screen readers
- Include `rel="noopener noreferrer"` for security

### 6. Images and Visual Content

- All `<img>` elements must have `alt` attributes
- Decorative images should have `alt=""`
- Interactive images need `role="button"` and keyboard handlers
- Complex visualizations (like the globe) should have:
  - `role="img"` with descriptive `aria-label`
  - `aria-live` for dynamic content updates
  - `role="alert"` for error states

### 7. Form Elements

- All form inputs must have associated `<label>` elements
- Use `aria-describedby` for additional help text
- Error messages should use `aria-live="polite"` or `role="alert"`

### 8. ARIA Attributes

Common ARIA patterns used in this codebase:

| Attribute             | Usage                                           |
| --------------------- | ----------------------------------------------- |
| `aria-expanded`       | Toggle buttons (menu, accordion)                |
| `aria-pressed`        | Toggle buttons with on/off state (theme toggle) |
| `aria-label`          | Labels for elements without visible text        |
| `aria-hidden="true"`  | Decorative elements (icons next to text)        |
| `aria-current="page"` | Current page in navigation                      |
| `aria-live`           | Dynamic content regions                         |

### 9. Screen Reader Text

Use the `.sr-only` utility class for screen-reader-only text:

```astro
<span class="sr-only">Descriptive text for screen readers</span>
```

## Theming

- The site supports light and dark themes
- Use CSS custom properties for colors (e.g., `var(--gray-0)`, `var(--accent-regular)`)
- Test both themes when adding visual changes
- Respect `prefers-reduced-motion` for animations
- Support `forced-colors` mode for high contrast users

## Component Patterns

### Creating New Components

1. Use semantic HTML elements where possible
2. Include `:hover` and `:focus` states together
3. Add `transition` for smooth state changes
4. Test keyboard navigation

### Existing Components to Reference

- `Nav.astro` - Mobile menu with keyboard support
- `ThemeToggle.astro` - Toggle button with aria-pressed
- `CallToAction.astro` - Accessible CTA button
- `Link.astro` - External link handling
- `PostPreview.astro` - Card component with focus styles
