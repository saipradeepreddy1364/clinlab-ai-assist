import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect, useState } from 'react';

export const useVoiceInput = (onResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript) {
      onResult(transcript);
      resetTranscript();
      setIsListening(false);
    }
  }, [listening, transcript, onResult, resetTranscript]);

  const startListening = () => {
    resetTranscript();
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: false });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsListening(false);
  };

  return {
    isListening,
    listening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  };
};
