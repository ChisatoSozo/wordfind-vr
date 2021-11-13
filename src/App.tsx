import { Color4, Vector3 } from '@babylonjs/core';
import { times } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Capsules } from './components/Capsules';
import { CrosswordAudio } from './components/CrosswordAudio';
import { CrosswordLetter } from './components/CrosswordLetter';
import { CrosswordList } from './components/CrosswordList';
import { CrosswordParticles } from './components/CrosswordParticles';
import { Pipeline } from './components/Pipeline';
import { useWindowSize } from './hooks/useWindowSize';
import { useWordSearch } from './hooks/useWordSearch';
import "./materials";

export const DEBUG = false;

export const App = () => {
  const windowSize = useWindowSize();

  const crosswordWidth = 8;
  const crosswordHeight = 8;
  const crosswordDimensions = useMemo(() => ({ x: crosswordWidth, y: crosswordHeight }), []);
  const ws = useWordSearch(crosswordDimensions, 20);
  const words = useMemo(() => ws.words.map(word => word.word), [ws]);

  const [firstClicked, setFirstClicked] = useState<{ x: number, y: number } | null>(null);
  const [currentHover, setCurrentHover] = useState<{ x: number, y: number } | null>(null);

  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [solvedCoordinatePairs, setSolvedCoordinatePairs] = useState<[{ x: number, y: number }, { x: number, y: number }][]>([]);
  const [highlightedIndicies, setHighlightedIndicies] = useState<{ x: number, y: number }[]>([]);

  useEffect(() => {
    if (!firstClicked && highlightedIndicies.length !== 0) {
      const word = highlightedIndicies.map(index => ws.grid[index.x][index.y]).join('');

      if (words.includes(word.toLowerCase())) {
        setCompletedWords([...completedWords, word]);
        setSolvedCoordinatePairs([...solvedCoordinatePairs, [highlightedIndicies[0], highlightedIndicies[highlightedIndicies.length - 1]]]);
      }
      setHighlightedIndicies([]);
      return;
    }
  }, [completedWords, firstClicked, highlightedIndicies, solvedCoordinatePairs, words, ws.grid])

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
    <Engine width={windowSize.width} height={windowSize.height} canvasId='babylonJS' >
      <Scene clearColor={new Color4(0, 0, 0, 1)}>
        <Pipeline />
        <Capsules solvedCoordinatePairs={solvedCoordinatePairs} crosswordDimensions={crosswordDimensions} />
        <CrosswordAudio selectedLength={highlightedIndicies.length} numWords={completedWords.length} />
        <CrosswordParticles highlightedIndicies={highlightedIndicies} crosswordDimensions={crosswordDimensions} />
        {DEBUG ? <arcRotateCamera name="camera1" target={Vector3.Zero()} alpha={Math.PI / 2} beta={Math.PI / 4} radius={8} /> : <targetCamera name="camera1" position={new Vector3(crosswordWidth * 0.6, 0, -crosswordWidth * 1.5)} />}
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