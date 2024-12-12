import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function AudioStreaming() {
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:5000');
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Join a specific room
    newSocket.emit('join-room', 'my-audio-room');

    // Listen for incoming audio
    newSocket.on('receive-audio', (data) => {
      const audioBlob = base64ToBlob(data.audioChunk);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Convert base64 to Blob
  const base64ToBlob = (base64) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'audio/webm' });
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      const audioChunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          // Convert to base64 and send via socket
          const base64data = reader.result.split(',')[1];
          socket.emit('audio-stream', {
            audioChunk: base64data,
            roomId: 'my-audio-room'
          });
        };
        
        reader.readAsDataURL(audioBlob);
        audioChunks.length = 0;
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone', error);
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <div>
        <button 
          onClick={startRecording} 
          disabled={isRecording}
        >
          Start Recording
        </button>
        <button 
          onClick={stopRecording} 
          disabled={!isRecording}
        >
          Stop Recording
        </button>
      </div>
      
      <audio 
        ref={audioRef} 
        controls 
        className="mt-4"
      />
    </div>
  );
}

export default AudioStreaming;