import React from 'react';
import { useAudioEffect } from '../hooks/useAudioEffect';
import { useMusic } from '../hooks/useMusic';

interface CrosswordAudioProps {
    selectedLength: number,
    numWords: number
}

export const CrosswordAudio: React.FC<CrosswordAudioProps> = ({ selectedLength, numWords }) => {
    useMusic()
    useAudioEffect(selectedLength, numWords)
    return null;
}
