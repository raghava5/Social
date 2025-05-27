// Audio Classification Service using TensorFlow.js + YAMNet
import * as tf from '@tensorflow/tfjs';

export interface AudioClassificationResult {
  type: 'music' | 'speech' | 'audio' | 'unknown';
  confidence: number;
  features?: {
    tempo?: number;
    energy?: number;
    spectralCentroid?: number;
    mfcc?: number[];
    speechRatio?: number;
    musicRatio?: number;
    voiceActivity?: number;
  };
}

export class AudioClassifier {
  private yamnetModel: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js
      await tf.ready();
      
      // 🚀 IMPROVED: Skip YAMNet model loading for now to avoid CORS issues
      try {
        console.log('🎵 Audio classifier initialized (using fallback classification)')
        // YAMNet model URL (Google's audio classification model) - DISABLED due to CORS
        // const modelUrl = 'https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1';
        // this.yamnetModel = await tf.loadGraphModel(modelUrl);
        // console.log('YAMNet model loaded successfully');
      } catch (error) {
        console.warn('YAMNet model not available, using fallback classification:', error);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio classifier:', error);
      this.isInitialized = true; // Continue with fallback methods
    }
  }

  async classifyAudio(audioUrl: string, fileName?: string): Promise<AudioClassificationResult> {
    await this.initialize();

    try {
      // Get audio buffer for analysis
      const audioBuffer = await this.loadAudioBuffer(audioUrl);
      
      // Extract comprehensive features
      const features = await this.extractFeatures(audioBuffer);
      
      // Perform classification using multiple methods
      const classification = await this.performClassification(audioBuffer, features, fileName);
      
      return {
        ...classification,
        features
      };
    } catch (error) {
      console.error('Audio classification failed:', error);
      return this.fallbackClassification(fileName);
    }
  }

  private async loadAudioBuffer(audioUrl: string): Promise<AudioBuffer> {
    try {
      // 🚀 IMPROVED: Better validation and error handling
      if (!audioUrl || audioUrl.trim() === '') {
        throw new Error('Invalid audio URL provided');
      }

      // 🚀 FIX CORS: Add proper headers and error handling
      const response = await fetch(audioUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'audio/*',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('Audio file is empty or corrupted');
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn('🚨 Audio loading failed (using fallback):', error);
      
      // 🚀 IMPROVED: Don't throw - return fallback classification instead
      throw new Error(`Audio loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractFeatures(audioBuffer: AudioBuffer): Promise<any> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    const features = {
      tempo: this.estimateTempo(channelData, sampleRate),
      energy: this.calculateEnergy(channelData),
      spectralCentroid: this.calculateSpectralCentroid(channelData, sampleRate),
      mfcc: this.calculateMFCC(channelData, sampleRate),
      speechRatio: await this.calculateSpeechRatio(channelData, sampleRate),
      musicRatio: this.calculateMusicRatio(channelData, sampleRate),
      voiceActivity: this.detectVoiceActivity(channelData, sampleRate),
      zeroCrossingRate: this.calculateZeroCrossingRate(channelData),
      spectralRolloff: this.calculateSpectralRolloff(channelData, sampleRate),
      fundamentalFrequency: this.estimateFundamentalFrequency(channelData, sampleRate)
    };
    
    return features;
  }

  private async performClassification(audioBuffer: AudioBuffer, features: any, fileName?: string): Promise<AudioClassificationResult> {
    let confidenceScores = {
      music: 0,
      speech: 0,
      audio: 0
    };

    // Method 1: YAMNet model classification (if available)
    if (this.yamnetModel) {
      try {
        const yamnetResult = await this.classifyWithYAMNet(audioBuffer);
        confidenceScores.music += yamnetResult.music * 0.4;
        confidenceScores.speech += yamnetResult.speech * 0.4;
        confidenceScores.audio += yamnetResult.audio * 0.4;
      } catch (error) {
        console.warn('YAMNet classification failed:', error);
      }
    }

    // Method 2: Feature-based classification
    const featureResult = this.classifyWithFeatures(features);
    confidenceScores.music += featureResult.music * 0.3;
    confidenceScores.speech += featureResult.speech * 0.3;
    confidenceScores.audio += featureResult.audio * 0.3;

    // Method 3: Enhanced filename analysis
    const filenameResult = this.classifyWithFilename(fileName);
    confidenceScores.music += filenameResult.music * 0.2;
    confidenceScores.speech += filenameResult.speech * 0.2;
    confidenceScores.audio += filenameResult.audio * 0.2;

    // Method 4: Voice activity detection boost
    if (features.voiceActivity > 0.7) {
      confidenceScores.speech += 0.1;
    }

    // Determine final classification
    const maxScore = Math.max(confidenceScores.music, confidenceScores.speech, confidenceScores.audio);
    const type = maxScore === confidenceScores.music ? 'music' :
                maxScore === confidenceScores.speech ? 'speech' : 'audio';

    return {
      type,
      confidence: maxScore
    };
  }

  private async classifyWithYAMNet(audioBuffer: AudioBuffer): Promise<any> {
    // Resample to 16kHz for YAMNet
    const targetSampleRate = 16000;
    const resampled = this.resampleAudio(audioBuffer.getChannelData(0), audioBuffer.sampleRate, targetSampleRate);
    
    // Create input tensor
    const inputTensor = tf.tensor(resampled).expandDims(0);
    
    // Run inference
    const predictions = await this.yamnetModel.predict(inputTensor);
    const scores = await predictions.data();
    
    // YAMNet class mappings (simplified)
    const musicClasses = [137, 138, 139, 140, 141]; // Various music classes
    const speechClasses = [0, 1, 2, 3, 4]; // Various speech classes
    
    let musicScore = 0;
    let speechScore = 0;
    
    musicClasses.forEach(classId => {
      if (scores[classId]) musicScore += scores[classId];
    });
    
    speechClasses.forEach(classId => {
      if (scores[classId]) speechScore += scores[classId];
    });
    
    const audioScore = 1 - musicScore - speechScore;
    
    inputTensor.dispose();
    predictions.dispose();
    
    return { music: musicScore, speech: speechScore, audio: audioScore };
  }

  private classifyWithFeatures(features: any): any {
    let musicScore = 0;
    let speechScore = 0;
    let audioScore = 0;

    // Music indicators
    if (features.tempo > 60 && features.tempo < 200) musicScore += 0.3;
    if (features.spectralCentroid > 1000 && features.spectralCentroid < 4000) musicScore += 0.2;
    if (features.energy > 0.1) musicScore += 0.2;
    if (features.musicRatio > 0.5) musicScore += 0.3;

    // Speech indicators
    if (features.speechRatio > 0.6) speechScore += 0.4;
    if (features.voiceActivity > 0.5) speechScore += 0.3;
    if (features.fundamentalFrequency > 80 && features.fundamentalFrequency < 300) speechScore += 0.2;
    if (features.zeroCrossingRate > 0.1 && features.zeroCrossingRate < 0.3) speechScore += 0.1;

    // Generic audio indicators
    if (features.energy < 0.05) audioScore += 0.2;
    if (features.spectralCentroid < 1000 || features.spectralCentroid > 8000) audioScore += 0.2;

    // Normalize scores
    const total = musicScore + speechScore + audioScore;
    if (total > 0) {
      musicScore /= total;
      speechScore /= total;
      audioScore /= total;
    } else {
      audioScore = 1;
    }

    return { music: musicScore, speech: speechScore, audio: audioScore };
  }

  private classifyWithFilename(fileName?: string): any {
    if (!fileName) return { music: 0.33, speech: 0.33, audio: 0.34 };

    const lowerName = fileName.toLowerCase();
    let musicScore = 0;
    let speechScore = 0;
    let audioScore = 0;

    // Enhanced music keywords
    const musicKeywords = [
      'music', 'song', 'track', 'album', 'beat', 'melody', 'rhythm', 'bass', 'drum',
      'guitar', 'piano', 'vocal', 'instrumental', 'remix', 'cover', 'acoustic',
      'electronic', 'rock', 'pop', 'jazz', 'classical', 'hip-hop', 'rap', 'dance',
      'techno', 'house', 'trance', 'reggae', 'blues', 'country', 'folk', 'metal'
    ];

    // Enhanced speech keywords  
    const speechKeywords = [
      'speech', 'talk', 'voice', 'recording', 'conversation', 'interview', 'podcast',
      'lecture', 'presentation', 'meeting', 'call', 'discussion', 'dialogue',
      'monologue', 'announcement', 'news', 'broadcast', 'radio', 'conference',
      'seminar', 'webinar', 'tutorial', 'lesson', 'story', 'narration', 'reading'
    ];

    // Enhanced audio keywords
    const audioKeywords = [
      'audio', 'sound', 'sfx', 'effect', 'ambient', 'nature', 'field-recording',
      'noise', 'tone', 'beep', 'alert', 'notification', 'chime', 'click',
      'whoosh', 'swoosh', 'impact', 'explosion', 'mechanical', 'electronic'
    ];

    // Check for keyword matches
    musicKeywords.forEach(keyword => {
      if (lowerName.includes(keyword)) musicScore += 0.1;
    });

    speechKeywords.forEach(keyword => {
      if (lowerName.includes(keyword)) speechScore += 0.1;
    });

    audioKeywords.forEach(keyword => {
      if (lowerName.includes(keyword)) audioScore += 0.1;
    });

    // File extension analysis
    if (lowerName.endsWith('.mp3') || lowerName.endsWith('.flac') || 
        lowerName.endsWith('.m4a') || lowerName.endsWith('.aac')) {
      musicScore += 0.05; // These formats are commonly used for music
    }

    if (lowerName.endsWith('.wav') || lowerName.endsWith('.ogg')) {
      audioScore += 0.05; // These formats are commonly used for audio/effects
    }

    // Voice/speech specific patterns
    if (lowerName.includes('voice') || lowerName.includes('speak') || 
        lowerName.includes('word') || lowerName.includes('phrase')) {
      speechScore += 0.15;
    }

    // Normalize
    const total = musicScore + speechScore + audioScore;
    if (total > 0) {
      musicScore /= total;
      speechScore /= total  
      audioScore /= total;
    } else {
      return { music: 0.33, speech: 0.33, audio: 0.34 };
    }

    return { music: musicScore, speech: speechScore, audio: audioScore };
  }

  private async calculateSpeechRatio(channelData: Float32Array, sampleRate: number): Promise<number> {
    // Implement speech detection using spectral analysis
    const frameSize = 2048;
    const hopSize = 512;
    let speechFrames = 0;
    let totalFrames = 0;

    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      const frame = channelData.slice(i, i + frameSize);
      
      // Calculate spectral features for this frame
      const spectrum = this.fft(frame);
      const spectralCentroid = this.calculateSpectralCentroidForFrame(spectrum);
      const spectralRolloff = this.calculateSpectralRolloffForFrame(spectrum);
      const zcr = this.calculateZeroCrossingRateForFrame(frame);
      
      // Speech characteristics:
      // - Spectral centroid typically between 500-4000 Hz
      // - Spectral rolloff typically below 8000 Hz  
      // - Moderate zero crossing rate
      const isSpeechLike = (
        spectralCentroid > 500 && spectralCentroid < 4000 &&
        spectralRolloff < 8000 &&
        zcr > 0.05 && zcr < 0.3
      );
      
      if (isSpeechLike) speechFrames++;
      totalFrames++;
    }

    return totalFrames > 0 ? speechFrames / totalFrames : 0;
  }

  private calculateMusicRatio(channelData: Float32Array, sampleRate: number): number {
    // Detect musical characteristics
    const frameSize = 2048;
    const hopSize = 512;
    let musicFrames = 0;
    let totalFrames = 0;

    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      const frame = channelData.slice(i, i + frameSize);
      
      const spectrum = this.fft(frame);
      const spectralCentroid = this.calculateSpectralCentroidForFrame(spectrum);
      const energy = this.calculateEnergyForFrame(frame);
      
      // Music characteristics:
      // - Wider spectral range
      // - Higher energy
      // - More complex harmonic structure
      const isMusicLike = (
        spectralCentroid > 1000 && spectralCentroid < 6000 &&
        energy > 0.01
      );
      
      if (isMusicLike) musicFrames++;
      totalFrames++;
    }

    return totalFrames > 0 ? musicFrames / totalFrames : 0;
  }

  private detectVoiceActivity(channelData: Float32Array, sampleRate: number): number {
    // Simple voice activity detection
    const frameSize = 1024;
    const hopSize = 256;
    let voiceFrames = 0;
    let totalFrames = 0;

    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      const frame = channelData.slice(i, i + frameSize);
      
      const energy = this.calculateEnergyForFrame(frame);
      const zcr = this.calculateZeroCrossingRateForFrame(frame);
      
      // Voice activity indicators
      const hasVoice = energy > 0.01 && zcr > 0.02 && zcr < 0.4;
      
      if (hasVoice) voiceFrames++;
      totalFrames++;
    }

    return totalFrames > 0 ? voiceFrames / totalFrames : 0;
  }

  private estimateTempo(channelData: Float32Array, sampleRate: number): number {
    // Simple tempo estimation using onset detection
    const frameSize = 2048;
    const hopSize = 512;
    const onsets: number[] = [];
    
    let prevEnergy = 0;
    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      const frame = channelData.slice(i, i + frameSize);
      const energy = this.calculateEnergyForFrame(frame);
      
      // Detect energy increase (onset)
      if (energy > prevEnergy * 1.5 && energy > 0.01) {
        onsets.push(i / sampleRate);
      }
      prevEnergy = energy;
    }
    
    if (onsets.length < 2) return 0;
    
    // Calculate average interval between onsets
    const intervals = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i-1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = 60 / avgInterval;
    
    return Math.max(0, Math.min(250, bpm)); // Clamp to reasonable range
  }

  private calculateEnergy(channelData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < channelData.length; i++) {
      sum += channelData[i] * channelData[i];
    }
    return sum / channelData.length;
  }

  private calculateEnergyForFrame(frame: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < frame.length; i++) {
      sum += frame[i] * frame[i];
    }
    return sum / frame.length;
  }

  private calculateSpectralCentroid(channelData: Float32Array, sampleRate: number): number {
    const spectrum = this.fft(channelData);
    return this.calculateSpectralCentroidForFrame(spectrum);
  }

  private calculateSpectralCentroidForFrame(spectrum: Float32Array): number {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < spectrum.length / 2; i++) {
      const magnitude = Math.sqrt(spectrum[i * 2] ** 2 + spectrum[i * 2 + 1] ** 2);
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  private calculateZeroCrossingRate(channelData: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < channelData.length; i++) {
      if ((channelData[i] >= 0) !== (channelData[i-1] >= 0)) {
        crossings++;
      }
    }
    return crossings / (channelData.length - 1);
  }

  private calculateZeroCrossingRateForFrame(frame: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < frame.length; i++) {
      if ((frame[i] >= 0) !== (frame[i-1] >= 0)) {
        crossings++;
      }
    }
    return crossings / (frame.length - 1);
  }

  private calculateSpectralRolloff(channelData: Float32Array, sampleRate: number): number {
    const spectrum = this.fft(channelData);
    return this.calculateSpectralRolloffForFrame(spectrum);
  }

  private calculateSpectralRolloffForFrame(spectrum: Float32Array): number {
    const magnitudes = [];
    for (let i = 0; i < spectrum.length / 2; i++) {
      magnitudes.push(Math.sqrt(spectrum[i * 2] ** 2 + spectrum[i * 2 + 1] ** 2));
    }
    
    const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag * mag, 0);
    const threshold = totalEnergy * 0.85;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < magnitudes.length; i++) {
      cumulativeEnergy += magnitudes[i] * magnitudes[i];
      if (cumulativeEnergy >= threshold) {
        return i;
      }
    }
    
    return magnitudes.length - 1;
  }

  private estimateFundamentalFrequency(channelData: Float32Array, sampleRate: number): number {
    // Simple autocorrelation-based pitch detection
    const minPeriod = Math.floor(sampleRate / 500); // 500 Hz max
    const maxPeriod = Math.floor(sampleRate / 50);  // 50 Hz min
    
    let bestPeriod = 0;
    let maxCorrelation = 0;
    
    for (let period = minPeriod; period <= maxPeriod && period < channelData.length / 2; period++) {
      let correlation = 0;
      let samples = Math.min(channelData.length - period, 1024);
      
      for (let i = 0; i < samples; i++) {
        correlation += channelData[i] * channelData[i + period];
      }
      
      correlation /= samples;
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }
    
    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  }

  private calculateMFCC(channelData: Float32Array, sampleRate: number): number[] {
    // Simplified MFCC calculation
    const spectrum = this.fft(channelData);
    const melFilters = this.createMelFilterBank(spectrum.length / 2, sampleRate);
    
    const mfcc = [];
    for (let i = 0; i < Math.min(13, melFilters.length); i++) {
      let sum = 0;
      for (let j = 0; j < spectrum.length / 2; j++) {
        const magnitude = Math.sqrt(spectrum[j * 2] ** 2 + spectrum[j * 2 + 1] ** 2);
        sum += magnitude * melFilters[i][j];
      }
      mfcc.push(Math.log(sum + 1e-10));
    }
    
    return mfcc;
  }

  private createMelFilterBank(nFreq: number, sampleRate: number): number[][] {
    const nFilters = 26;
    const filters = [];
    
    for (let i = 0; i < nFilters; i++) {
      const filter = new Array(nFreq).fill(0);
      // Simplified mel filter - in practice would use proper mel scale
      const start = Math.floor(i * nFreq / nFilters);
      const end = Math.floor((i + 2) * nFreq / nFilters);
      const peak = Math.floor((i + 1) * nFreq / nFilters);
      
      for (let j = start; j <= end; j++) {
        if (j <= peak) {
          filter[j] = (j - start) / (peak - start);
        } else {
          filter[j] = (end - j) / (end - peak);
        }
      }
      filters.push(filter);
    }
    
    return filters;
  }

  private fft(signal: Float32Array): Float32Array {
    // Simple FFT implementation (in practice would use a proper FFT library)
    const N = signal.length;
    const result = new Float32Array(N * 2);
    
    for (let k = 0; k < N; k++) {
      let realSum = 0;
      let imagSum = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        realSum += signal[n] * Math.cos(angle);
        imagSum += signal[n] * Math.sin(angle);
      }
      
      result[k * 2] = realSum;
      result[k * 2 + 1] = imagSum;
    }
    
    return result;
  }

  private resampleAudio(channelData: Float32Array, originalSampleRate: number, targetSampleRate: number): Float32Array {
    if (originalSampleRate === targetSampleRate) return channelData;
    
    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.floor(channelData.length / ratio);
    const resampled = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const originalIndex = i * ratio;
      const index = Math.floor(originalIndex);
      const fraction = originalIndex - index;
      
      if (index + 1 < channelData.length) {
        resampled[i] = channelData[index] * (1 - fraction) + channelData[index + 1] * fraction;
      } else {
        resampled[i] = channelData[index];
      }
    }
    
    return resampled;
  }

  private fallbackClassification(fileName?: string): AudioClassificationResult {
    // Enhanced fallback using filename analysis
    const filenameResult = this.classifyWithFilename(fileName);
    const maxScore = Math.max(filenameResult.music, filenameResult.speech, filenameResult.audio);
    
    const type = maxScore === filenameResult.music ? 'music' :
                maxScore === filenameResult.speech ? 'speech' : 'audio';
    
    return {
      type,
      confidence: Math.max(0.3, maxScore) // Minimum confidence for fallback
    };
  }
}

// Export singleton instance
export const audioClassifier = new AudioClassifier(); 