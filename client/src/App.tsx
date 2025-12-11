import { useEffect } from "react";
import { Game } from "./game/Game";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

function App() {
  const setBackgroundMusic = useAudio(state => state.setBackgroundMusic);
  const setHitSound = useAudio(state => state.setHitSound);
  const setSuccessSound = useAudio(state => state.setSuccessSound);

  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.5;
    setHitSound(hitSound);

    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.6;
    setSuccessSound(successSound);

    return () => {
      bgMusic.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Game />
    </div>
  );
}

export default App;
