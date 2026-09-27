"use client";

import { useEffect, useRef, useState } from "react";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}music.mp3`);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => setVisible(true), { once: true });

    // Attempt autoplay — most browsers will block this until interaction.
    // If it works, great. If not, the button is still there for the user.
    audio.play().then(() => setPlaying(true)).catch(() => {});

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Pause music" : "Play music"}
      className="music-player-btn"
      data-playing={playing ? "true" : undefined}
    >
      <Bars playing={playing} />
      <span>{playing ? "music on" : "music off"}</span>
    </button>
  );
}

function Bars({ playing }: { playing: boolean }) {
  return (
    <span className="music-bars" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="music-bar"
          style={{ animationDelay: `${i * 0.18}s` }}
          data-playing={playing ? "true" : undefined}
        />
      ))}
    </span>
  );
}
