import { useRef, useState } from 'react'
import './App.css'

import AudioPlayer from './AudioPlayer';
import toWav from 'audiobuffer-to-wav';
import axios from 'axios';

type TranscribeResp = {
  message: string
};

function App() {

  const [audioSegments, setAudioSegments] = useState<AudioBuffer[]>([]);

  const handleTranscribe = async () => {
    for(const buffer of audioSegments) {
      const wav = toWav(buffer);

      const blob = new Blob([wav], {type: "audio/wav"});

      const formData = new FormData();
      formData.append('file', blob);

      const { data } = await axios.post<TranscribeResp>(
        'http://localhost:8000/transcribe/',
        formData,
        {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk3MzA0NTcyLCJpYXQiOjE2OTcyMzQ4MTMsImp0aSI6IjNjOTNiMTQ2NDJhODRmNjM4MmQyNmZmZThhYmYyNmFkIiwidXNlcl9pZCI6OX0.MKt4Rc6LOyoRy8-CSdvfbfn_jB_T0VQtu0CQsZpRUqo'
          }
        }
      );

      console.log(data.message);
    }
  }

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
      const silenceThreshold = 0.1; // Ajuste conforme necessário
  
      // Define o período de tempo para considerar como uma pausa
      const silenceDurationThreshold = 0.35; // Em segundos, ajuste conforme necessário
  
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
      <button onClick={handleTranscribe}>Transcrever</button>
    </>
  )
}

export default App
