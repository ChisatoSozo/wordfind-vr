import { Texture } from "@babylonjs/core";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { createContext, useEffect, useState } from "react";
import { useScene } from "react-babylonjs";

interface ICache {
    letters: { [key: string]: Texture };
}

export const CacheContext = createContext<ICache | undefined>(undefined);

export const Cache: React.FC = ({ children }) => {
    const scene = useScene();
    const [cache, setCache] = useState<ICache>();
    useEffect(() => {
        if (!scene) return;
        const letters: { [key: string]: Texture } = {};
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i);
            const texture = new AdvancedDynamicTexture("letter", 256, 256, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
            const textBlock = new TextBlock();
            textBlock.text = letter;
            textBlock.fontSize = 256;
            textBlock.color = "white";
            textBlock.fontStyle = "bold";
            texture.addControl(textBlock);

            texture.update();
            texture.hasAlpha = true;
            letters[letter] = texture;
        }
        setCache({ letters } as ICache);
    }, [scene])

    return <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>;
}