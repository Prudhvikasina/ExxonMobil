// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class MicrophoneServiceService {
//   private socket: WebSocket | null = null;
//   private isSocketOpen: boolean = false;

//   constructor() {}

//   connect(): void {
//     console.log('Attempting to connect to WebSocket...');
//     this.socket = new WebSocket('ws://127.0.0.1:8000/TopicsFlow/ws/audio');

//     // Log when the connection is successfully established
//     this.socket.onopen = () => {
//       console.log('WebSocket connection established!');
//       this.isSocketOpen = true; // Set the flag when connection is open
//     };

//     // Log when a message is received from the server
//     this.socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log('Message received from WebSocket:', data);
//       this.onTranscription(data.text);
//     };

//     // Log any errors that occur during the connection
//     this.socket.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     // Log when the WebSocket connection is closed
//     this.socket.onclose = (event) => {
//       if (event.wasClean) {
//         console.log('WebSocket closed cleanly:', event.code);
//       } else {
//         console.error('WebSocket connection closed unexpectedly:', event.code);
//       }
//       this.isSocketOpen = false; // Reset the flag when connection is closed
//     };
//   }

//   sendAudioChunk(chunk: ArrayBuffer): void {
//     if (this.isSocketOpen) {
//       console.log('Sending audio chunk to WebSocket...');
//       this.socket?.send(chunk);
//     } else {
//       console.error('WebSocket is not open! Cannot send data.');
//       // Optionally, you can try to reconnect or retry sending after a delay
//       setTimeout(() => {
//         if (this.isSocketOpen) {
//           console.log('Retrying to send audio chunk...');
//           this.socket?.send(chunk);
//         } else {
//           console.error('WebSocket is still not open after retry.');
//         }
//       }, 1000); // Retry after 1 second
//     }
//   }

//   close(): void {
//     if (this.socket) {
//       console.log('Closing WebSocket connection...');
//       this.socket.close();
//     }
//   }

//   onTranscription: (text: string) => void = () => {};
// }


import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MicrophoneServiceService {
  private recognition: any;
  private transcriptSubject = new Subject<string>();
  private isListening = false;

  constructor() {}

  startListening(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;  // Keep listening until stopped manually
      this.recognition.interimResults = true;  // Enable real-time results

      // This event is fired when speech is recognized
      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          // Only process final results
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        // Update the transcript in real-time
        this.transcriptSubject.next(transcript);
      };

      // Handle any errors that occur during speech recognition
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
      };

      // Start the speech recognition process
      this.recognition.start();
      this.isListening = true;
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getTranscript(): Observable<string> {
    return this.transcriptSubject.asObservable();
  }
}
