

## Plan: Dramatic Ear Animations + Debug Cleanup

### Problem Analysis

The console logs reveal the issue:
- `bassAmplitude` values are only `0.04-0.08` (4-8% of max)
- This produces `bassScale` of `1.02-1.03` (ears only grow 2-3%)
- `bassTilt` is only `1-2 degrees` - imperceptible

The ears should visibly "breathe" with the music, scaling 10-40% and tilting 5-15 degrees on bass hits.

### Changes

#### 1. `src/components/TheListener.tsx`

**Remove debug logging:**
```typescript
// DELETE line 50:
console.log('TheListener bass:', bassAmplitude.toFixed(2), 'scale:', bassScale.toFixed(2), 'tilt:', bassTilt.toFixed(1));
```

**Dramatically increase animation multipliers:**
```typescript
// Current (barely visible):
const bassScale = 1 + bassAmplitude * 0.4;  // Max 1.04
const bassTilt = bassAmplitude * 25;         // Max 2.5°
const bassGlow = bassAmplitude * 0.8;        // Max 0.08

// New (dramatically visible):
const bassScale = 1 + bassAmplitude * 3;     // Max 1.30 (30% growth)
const bassTilt = bassAmplitude * 150;        // Max 15° outward tilt
const bassGlow = bassAmplitude * 4;          // Max 0.4 glow boost
```

**Add strokeWidth pulsing for extra punch:**
```typescript
strokeWidth={state === 'rebirth' ? "8" : `${6 + bassAmplitude * 8}`}
```

#### 2. `src/pages/Index.tsx`

**Remove debug logging:**
```typescript
// DELETE line 159:
console.log('Analyser:', analyserData?.[0], analyserData?.[10], analyserData?.[30], 'hasData:', hasData);
```

### Summary

| File | Change |
|------|--------|
| `TheListener.tsx` | Remove console.log, increase bassScale to 3x, bassTilt to 150x, bassGlow to 4x, add strokeWidth pulsing |
| `Index.tsx` | Remove console.log |

### Expected Result
- Ears will visibly pulse with bass (scale 1.0 to 1.30)
- Ears will tilt outward on bass hits (0° to 15°)
- Ear glow will intensify with bass
- Stroke width will thicken on bass hits
- Console will be clean (no spam)

