import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  DepthOfField,
  Noise,
  SMAA,
  ToneMapping,
  BrightnessContrast,
  N8AO,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useGraphicsSettings } from "@/lib/stores/useGraphicsSettings";

function LowQualityEffects() {
  return null;
}

function MediumQualityEffects() {
  const { bloomEnabled, bloomIntensity, ssaoEnabled, ssaoIntensity, vignetteEnabled, vignetteIntensity } = useGraphicsSettings();

  return (
    <EffectComposer multisampling={4}>
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <BrightnessContrast brightness={0.02} contrast={0.05} />
      <Bloom
        intensity={bloomEnabled ? bloomIntensity : 0}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.9}
        mipmapBlur={true}
        radius={0.8}
      />
      <N8AO
        aoRadius={0.5}
        intensity={ssaoEnabled ? ssaoIntensity * 2 : 0}
        distanceFalloff={0.5}
      />
      <Vignette
        offset={0.3}
        darkness={vignetteEnabled ? vignetteIntensity : 0}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}

function HighQualityEffects() {
  const {
    bloomEnabled,
    bloomIntensity,
    ssaoEnabled,
    ssaoIntensity,
    dofEnabled,
    vignetteEnabled,
    vignetteIntensity,
    chromaticAberrationEnabled,
    filmGrainEnabled,
    quality,
  } = useGraphicsSettings();

  const multisampling = quality === "ultra" ? 8 : 4;

  return (
    <EffectComposer multisampling={multisampling}>
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <BrightnessContrast brightness={0.02} contrast={0.05} />
      <Bloom
        intensity={bloomEnabled ? bloomIntensity : 0}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.9}
        mipmapBlur={true}
        radius={0.8}
      />
      <N8AO
        aoRadius={0.8}
        intensity={ssaoEnabled ? ssaoIntensity * 3 : 0}
        distanceFalloff={0.5}
      />
      <DepthOfField
        focusDistance={dofEnabled ? 0.02 : 0}
        focalLength={dofEnabled ? 0.05 : 0}
        bokehScale={dofEnabled ? 3 : 0}
        height={480}
      />
      <Vignette
        offset={0.3}
        darkness={vignetteEnabled ? vignetteIntensity : 0}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        offset={chromaticAberrationEnabled ? new THREE.Vector2(0.002, 0.002) : new THREE.Vector2(0, 0)}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise opacity={filmGrainEnabled ? 0.05 : 0} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}

export function PostProcessing() {
  const quality = useGraphicsSettings((state) => state.quality);

  if (quality === "low") {
    return <LowQualityEffects />;
  }

  if (quality === "medium") {
    return <MediumQualityEffects />;
  }

  return <HighQualityEffects />;
}
