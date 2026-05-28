export const CORRUPTION_RAMP_DURATION_MS = 180_000

export interface CorruptionGlitchParams {
  /** 0–1 linear elapsed / 180s */
  progress: number
  /** Eased 0–1 — accelerates nausea toward the end */
  nausea: number
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
  scanlineOpacity: number
  noiseOpacity: number
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export function computeCorruptionGlitchParams(
  elapsedMs: number,
): CorruptionGlitchParams {
  const progress = Math.min(1, Math.max(0, elapsedMs / CORRUPTION_RAMP_DURATION_MS))
  /** Quadratic ease — stays bearable early, gets vicious late */
  const nausea = progress * progress

  return {
    progress,
    nausea,
    elapsedMs: Math.min(elapsedMs, CORRUPTION_RAMP_DURATION_MS),
    shakePx: lerp(5, 28, nausea),
    shakePeriodMs: lerp(2000, 180, nausea),
    rgbSplitPx: lerp(4, 18, nausea),
    rgbCycleMs: lerp(4500, 450, nausea),
    rgbStrength: lerp(0.35, 0.95, nausea),
    vignetteOpacityMin: lerp(0.2, 0.75, nausea),
    vignetteOpacityMax: lerp(0.4, 1, nausea),
    vignettePulseMs: lerp(2400, 400, nausea),
    vignetteEdgeAlpha: lerp(0.28, 1, nausea),
    scanlineOpacity: lerp(0.45, 0.95, nausea),
    noiseOpacity: lerp(0.05, 0.18, nausea),
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
    '--corruption-scanline-opacity': String(params.scanlineOpacity),
    '--corruption-noise-opacity': String(params.noiseOpacity),
    '--corruption-nausea': String(params.nausea),
  }
}
