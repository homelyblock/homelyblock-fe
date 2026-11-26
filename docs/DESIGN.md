# HomelyBlock — UI Design System

## Status
This is the initial design direction. The palette and components must be validated against user needs and then treated as the UI source of truth. Do not invent additional colors or typography without updating this file.

## Brand feel
Clear, dependable, calm, and practical. The interface should feel like a useful society utility, not a social network or a flashy marketing dashboard.

## Design principles
1. **Clarity first:** show the next useful action and meaningful status.
2. **Mobile-first:** resident tasks must work comfortably on narrow screens.
3. **Trust and restraint:** use consistent patterns, readable type, accessible contrast, and restrained color.

## Color tokens
Implemented in `homelyblock-fe/src/app/globals.css`. The balance is 60% ivory canvas, 30% white surfaces, and 10% evergreen actions. Do not add extra decorative colors.

### Light mode — Evergreen & Ivory
- Primary / Evergreen: `#244C3A` (buttons, active navigation, important actions)
- Primary hover: `#1B3C2C`
- Accent / Sage: `#DCE8DE` (selected states, subtle highlights, icon backgrounds)
- Accent strong: `#37634E` (inline links and sidebar group labels)
- Page background / Ivory: `#F7F6F0`
- Surface / cards: `#FFFFFF`
- Primary text: `#303B35`
- Secondary text: `#5C675E`
- Borders: `#E5E7E1`
- Table header: `#F0F1EC`
- Success: `#1F6B3A`
- Warning: `#8A5A12`
- Error: `#9F2D2D`
- Info: `#3D5563`
- Attention (needs action): same warm family as warning (`--theme-attention`); use soft tint chips, not neon badges
- Raised surface (dark): slightly lighter than the base card so drawers and sheets separate from the canvas

The specified secondary text `#68756B` is 4.46:1 on ivory and 4.26:1 on the table header, below WCAG AA. The text token stays in that green-grey hue and is darkened to `#5C675E` so secondary copy clears 4.5:1 on ivory, white, sage, and table headers.

### Dark mode
Dark mode is available from the theme switcher. It keeps the same roles: ivory text on a deep evergreen field, sage for selected states, and sage buttons with evergreen text so links and actions stay above 4.5:1. Semantic success, warning, error, and info colors stay distinct from the brand green.

## Typography
- Font: Geist Sans, already loaded by the frontend. Mono stays Geist Mono for code.
- Suggested scale: 12, 14, 16, 18, 20, 24, 30, 36 px.
- Body text: 14–16 px with comfortable line height.
- Headings: 600–700 weight; body: 400–500.
- Keep line length readable and avoid low-contrast secondary text.

## Spacing and shape
- Base spacing unit: 4 px.
- Common spacing: 4, 8, 12, 16, 24, 32, 40, 48 px.
- Radius: 12 px for controls, 16 px for cards and panels.
- Shadows: soft elevation on cards and dialogs. Borders still define structure.
- Motion: short fade-and-rise on page entry, menus, and dialogs. Honor `prefers-reduced-motion`.

## Responsive behavior
- Mobile-first.
- Suggested breakpoints: 640 px, 768 px, 1024 px, 1280 px; adapt to the framework's existing conventions.
- Use a mobile navigation pattern appropriate to the number of primary destinations.
- Tables should become cards or horizontally scroll only when the content remains usable.
- Avoid fixed widths that cause overflow.

## Component specifications
- Buttons: primary, secondary, tertiary, danger; include hover, focus-visible, disabled, and loading states.
- Inputs: visible label, hint when needed, field-level validation, disabled state, and keyboard focus.
- Cards: consistent padding, title hierarchy, and optional status/actions.
- Dialogs: clear title, explicit cancel/confirm actions, keyboard focus handling, and accessible labeling.
- Navigation: show active location and provide consistent mobile behavior.
- Tables/lists: meaningful empty state, pagination where needed, and accessible labels.
- Toasts/alerts: concise, actionable, and not the only way errors are communicated.
- Status labels: text plus color/icon where appropriate; never rely on color alone.

## Screen inventory
1. Sign-in and any approved onboarding screens.
2. Role-aware application shell.
3. Society admin dashboard.
4. Resident dashboard.
5. Society profile and settings.
6. Building/unit management.
7. Resident/membership management.
8. Notice list, detail, and create/edit screens.
9. Visitor list, detail, create, and decision screens.
10. Maintenance/dues screens only if included in the approved phase.
11. Service directory screens only if included in the approved phase.
12. Profile and session controls.
13. Platform-owner society management.

Do not build every screen at once. Follow `DEVELOPMENT.md`.

## Accessibility
- Semantic HTML and associated form labels.
- Keyboard navigation and visible focus.
- Sufficient color contrast validated with tooling.
- Meaningful errors and status text.
- Accessible dialog behavior.
- Touch targets suitable for mobile use.
- Respect reduced-motion preferences.
