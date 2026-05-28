import { useCorruption } from '../context/CorruptionContext'
import { useCorruptionGlitchParams } from '../hooks/useCorruptionGlitchParams'

/** SVG feTurbulence filter — turbulence ramps from t=20s to t=100s */
export function CorruptionTextMeltFilter() {
  const { isCorrupted } = useCorruption()
  const params = useCorruptionGlitchParams()

  if (!isCorrupted || params.textMeltProgress <= 0) return null

  return (
    <svg className="corruption-svg-filters" aria-hidden focusable="false">
      <defs>
        <filter
          id="corruption-text-melt"
          x="-30%"
          y="-40%"
          width="160%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${params.textTurbulenceFreqX} ${params.textTurbulenceFreqY}`}
            numOctaves={params.textTurbulenceOctaves}
            seed={params.textTurbulenceSeed}
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale={params.textDisplacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
