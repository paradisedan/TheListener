
## Plan: Remove Waveform Visualization

### What We're Removing

The waveform visualization consists of two components:
- **WaveformScrubber** - The 40-bar visual equalizer in the center of the screen with scrubbing/click-to-play functionality
- **WaveformControls** - The play/pause, skip, and mute buttons that appear on hover

### What We're Keeping

- **Audio frequency analysis** - The `updateAmplitudes` loop in Index.tsx that computes `bassAmplitude` stays, as it powers TheListener's ear/head reactivity
- **TheListener reactivity** - All the bass-driven ear tilting, scaling, and glow effects remain fully functional
- **Keyboard controls** - Space to play/pause, arrow keys to seek, M to mute all continue to work

### Changes

#### 1. `src/pages/Index.tsx`

**Remove imports:**
```typescript
// DELETE these lines:
import { WaveformScrubber } from '@/components/WaveformScrubber';
import { WaveformControls } from '@/components/WaveformControls';
```

**Remove state variables (no longer needed):**
```typescript
// DELETE:
const [controlsVisible, setControlsVisible] = useState(false);
const [versionFlash, setVersionFlash] = useState(0);
```

**Simplify idle timer effect:**
Remove the `controlsTimer` logic since controls are gone.

**Remove versionFlash from handleVersionChange:**
```typescript
// DELETE:
setVersionFlash(prev => prev + 1);
```

**Remove JSX for waveform components:**
```jsx
{/* DELETE: Interactive waveform visualization with scrubbing */}
<WaveformScrubber ... />

{/* DELETE: Waveform controls (play/pause, mute, volume) */}
{audioController && (
  <WaveformControls ... />
)}
```

**Keep the audio analysis loop** - The `updateAmplitudes` useEffect stays because `bassAmplitude` drives TheListener.

#### 2. Delete files (optional cleanup)

These files can be deleted since they're no longer used:
- `src/components/WaveformScrubber.tsx`
- `src/components/WaveformControls.tsx`
- `src/components/VolumeSlider.tsx` (only used by WaveformControls)

### Summary

| Change | Files |
|--------|-------|
| Remove waveform imports and JSX | `Index.tsx` |
| Remove unused state (`controlsVisible`, `versionFlash`) | `Index.tsx` |
| Simplify idle timer (remove controls timer) | `Index.tsx` |
| Delete unused components | `WaveformScrubber.tsx`, `WaveformControls.tsx`, `VolumeSlider.tsx` |

### What Still Works After Removal

- Audio plays automatically after overlay click
- Keyboard controls (Space, arrows, M)
- TheListener responds to bass with ear tilts, head pulsing, glow
- All state transitions (idle, focused, typing, dormant, rebirth)
- Whispers, PlayerBar, PromptSection, etc.

### Interaction Change

Without the waveform, users lose the visual scrubber and on-screen play/pause buttons. They can still control playback via:
- **Keyboard**: Space (play/pause), Left/Right arrows (seek), M (mute)
- **PlayerBar**: Already has version switching; could add transport controls if needed later
