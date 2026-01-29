
## Offset The Listener to Clear the Input Field

The Listener's SVG is vertically centered on screen, which causes it to overlap with the text input field (also vertically centered). We'll nudge The Listener downward just enough to clear the prompt section while keeping both elements roughly in the visual center.

---

### Changes

**File: `src/components/TheListener.tsx`**

Add a vertical offset to the container so the entity sits lower on the screen:

- Change the container's `className` from `items-center` to use a slight downward translation
- Add `style={{ transform: 'translateY(12vh)' }}` (or similar) to shift the SVG ~12% of the viewport height down
- This keeps the head/ears visible in the upper-center while clearing the input area

Alternatively, add `pt-[12vh]` padding to push the content down. Either approach achieves the same visual result.

---

### Technical Details

| Property | Current | Proposed |
|----------|---------|----------|
| Vertical alignment | `items-center justify-center` (true center) | Add `translateY(12vh)` offset |
| Z-index layering | Listener at z-20, input at z-40 | No change needed |
| Responsive | Same offset on all sizes | Could fine-tune per breakpoint if needed |

The 12vh offset is a starting point. We can adjust after seeing the result, possibly using `10vh` for mobile and `14vh` for desktop.
