import { useState, useRef } from 'react';
import VideoProjection from './components/VideoProjection';

const masks = [
  { id: 'mushroom', label: 'Mushroom' },
  { id: 'crown', label: 'Crown' },
  { id: 'spade', label: 'Spade' },
  { id: 'star', label: 'Star' },
];

function App() {
  const [activeMask, setActiveMask] = useState('mushroom');
  const projRef = useRef(null);

  return (
    <div className="h-screen overflow-hidden relative bg-neutral-950 text-neutral-200">
      <VideoProjection
        onReady={(p) => {
          projRef.current = p;
        }}
      />

      <header className="absolute top-0 inset-x-0 z-20">
        <div className="flex items-center justify-between px-6 h-16">
          <span className="text-lg font-semibold tracking-tight text-white drop-shadow-lg">
            wonderland<span className="text-purple-400">.games</span>
          </span>
          <button className="bg-purple-600/80 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg backdrop-blur transition-colors">
            Connect Wallet
          </button>
        </div>
      </header>

      <div className="absolute bottom-8 inset-x-0 z-10 flex flex-col items-center gap-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl">
          Play.{'   '}Compete. {'   '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Earn.
          </span>
        </h1>

        <div className="flex gap-2">
          {masks.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setActiveMask(m.id);
                projRef.current?.switchTo(m.id);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeMask === m.id
                  ? 'bg-white text-neutral-900'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/20 backdrop-blur'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
