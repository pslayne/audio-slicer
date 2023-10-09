import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
    audioSegments: AudioBuffer[];
}

function AudioPlayer({ audioSegments }: AudioPlayerProps) {
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const audioContext = new AudioContext();

    const [isPlaying, setIsPlaying] = useState(false);

    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const playNextSegment = () => {
        if (currentSegmentIndex < audioSegments.length - 1) {
            setCurrentSegmentIndex(currentSegmentIndex + 1);
        }
    };

    const playPreviousSegment = () => {
        if (currentSegmentIndex > 0) {

            setCurrentSegmentIndex(currentSegmentIndex - 1);

        }
    };


    const togglePlayPause = () => {
        const audioElement = audioElementRef.current;
        if (!audioElement) return;

        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play();
        }

        setIsPlaying(!isPlaying);
    };
    const playCurrentSegment = () => {
        const source = audioContext.createBufferSource();
        source.buffer = audioSegments[currentSegmentIndex];
        source.connect(audioContext.destination);
        source.onended = () => {
            // Atualize o tempo atual e a duração quando o áudio terminar
            setCurrentTime(0);
            setAudioDuration(0);
            setIsPlaying(false);
        };
        source.start();
        setIsPlaying(true);
        // Atualize a duração
        setAudioDuration(audioSegments[currentSegmentIndex].duration);
    };
 
    useEffect(() => {
        // Obter uma referência ao elemento <audio> para acessar suas propriedades
        const audioElement = audioElementRef.current;
        if (audioElement) {
            // Configurar um ouvinte para a atualização do tempo atual
            audioElement.addEventListener('timeupdate', () => {
                setCurrentTime(audioElement.currentTime);
            });
        }
    }, []);

    return (
        <div>
            Seguimento atual: {currentSegmentIndex}
            <div>
                Tempo Atual: {currentTime.toFixed(2)} segundos
            </div>
            <div>
                Duração Total: {audioDuration.toFixed(2)} segundos
            </div>
            <audio controls ref={audioElementRef} style={{ display: 'none' }}  >
                <source src="" type="audio/wav" />
                Seu navegador não suporta a reprodução de áudio.
            </audio>
            <button onClick={playPreviousSegment} disabled={currentSegmentIndex === 0}>Anterior</button>
            <button onClick={playCurrentSegment}>Reproduzir</button>
            <button onClick={playNextSegment} disabled={currentSegmentIndex === audioSegments.length - 1}>Próximo</button>
            {audioSegments.length}
        </div>
    );
}

export default AudioPlayer;
