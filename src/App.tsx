import { useRef, useState } from 'react'
import './App.css'

import AudioPlayer from './AudioPlayer';

function App() {

  const [audioSegments, setAudioSegments] = useState<AudioBuffer[]>([]);


  // const handleAudioInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];

  //   if (file) {
  //     const audioContext = new AudioContext();

  //     // Lê o arquivo de entrada como um ArrayBuffer
  //     const arrayBuffer = await readFileAsArrayBuffer(file);

  //     // Decodifica o ArrayBuffer para um AudioBuffer
  //     const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  //     // Divide o áudio em segmentos
  //     const segmentDurationInSeconds = 5; // Defina a duração desejada para cada segmento
  //     const sampleRate = audioBuffer.sampleRate;
  //     const segmentLength = Math.floor(segmentDurationInSeconds * sampleRate);
  //     const numSegments = Math.ceil(audioBuffer.length / segmentLength);
  //     const segments: AudioBuffer[] = [];

  //     for (let i = 0; i < numSegments; i++) {
  //       const start = i * segmentLength;
  //       const end = Math.min((i + 1) * segmentLength, audioBuffer.length);
  //       const segmentData = audioBuffer.getChannelData(0).slice(start, end);
  //       const segment = audioContext.createBuffer(1, segmentData.length, sampleRate);
  //       segment.getChannelData(0).set(segmentData);
  //       segments.push(segment);
  //     }

  //     setAudioSegments(segments);
  //   }
  // };
  // const handleAudioInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  
  //   if (file) {
  //     const audioContext = new AudioContext();
  
  //     // Lê o arquivo de entrada como um ArrayBuffer
  //     const arrayBuffer = await readFileAsArrayBuffer(file);
  
  //     // Decodifica o ArrayBuffer para um AudioBuffer
  //     const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  //     // Divide o áudio em segmentos com base em pausas
  //     const sampleRate = audioBuffer.sampleRate;
  //     const audioData = audioBuffer.getChannelData(0);
  //     const segments: AudioBuffer[] = [];
  //     let segmentStart = 0;
  
  //     // Define um limiar de volume para considerar como "silêncio"
  //     const silenceThreshold = 0.4; // Ajuste conforme necessário
  
  //     for (let i = 0; i < audioData.length; i++) {
  //       if (Math.abs(audioData[i]) < silenceThreshold) {
  //         // Se o volume for menor que o limiar, considere isso como uma pausa
  //         const segmentLength = i - segmentStart;
  //         if (segmentLength > 0) {
  //           // Crie um segmento se a pausa for maior que zero
  //           const segment = audioContext.createBuffer(1, segmentLength, sampleRate);
  //           const segmentData = audioData.slice(segmentStart, i);
  //           segment.getChannelData(0).set(segmentData);
  //           segments.push(segment);
  //         }
  //         segmentStart = i + 1; // Comece o próximo segmento após a pausa
  //       }
  //     }
  
  //     if (segments.length === 0) {
  //       // Se não houver pausas detectadas, divida o áudio em um único segmento
  //       segments.push(audioBuffer);
  //     }
  
  //     // Configure os segmentos no estado ou faça algo com eles
  //     console.log('Número de segmentos:', segments.length);
  //     setAudioSegments(segments);
  //   }
  // };

  const handleAudioInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  
    if (file) {
      const audioContext = new AudioContext();
  
      // Lê o arquivo de entrada como um ArrayBuffer
      const arrayBuffer = await readFileAsArrayBuffer(file);
  
      // Decodifica o ArrayBuffer para um AudioBuffer
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
      // Divide o áudio em segmentos com base em pausas
      const sampleRate = audioBuffer.sampleRate;
      const audioData = audioBuffer.getChannelData(0);
      const segments: AudioBuffer[] = [];
      let segmentStart = 0;
      let silenceStartTime = 0;
  
      
      // Define um limiar de volume para considerar como "silêncio"
      const silenceThreshold = 0.13; // Ajuste conforme necessário
  
      // Define o período de tempo para considerar como uma pausa
      const silenceDurationThreshold = 0.16; // Em segundos, ajuste conforme necessário
  
      for (let i = 0; i < audioData.length; i++) {
        if (Math.abs(audioData[i]) < silenceThreshold) {
          if (silenceStartTime === 0) {
            // Início da pausa
            silenceStartTime = audioContext.currentTime + i / sampleRate;
          }
        } else {
          if (silenceStartTime > 0) {
            // Fim da pausa
            const silenceDuration = audioContext.currentTime + i / sampleRate - silenceStartTime;
            if (silenceDuration >= silenceDurationThreshold) {
              // Crie um segmento se a pausa for maior ou igual ao limiar de tempo
              const segmentLength = i - segmentStart;
              if (segmentLength > 0) {
                const segment = audioContext.createBuffer(1, segmentLength, sampleRate);
                const segmentData = audioData.slice(segmentStart, i);
                segment.getChannelData(0).set(segmentData);
                segments.push(segment);
              }
              segmentStart = i + 1; // Comece o próximo segmento após a pausa
            }
            silenceStartTime = 0;
          }
        }
      }
  
      if (segments.length === 0) {
        // Se não houver pausas detectadas, divida o áudio em um único segmento
        segments.push(audioBuffer);
      }
  
      // Configure os segmentos no estado ou faça algo com eles
      console.log('Número de segmentos:', segments.length);
      setAudioSegments(segments)
    }
  };
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Erro ao ler arquivo como ArrayBuffer'));
        }
      };
      reader.onerror = (e) => {
        reject(new Error('Erro ao ler arquivo'));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  
  //   if (audioInputRef.current) {
  //     const audioStream = audioInputRef.current.files?.[0];
  //     if (audioStream) {
  //       const mediaRecorder = new MediaRecorder(audioStream);
  //       const segments: ArrayBuffer[] = [];

  //       mediaRecorder.ondataavailable = (event) => {
  //         if (event.data.size > 0) {
  //           segments.push(event.data);
  //         }
  //       };

  //       mediaRecorder.onstop = () => {
  //         setAudioSegments(segments);
  //       };

  //       mediaRecorder.start();
  //       setTimeout(() => {
  //         mediaRecorder.stop();
  //       }, 5000); // Gravação por 5 segundos (ajuste conforme necessário)
  //     }
  //   }
  // };
  return (
    <>
      <div>
        <input type="file" accept="audio/*" onChange={handleAudioInputChange} />
        {/* <ul>
          {audioSegments.map((segment, index) => (
            <li key={index}>
              Segmento de Áudio {index + 1}: amostras
            </li>
          ))}
        </ul> */}
      </div>
      <AudioPlayer audioSegments={audioSegments}/>
    </>
  )
}

export default App
