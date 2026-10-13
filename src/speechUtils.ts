// Web Speech API wrapper for low-literacy kiosk accessibility

export class KioskSpeechEngine {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  static speak(text: string, langCode: string = 'en-IN'): void {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // Stop any active speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clarity in rural / elderly kiosks
      utterance.pitch = 1.0;
      utterance.lang = langCode;

      // Try to find matching voice
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(langCode.slice(0, 2)));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  }

  static stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  static startListening(
    langCode: string,
    onResult: (text: string) => void,
    onError?: (err: any) => void
  ): () => void {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError('Speech Recognition is not supported on this browser.');
      return () => {};
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = langCode || 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        if (onError) onError(event.error);
      };

      recognition.start();

      return () => {
        try {
          recognition.abort();
        } catch (_) {}
      };
    } catch (err) {
      if (onError) onError(err);
      return () => {};
    }
  }
}
