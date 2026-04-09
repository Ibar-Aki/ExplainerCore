import { useEffect, useRef, useState } from 'react';

interface AudioReadyPayload {
  blob: Blob;
  mimeType: string;
}

interface UsePracticeRecorderOptions {
  onError: (message: string) => void;
  onAudioReady?: (payload: AudioReadyPayload) => Promise<void> | void;
}

export function usePracticeRecorder(options: UsePracticeRecorderOptions) {
  const { onAudioReady, onError } = options;
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef('');
  const timerRef = useRef<number | null>(null);
  const stoppingRef = useRef(false);
  const normalStopRef = useRef(false);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  function stopTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function stopRecording() {
    if (stoppingRef.current) {
      return;
    }

    stoppingRef.current = true;
    normalStopRef.current = true;

    const recorder = mediaRecorderRef.current;
    const recognition = speechRecognitionRef.current;
    const stream = mediaStreamRef.current;

    try {
      recognition?.stop();
    } catch {
      // Ignore SpeechRecognition stop races.
    }

    try {
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
    } catch {
      // Ignore MediaRecorder stop races.
    }

    stream?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    speechRecognitionRef.current = null;
    stopTimer();
    setIsRecording(false);
    stoppingRef.current = false;
  }

  async function startRecording(timeLimitSec: number) {
    try {
      finalTranscriptRef.current = '';
      setTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const nextAudioUrl = URL.createObjectURL(blob);
        setAudioUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return nextAudioUrl;
        });

        if (onAudioReady) {
          try {
            await onAudioReady({
              blob,
              mimeType: blob.type || 'audio/webm',
            });
          } catch {
            onError('録音ファイルの保存に失敗しました。ネットワークかローカル API を確認してください。');
          }
        }

        normalStopRef.current = false;
      };

      const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ja-JP';
        recognition.onresult = (event) => {
          let finalText = finalTranscriptRef.current;
          let interimText = '';

          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const entry = event.results[index];
            const transcriptChunk = entry[0]?.transcript ?? '';
            if (entry.isFinal) {
              finalText += `${transcriptChunk}\n`;
            } else {
              interimText += transcriptChunk;
            }
          }

          finalTranscriptRef.current = finalText;
          setTranscript(`${finalText}${interimText}`.trim());
        };
        recognition.onerror = (event) => {
          if (normalStopRef.current && event.error === 'aborted') {
            return;
          }

          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }

          onError('ブラウザ音声認識に失敗しました。必要なら手動で文字起こしを補ってください。');
        };
        recognition.start();
        speechRecognitionRef.current = recognition;
      }

      recorder.start();
      setElapsedSec(0);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setElapsedSec((current) => {
          const next = current + 1;
          if (timeLimitSec > 0 && next >= timeLimitSec) {
            void stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch {
      onError('録音を開始できませんでした。ブラウザのマイク権限を確認してください。');
    }
  }

  function resetRecorderSession() {
    stoppingRef.current = false;
    normalStopRef.current = false;
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    speechRecognitionRef.current?.stop();
    speechRecognitionRef.current = null;
    stopTimer();
    setIsRecording(false);
    setElapsedSec(0);
    setTranscript('');
    finalTranscriptRef.current = '';
    setAudioUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return '';
    });
  }

  return {
    transcript,
    setTranscript,
    audioUrl,
    isRecording,
    elapsedSec,
    startRecording,
    stopRecording,
    resetRecorderSession,
  };
}
