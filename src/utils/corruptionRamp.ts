export const CORRUPTION_RAMP_DURATION_MS = 180_000

export interface CorruptionGlitchParams {
  /** 0–1, linear elapsed / 180s */
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
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress
}

export function computeCorruptionGlitchParams(
  elapsedMs: number,
): CorruptionGlitchParams {
  const progress = Math.min(1, Math.max(0, elapsedMs / CORRUPTION_RAMP_DURATION_MS))

  return {
    progress,
    elapsedMs: Math.min(elapsedMs, CORRUPTION_RAMP_DURATION_MS),
    shakePx: lerp(5, 25, progress),
    shakePeriodMs: lerp(2000, 200, progress),
    rgbSplitPx: lerp(4, 15, progress),
    rgbCycleMs: lerp(4000, 500, progress),
    rgbStrength: lerp(0.38, 0.88, progress),
    vignetteOpacityMin: lerp(0.22, 0.7, progress),
    vignetteOpacityMax: lerp(0.42, 1, progress),
    vignettePulseMs: lerp(2200, 550, progress),
    vignetteEdgeAlpha: lerp(0.32, 0.98, progress),
  }
}

export function corruptionGlitchStyleProperties(
  params: CorruptionGlitchParams,
): Record<string, string> {
  return {
    '--corruption-shake-px': `${params.shakePx}px`,
    '--corruption-shake-period': `${params.shakePeriodMs}ms`,
    '--corruption-rgb-px': `${params.rgbSplitPx}px`,
    '--corruption-rgb-period': `${params.rgbCycleMs}ms`,
    '--corruption-rgb-strength': String(params.rgbStrength),
    '--corruption-vignette-min': String(params.vignetteOpacityMin),
    '--corruption-vignette-max': String(params.vignetteOpacityMax),
    '--corruption-vignette-pulse': `${params.vignettePulseMs}ms`,
    '--corruption-vignette-edge': String(params.vignetteEdgeAlpha),
  }
}
