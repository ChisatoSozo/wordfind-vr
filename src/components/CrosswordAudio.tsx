import React from 'react';
import { useAudioEffect } from '../hooks/useAudioEffect';

interface CrosswordAudioProps {
    selectedLength: number,
    numWords: number
}

export const CrosswordAudio: React.FC<CrosswordAudioProps> = ({ selectedLength, numWords }) => {
    useAudioEffect(selectedLength, numWords)
    return null;
}
