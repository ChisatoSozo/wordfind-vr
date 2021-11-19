import { Color4, Vector3 } from '@babylonjs/core';
import { useCallback, useState } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Pipeline } from './components/Pipeline';
import { useWindowSize } from './hooks/useWindowSize';
import "./materials";
import { SceneIntro } from './scenes/SceneIntro';
import { SceneMenu } from './scenes/SceneMenu';
import { VenueParticles } from './scenes/VenueParticles';
import { WordList, WordListName } from './words';
import { cookingWords } from './words/cooking';

export const DEBUG = false;


const scenesMap = {
  intro: SceneIntro,
  menu: SceneMenu,
  particles: VenueParticles
} as const

export type SceneName = keyof typeof scenesMap;

interface VenueDefinition {
  words: WordList;
  crosswordDimensions: { x: number, y: number };
  iconRoot: WordListName;
}

interface SceneProps {
  transitionScene: (oldScene: SceneName, newScene: SceneName, transitionTime: number, venueDefinition?: VenueDefinition) => void;
}

type VenueProps = SceneProps & VenueDefinition

export interface LevelDefinition extends VenueDefinition {
  scene: SceneName;
  levelName: string;
}



export type SceneComponent = React.FC<SceneProps>;
export type VenueComponent = React.FC<VenueProps>;

export const App = () => {
  const windowSize = useWindowSize();

  const [scenes, setScenes] = useState<SceneName[]>(["intro"])
  const [venueDefinition, setVenueDefinition] = useState<VenueDefinition>();

  const newScene = useCallback((oldScene: SceneName, newScene: SceneName, transitionTime: number, venueDefinition?: VenueDefinition) => {
    if (venueDefinition) setVenueDefinition(venueDefinition);
    setScenes(scenes => [...scenes, newScene])
    window.setTimeout(() => {
      setScenes(scenes => scenes.filter(scene => scene !== oldScene))
    }, transitionTime);
  }, []);


  return <div>
    <Engine width={windowSize.width} height={windowSize.height} canvasId='babylonJS' >
      <Scene clearColor={new Color4(0, 0, 0, 1)}>
        <Pipeline />
        {DEBUG ? <arcRotateCamera name="camera1" target={Vector3.Zero()} alpha={-Math.PI / 2} beta={Math.PI / 2} radius={8} /> : <freeCamera name="camera1" position={new Vector3(0, 0, 0)} />}
        <hemisphericLight name='light1' intensity={0.7} direction={Vector3.Up()} />
        {scenes.map(scene => {
          const CurSceneComponent = scenesMap[scene] as VenueComponent;
          let crosswordDimensions = { x: 8, y: 8 };
          let iconRoot = "food" as WordListName;
          let words = [...cookingWords] as WordList;
          if (venueDefinition) {
            crosswordDimensions = venueDefinition.crosswordDimensions;
            iconRoot = venueDefinition.iconRoot;
            words = venueDefinition.words;
          }
          return <CurSceneComponent key={scene} transitionScene={newScene} words={words} crosswordDimensions={crosswordDimensions} iconRoot={iconRoot} />
        })}
      </Scene>
    </Engine>
  </div>
}