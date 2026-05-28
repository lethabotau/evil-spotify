export const CORRUPTION_RAMP_DURATION_MS = 180_000
export const TEXT_MELT_START_MS = 20_000
export const TEXT_MELT_END_MS = 100_000

export interface CorruptionGlitchParams {
  /** 0–1 linear elapsed / 180s */
  progress: number
  elapsedMs: number
  shakePx: number
  shakePeriodMs: number
  rgbSplitPx: number
  rgbCycleMs: number
  rgbStrength: number
  vignetteOpacityMin: number
  vignetteOpacityMax: number
  vignettePulseMs: number
  vignetteEdgeAlpha: number
  warpSkewDeg: number
  warpScaleAmt: number
  scanlineOpacity: number
  noiseOpacity: number
  /** 0–1 ramp for text melt (20s → 100s) */
  textMeltProgress: number
  textTurbulenceFreqX: number
  textTurbulenceFreqY: number
  textTurbulenceOctaves: number
  textDisplacementScale: number
  textTurbulenceSeed: number
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

function textMeltProgress(elapsedMs: number): number {
  if (elapsedMs < TEXT_MELT_START_MS) return 0
  if (elapsedMs >= TEXT_MELT_END_MS) return 1
  return (elapsedMs - TEXT_MELT_START_MS) / (TEXT_MELT_END_MS - TEXT_MELT_START_MS)
}

export function computeCorruptionGlitchParams(
  elapsedMs: number,
): CorruptionGlitchParams {
  const progress = Math.min(1, Math.max(0, elapsedMs / CORRUPTION_RAMP_DURATION_MS))
  const melt = textMeltProgress(elapsedMs)

  return {
    progress,
    elapsedMs: Math.min(elapsedMs, CORRUPTION_RAMP_DURATION_MS),
    textMeltProgress: melt,
    textTurbulenceFreqX: lerp(0.003, 0.055, melt),
    textTurbulenceFreqY: lerp(0.004, 0.16, melt),
    textTurbulenceOctaves: Math.round(lerp(1, 4, melt)),
    textDisplacementScale: lerp(0, 52, melt),
    textTurbulenceSeed: Math.floor(elapsedMs / 700) % 997,
    shakePx: lerp(0, 40, progress),
    shakePeriodMs: lerp(2400, 100, progress),
    rgbSplitPx: lerp(0, 20, progress),
    rgbCycleMs: lerp(5000, 300, progress),
    rgbStrength: lerp(0.15, 1, progress),
    vignetteOpacityMin: lerp(0.12, 0.92, progress),
    vignetteOpacityMax: lerp(0.28, 1, progress),
    vignettePulseMs: lerp(2800, 220, progress),
    vignetteEdgeAlpha: lerp(0.2, 1, progress),
    warpSkewDeg: lerp(0, 7, progress),
    warpScaleAmt: lerp(0, 0.09, progress),
    scanlineOpacity: lerp(0.35, 1, progress),
    noiseOpacity: lerp(0.04, 0.35, progress),
  }
}

export function corruptionGlitchStyleProperties(
  params: CorruptionGlitchParams,
): Record<string, string> {
  return {
    '--corruption-progress': String(params.progress),
    '--corruption-shake-px': `${params.shakePx}px`,
    '--corruption-shake-period': `${params.shakePeriodMs}ms`,
    '--corruption-rgb-px': `${params.rgbSplitPx}px`,
    '--corruption-rgb-period': `${params.rgbCycleMs}ms`,
    '--corruption-rgb-strength': String(params.rgbStrength),
    '--corruption-vignette-min': String(params.vignetteOpacityMin),
    '--corruption-vignette-max': String(params.vignetteOpacityMax),
    '--corruption-vignette-pulse': `${params.vignettePulseMs}ms`,
    '--corruption-vignette-edge': String(params.vignetteEdgeAlpha),
    '--corruption-warp-skew': `${params.warpSkewDeg}deg`,
    '--corruption-warp-scale': String(params.warpScaleAmt),
    '--corruption-scanline-opacity': String(params.scanlineOpacity),
    '--corruption-noise-opacity': String(params.noiseOpacity),
    '--corruption-text-melt': String(params.textMeltProgress),
  }
}
