import { Color4, Vector3 } from '@babylonjs/core';
import { times } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { CrosswordAudio } from './components/CrosswordAudio';
import { CrosswordLetter } from './components/CrosswordLetter';
import { CrosswordList } from './components/CrosswordList';
import { useWindowSize } from './hooks/useWindowSize';
import { useWordSearch } from './hooks/useWordSearch';



export const App = () => {
  const windowSize = useWindowSize();

  const crosswordWidth = 10;
  const crosswordHeight = 10;
  const crosswordDimensions = useMemo(() => ({ x: crosswordWidth, y: crosswordHeight }), []);
  const ws = useWordSearch(crosswordDimensions, 40);
  const words = useMemo(() => ws.words.map(word => word.word), [ws.words]);

  const [firstClicked, setFirstClicked] = useState<{ x: number, y: number } | null>(null);
  const [currentHover, setCurrentHover] = useState<{ x: number, y: number } | null>(null);

  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [highlightedIndicies, setHighlightedIndicies] = useState<{ x: number, y: number }[]>([]);

  useEffect(() => {
    if (!firstClicked && highlightedIndicies.length !== 0) {
      const word = highlightedIndicies.map(index => ws.grid[index.x][index.y]).join('');

      if (words.includes(word.toLowerCase())) {
        setCompletedWords([...completedWords, word]);
      }
      setHighlightedIndicies([]);
      return;
    }
  }, [completedWords, firstClicked, highlightedIndicies, words, ws.grid])

  useEffect(() => {
    if (!firstClicked) return;
    if (!currentHover) return;

    const delta = { x: currentHover.x - firstClicked.x, y: currentHover.y - firstClicked.y };

    if (
      delta.x === 0 ||
      delta.y === 0 ||
      Math.abs(delta.x) === Math.abs(delta.y)
    ) {
      const max = Math.max(Math.abs(delta.x), Math.abs(delta.y));

      if (max === 0) {
        setHighlightedIndicies([{ ...firstClicked }]);
        return;
      }

      const norm = { x: delta.x / max, y: delta.y / max };

      const newHighlightedIndicies = times(max + 1, i => {
        const x = firstClicked.x + i * norm.x;
        const y = firstClicked.y + i * norm.y;
        return { x, y };
      });

      setHighlightedIndicies(newHighlightedIndicies);
      return;
    }
    setHighlightedIndicies([]);

  }, [firstClicked, currentHover])

  return <div>
    <Engine width={windowSize.width} height={windowSize.height} antialias canvasId='babylonJS' >
      <Scene clearColor={new Color4(0, 0, 0, 1)}>
        <CrosswordAudio selectedLength={highlightedIndicies.length} numWords={completedWords.length} />
        <targetCamera name="camera1" position={new Vector3(0, 0, -crosswordWidth * 2)} />
        <hemisphericLight name='light1' intensity={0.7} direction={Vector3.Up()} />
        {times(crosswordWidth, (x) => {
          return times(crosswordHeight, (y) => {
            return <CrosswordLetter
              letter={ws.grid[x][y]}
              key={`${x}-${y}`}
              index={{ x, y }}
              crosswordDimensions={crosswordDimensions}
              highlighted={highlightedIndicies.some(i => i.x === x && i.y === y)}
              setCurrentHover={setCurrentHover}
              setFirstClicked={setFirstClicked}
            />
          })
        })}
        <CrosswordList crosswordDimensions={crosswordDimensions} completedWords={completedWords} words={words} position={new Vector3((crosswordWidth + 2.5) - crosswordWidth / 2, crosswordHeight / 2, 0)} />
      </Scene>
    </Engine>
  </div>
}