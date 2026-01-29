

## Plan: Head Bass Reactivity, Waveform Visibility, and Wake-Up Transition

### Overview

Three polish enhancements to make the listening experience more alive and responsive:

1. **Head bass reactivity** - The head outline pulses with music
2. **Waveform visibility boost** - Better visibility in idle state  
3. **Wake-up transition** - Smooth awakening from dormant mode

---

### 1. Head Bass Reactivity

**File:** `src/components/TheListener.tsx`

Currently, only the ears respond to bass. The head outline (ellipse at lines 192-214) has a static opacity of 0.6. We'll add subtle bass-driven pulsing.

**Changes:**

Add bass-reactive properties to the head ellipse:

```typescript
// Head outline - add bass reactivity
<motion.ellipse
  cx="300"
  cy="450"
  rx="120"
  ry="140"
  stroke={state === 'rebirth' ? "hsl(168 100% 90%)" : "hsl(168 95% 82%)"}
  strokeWidth={state === 'rebirth' ? "6" : `${5 + bassAmplitude * 3}`}  // Stroke pulses 5-8
  fill="none"
  style={{
    filter: state === 'rebirth' ? 'none' : `drop-shadow(0 0 ${4 + bassGlow * 10}px hsl(168 95% 82% / ${0.2 + bassGlow * 0.5}))`,
  }}
  animate={
    state === 'rebirth'
      ? { opacity: [0, 0.8, 0.75, 0, 0.3], scale: 1 }
      : {
          opacity: 0.6 + bassAmplitude * 0.3,  // Opacity pulses 0.6-0.9
          scale: 1 + bassAmplitude * 0.08,      // Subtle 8% scale pulse
        }
  }
  transition={
    state === 'rebirth'
      ? { duration: 4, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.8, 1] }
      : { duration: 0.15, ease: 'easeOut' }  // Quick response
  }
/>
```

Also add subtle bass reactivity to the inner glow ellipse for extra depth.

---

### 2. Waveform Idle Visibility

**File:** `src/components/WaveformScrubber.tsx`

Currently at line 206, idle opacity is 0.25:
```typescript
const baseOpacity = isFlashing ? 0.95 : (isActive || isDragging ? 0.7 : 0.25);
```

**Change:**

Increase idle opacity from 0.25 to 0.4:
```typescript
const baseOpacity = isFlashing ? 0.95 : (isActive || isDragging ? 0.7 : 0.4);
```

This makes the waveform visible enough to remain a presence without being distracting.

---

### 3. Wake-Up Transition

**File:** `src/components/TheListener.tsx`

Currently, transitioning out of dormant state snaps immediately to idle. We need to track when we're "waking up" and play a transition animation.

**Changes:**

Add state tracking for wake-up:
```typescript
const [isWakingUp, setIsWakingUp] = useState(false);
const prevStateRef = useRef(state);

useEffect(() => {
  // Detect transition from dormant to any active state
  if (prevStateRef.current === 'dormant' && state !== 'dormant') {
    setIsWakingUp(true);
    const timer = setTimeout(() => setIsWakingUp(false), 800);
    return () => clearTimeout(timer);
  }
  prevStateRef.current = state;
}, [state]);
```

Add wake-up animation branch in the main motion.div:
```typescript
animate={
  isWakingUp
    ? {
        opacity: [0.15, 0.7, 0.5],
        scale: [0.95, 1.08, 1],
        filter: ['blur(20px)', 'blur(10px)', 'blur(14px)'],
      }
    : state === 'dormant'
    ? { /* existing dormant animation */ }
    // ... rest of states
}
transition={
  isWakingUp
    ? { duration: 0.8, ease: 'easeOut', times: [0, 0.4, 1] }
    : // ... rest of transitions
}
```

---

### Summary

| File | Change |
|------|--------|
| `TheListener.tsx` | Add bass-reactive strokeWidth, opacity, scale, and glow to head ellipse |
| `TheListener.tsx` | Add wake-up state tracking and 0.8s awakening animation |
| `WaveformScrubber.tsx` | Increase idle opacity from 0.25 to 0.4 |

### Expected Result

- Head outline subtly pulses with bass (8% scale, 30% opacity boost, stroke thickening)
- Waveform is clearly visible even when idle (40% opacity vs 25%)
- Exiting dormant state triggers a smooth "awakening" with scale-up and de-blur

