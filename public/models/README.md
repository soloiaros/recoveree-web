# Holographic Fatigue Map — model assets

The athlete detail view renders a **Holographic Fatigue Map** using
`src/components/holomap/HolographicModel.jsx`. That component expects a
humanoid `.glb` mesh at:

```
public/models/humanoid.glb
```

You can drop in any standard humanoid:

- [Mixamo](https://www.mixamo.com/) — export as glTF / `.glb`
- [Ready Player Me](https://readyplayer.me/) — direct `.glb` download
- [MakeHuman](http://www.makehumancommunity.org/)
- Any custom mesh you have, as long as it's roughly **1.8 m tall**, **centered
  on X/Z**, with the **feet at y = 0** and the figure **facing +Z**.

If `humanoid.glb` is missing or fails to load, the panel automatically falls
back to a procedural primitives-based humanoid
(`src/components/holomap/ProceduralHumanoid.jsx`) so the dashboard is never
blank during development.

## Fatigue zone coordinates

The danger-zone markers (calves, lower back, etc.) are positioned by the
coordinate map in `src/components/holomap/fatigueZones.js`. If your mesh uses
a different scale or pose, tweak that file — nothing else needs to change.
