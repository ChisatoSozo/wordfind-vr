import { Color4, Vector3 } from '@babylonjs/core';
import { useCallback, useEffect, useState } from 'react';
import { Engine, Scene } from 'react-babylonjs';
import { Pipeline } from './components/Pipeline';
import { useWindowSize } from './hooks/useWindowSize';
import "./materials";
import { SceneIntro } from './scenes/SceneIntro';
import { SceneMenu } from './scenes/SceneMenu';
import { VenueParticles } from './scenes/VenueParticles';
import { dogWords } from './words/dogs';

export const DEBUG = false;


const scenesMap = {
  intro: SceneIntro,
  menu: SceneMenu,
  particles: VenueParticles
} as const

type SceneName = keyof typeof scenesMap;

interface SceneProps {
  transitionScene: (oldScene: SceneName, newScene: SceneName, transitionTime: number) => void;
}

interface VenueProps extends SceneProps {
  words: string[];
  crosswordDimensions: { x: number, y: number };
  iconRoot: string;
}

export type SceneComponent = React.FC<SceneProps>;
export type VenueComponent = React.FC<VenueProps>;

export const App = () => {
  const windowSize = useWindowSize();

  const [scenes, setScenes] = useState<SceneName[]>(["intro"])

  useEffect(() => {
    console.log(scenes)
  }, [scenes])

  const newScene = useCallback((oldScene: SceneName, newScene: SceneName, transitionTime: number) => {
    setScenes(scenes => [...scenes, newScene])
    window.setTimeout(() => {
      setScenes(scenes => scenes.filter(scene => scene !== oldScene))
    }, transitionTime);
  }, []);


  return <div>
    <Engine width={windowSize.width} height={windowSize.height} canvasId='babylonJS' >
      <Scene clearColor={new Color4(0, 0, 0, 1)}>
        <Pipeline />
        {DEBUG ? <arcRotateCamera name="camera1" target={Vector3.Zero()} alpha={Math.PI / 2} beta={Math.PI / 4} radius={8} /> : <targetCamera name="camera1" position={new Vector3(0, 0, 0)} />}
        <hemisphericLight name='light1' intensity={0.7} direction={Vector3.Up()} />
        {scenes.map(scene => {
          const CurSceneComponent = scenesMap[scene] as VenueComponent;
          return <CurSceneComponent key={scene} transitionScene={newScene} words={dogWords} crosswordDimensions={{ x: 8, y: 8 }} iconRoot='dogs' />
        })}
      </Scene>
    </Engine>
  </div>
}