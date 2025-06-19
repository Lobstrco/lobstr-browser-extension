# FixedTooltip Component

A React component for displaying tooltips with fixed positioning relative to the viewport.

## Features

- **Fixed Positioning**: Uses `position: fixed` for positioning relative to viewport
- **Automatic Centering**: Automatically centers tooltip relative to trigger element
- **Smart Arrow**: Arrow always points to the center of trigger element
- **Flexible Shifting**: Allows shifting the entire tooltip horizontally in percentages
- **Viewport Safety**: Prevents tooltip from going outside screen boundaries
- **Text Wrapping**: Supports text wrapping and configurable max width
- **Hover Support**: Built-in hover functionality with customizable behavior

## Installation

```tsx
import { FixedTooltip, FIXED_TOOLTIP_POSITION } from "../../basics/FixedTooltip";
```

## Basic Usage

```tsx
<FixedTooltip content={<span>Simple tooltip</span>}>
  <button>Hover me</button>
</FixedTooltip>
```

## Advanced Usage

```tsx
<FixedTooltip
  content={<span>Advanced tooltip with custom settings</span>}
  position={FIXED_TOOLTIP_POSITION.bottom}
  bodyShiftXPercent={30}
  maxWidthPercent={60}
  offset={{ x: 10, y: 5 }}
>
  <img src="icon.png" alt="icon" />
</FixedTooltip>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | **Required.** The trigger element that shows the tooltip on hover |
| `content` | `React.ReactNode` | - | **Required.** The content to display in the tooltip |
| `position` | `FIXED_TOOLTIP_POSITION` | `bottom` | Position of tooltip relative to trigger element |
| `showOnHover` | `boolean` | `true` | Whether to show tooltip on hover |
| `offset` | `{ x: number; y: number }` | `{ x: 0, y: 0 }` | Additional offset in pixels |
| `bodyShiftXPercent` | `number` | `0` | Shift tooltip horizontally in percentages (positive = right, negative = left) |
| `maxWidthPercent` | `number` | `90` | Maximum width as percentage of viewport width |

## Position Options

```tsx
enum FIXED_TOOLTIP_POSITION {
  top = "top",      // Tooltip appears above trigger
  bottom = "bottom", // Tooltip appears below trigger (default)
  left = "left",    // Tooltip appears to the left of trigger
  right = "right"   // Tooltip appears to the right of trigger
}
```

## Examples

### Basic Tooltip
```tsx
<FixedTooltip content={<span>Help text</span>}>
  <IconButton icon="help" />
</FixedTooltip>
```

### Custom Position and Width
```tsx
<FixedTooltip
  content={<span>This is a longer tooltip text that might wrap</span>}
  position={FIXED_TOOLTIP_POSITION.top}
  maxWidthPercent={50}
>
  <InfoIcon />
</FixedTooltip>
```

### Shifted Tooltip
```tsx
<FixedTooltip
  content={<span>Shifted tooltip</span>}
  bodyShiftXPercent={25}
  offset={{ x: 5, y: 10 }}
>
  <Button>Click me</Button>
</FixedTooltip>
```

### Custom Offset
```tsx
<FixedTooltip
  content={<span>Tooltip with custom offset</span>}
  offset={{ x: 20, y: -10 }}
>
  <div>Trigger element</div>
</FixedTooltip>
```

## Styling

The component uses styled-components and follows the project's design system:

- **Colors**: Uses `COLORS` from the design system
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standard padding and margins
- **Shadows**: Subtle box shadows for depth
- **Borders**: Consistent border radius and colors

## Technical Details

### Architecture

The component is split into multiple files for better maintainability:

- `FixedTooltip.tsx` - Main component logic
- `types.ts` - TypeScript interfaces and constants
- `utils.ts` - Utility functions for positioning and calculations
- `styles.ts` - Styled-components definitions
- `index.ts` - Public API exports

### Positioning Logic

1. **Trigger Detection**: Uses `getBoundingClientRect()` to get trigger element position
2. **Tooltip Calculation**: Calculates optimal position based on trigger and tooltip dimensions
3. **Viewport Safety**: Ensures tooltip stays within screen boundaries
4. **Arrow Positioning**: Centers arrow on trigger element regardless of tooltip shift

### Performance Considerations

- Uses `useCallback` for event handlers to prevent unnecessary re-renders
- Position calculation only runs when tooltip is visible
- Efficient DOM queries with refs

## Browser Support

- Modern browsers with ES6+ support
- Requires `getBoundingClientRect()` API
- Styled-components compatibility

## Contributing

When modifying this component:

1. Update types in `types.ts`
2. Add utility functions to `utils.ts`
3. Update styles in `styles.ts`
4. Test all position variants
5. Update documentation and examples 