/**
 * Optimized Audio Classifier - Non-blocking with Web Workers
 * Designed to prevent UI freezing during audio processing
 */

export interface AudioClassificationResult {
  type: 'music' | 'speech' | 'audio';
  confidence: number;
  features?: any;
  processingTime?: number;
}

export class OptimizedAudioClassifier {
  private worker: Worker | null = null;
  private initialized = false;
  private processingQueue: Array<{ resolve: Function; reject: Function }> = [];

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    if (typeof window === 'undefined') return;

    try {
      // Create Web Worker for audio processing
      const workerCode = `
        // Web Worker for audio processing
        let yamnetModel = null;
        
        self.onmessage = async function(e) {
          const { audioBuffer, fileName, jobId } = e.data;
          
          try {
            // Lightweight classification without heavy ML models
            const result = await classifyAudioLightweight(audioBuffer, fileName);
            self.postMessage({ jobId, result, success: true });
          } catch (error) {
            self.postMessage({ jobId, error: error.message, success: false });
          }
        };
        
        async function classifyAudioLightweight(audioBuffer, fileName) {
          const startTime = performance.now();
          
          // Convert ArrayBuffer to AudioBuffer-like structure
          const audioData = new Float32Array(audioBuffer);
          const sampleRate = 44100; // Default sample rate
          
          // Extract basic features (lightweight)
          const features = extractBasicFeatures(audioData, sampleRate);
          
          // Classify based on features and filename
          const classification = performLightweightClassification(features, fileName);
          
          const processingTime = performance.now() - startTime;
          
          return {
            ...classification,
            features: {
              energy: features.energy,
              zeroCrossingRate: features.zcr,
              spectralCentroid: features.spectralCentroid
            },
            processingTime
          };
        }
        
        function extractBasicFeatures(audioData, sampleRate) {
          // Energy calculation
          let energy = 0;
          for (let i = 0; i < audioData.length; i++) {
            energy += audioData[i] * audioData[i];
          }
          energy = energy / audioData.length;
          
          // Zero Crossing Rate
          let zeroCrossings = 0;
          for (let i = 1; i < audioData.length; i++) {
            if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
              zeroCrossings++;
            }
          }
          const zcr = zeroCrossings / audioData.length;
          
          // Simple spectral centroid approximation
          const spectralCentroid = calculateSpectralCentroid(audioData, sampleRate);
          
          return { energy, zcr, spectralCentroid };
        }
        
        function calculateSpectralCentroid(audioData, sampleRate) {
          // Simplified spectral centroid calculation
          const frameSize = 1024;
          let weightedSum = 0;
          let magnitudeSum = 0;
          
          for (let i = 0; i < Math.min(audioData.length, frameSize); i++) {
            const magnitude = Math.abs(audioData[i]);
            const frequency = (i * sampleRate) / (2 * frameSize);
            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
          }
          
          return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
        }
        
        function performLightweightClassification(features, fileName) {
          let musicScore = 0;
          let speechScore = 0;
          let audioScore = 0;
          
          // Feature-based classification
          if (features.energy > 0.01) {
            if (features.zcr > 0.1) {
              speechScore += 0.3; // High ZCR suggests speech
            } else {
              musicScore += 0.3; // Low ZCR suggests music
            }
          }
          
          if (features.spectralCentroid > 2000) {
            speechScore += 0.2; // Higher spectral centroid suggests speech
          } else {
            musicScore += 0.2; // Lower spectral centroid suggests music
          }
          
          // Filename-based classification
          if (fileName) {
            const lowerName = fileName.toLowerCase();
            
            // Music keywords
            const musicKeywords = ['music', 'song', 'track', 'album', 'beat', 'melody'];
            musicKeywords.forEach(keyword => {
              if (lowerName.includes(keyword)) musicScore += 0.2;
            });
            
            // Speech keywords
            const speechKeywords = ['speech', 'talk', 'voice', 'conversation', 'interview'];
            speechKeywords.forEach(keyword => {
              if (lowerName.includes(keyword)) speechScore += 0.2;
            });
            
            // Audio/SFX keywords
            const audioKeywords = ['audio', 'sound', 'sfx', 'effect', 'ambient'];
            audioKeywords.forEach(keyword => {
              if (lowerName.includes(keyword)) audioScore += 0.2;
            });
          }
          
          // Default scoring if no clear classification
          if (musicScore === 0 && speechScore === 0 && audioScore === 0) {
            audioScore = 0.5;
          }
          
          // Determine final classification
          const maxScore = Math.max(musicScore, speechScore, audioScore);
          const type = maxScore === musicScore ? 'music' :
                      maxScore === speechScore ? 'speech' : 'audio';
          
          return {
            type,
            confidence: Math.min(maxScore, 1.0)
          };
        }
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      
      this.worker.onmessage = (e) => {
        const { jobId, result, error, success } = e.data;
        const job = this.processingQueue.find(j => (j as any).jobId === jobId);
        
        if (job) {
          this.processingQueue = this.processingQueue.filter(j => (j as any).jobId !== jobId);
          
          if (success) {
            job.resolve(result);
          } else {
            job.reject(new Error(error));
          }
        }
      };

      this.worker.onerror = (error) => {
        console.error('Audio processing worker error:', error);
        // Reject all pending jobs
        this.processingQueue.forEach(job => {
          job.reject(new Error('Worker failed'));
        });
        this.processingQueue = [];
      };

      this.initialized = true;
      console.log('✅ Optimized audio classifier initialized with Web Worker');

    } catch (error) {
      console.warn('Failed to initialize Web Worker, falling back to main thread:', error);
      this.initialized = false;
    }
  }

  async classifyAudio(audioInput: string | ArrayBuffer, fileName?: string): Promise<AudioClassificationResult> {
    const startTime = performance.now();

    try {
      // Quick filename-based classification first (non-blocking)
      if (fileName) {
        const quickResult = this.quickFilenameClassification(fileName);
        if (quickResult.confidence > 0.7) {
          return {
            ...quickResult,
            processingTime: performance.now() - startTime
          };
        }
      }

      // If we have a Worker, use it for processing
      if (this.worker && this.initialized) {
        return await this.processWithWorker(audioInput, fileName);
      }

      // Fallback to lightweight main thread processing
      return await this.processMainThread(audioInput, fileName);

    } catch (error) {
      console.error('Audio classification failed:', error);
      return this.fallbackClassification(fileName);
    }
  }

  private async processWithWorker(audioInput: string | ArrayBuffer, fileName?: string): Promise<AudioClassificationResult> {
    return new Promise(async (resolve, reject) => {
      const jobId = Math.random().toString(36).substr(2, 9);
      
      // Add to processing queue with timeout
      const job = { resolve, reject, jobId } as any;
      job.jobId = jobId;
      this.processingQueue.push(job);
      
      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        this.processingQueue = this.processingQueue.filter(j => (j as any).jobId !== jobId);
        reject(new Error('Audio processing timeout'));
      }, 10000); // 10 second timeout

      try {
        let audioBuffer: ArrayBuffer;

        if (typeof audioInput === 'string') {
          // Load audio from URL
          const response = await fetch(audioInput);
          audioBuffer = await response.arrayBuffer();
        } else {
          audioBuffer = audioInput;
        }

        // Send to worker
        this.worker!.postMessage({
          audioBuffer,
          fileName,
          jobId
        });

        // Clear timeout when resolved
        job.resolve = (result: any) => {
          clearTimeout(timeout);
          resolve(result);
        };

        job.reject = (error: any) => {
          clearTimeout(timeout);
          reject(error);
        };

      } catch (error) {
        clearTimeout(timeout);
        this.processingQueue = this.processingQueue.filter(j => (j as any).jobId !== jobId);
        reject(error);
      }
    });
  }

  private async processMainThread(audioInput: string | ArrayBuffer, fileName?: string): Promise<AudioClassificationResult> {
    // Lightweight processing on main thread
    const quickResult = this.quickFilenameClassification(fileName);
    
    // Add some basic audio analysis if needed
    if (quickResult.confidence < 0.5) {
      // Very basic analysis without heavy processing
      return {
        type: 'audio',
        confidence: 0.6,
        processingTime: 1
      };
    }

    return quickResult;
  }

  private quickFilenameClassification(fileName?: string): AudioClassificationResult {
    if (!fileName) {
      return { type: 'audio', confidence: 0.3 };
    }

    const lowerName = fileName.toLowerCase();
    let musicScore = 0;
    let speechScore = 0;
    let audioScore = 0;

    // Enhanced music keywords
    const musicKeywords = ['music', 'song', 'track', 'album', 'beat', 'melody', 'rhythm', 'bass', 'drum'];
    musicKeywords.forEach(keyword => {
      if (lowerName.includes(keyword)) musicScore += 0.15;
    });

    // Enhanced speech keywords
    const speechKeywords = ['speech', 'talk', 'voice', 'conversation', 'interview', 'podcast', 'lecture'];
    speechKeywords.forEach(keyword => {
      if (lowerName.includes(keyword)) speechScore += 0.15;
    });

    // Enhanced audio keywords
    const audioKeywords = ['audio', 'sound', 'sfx', 'effect', 'ambient', 'noise'];
    audioKeywords.forEach(keyword => {
      if (lowerName.includes(keyword)) audioScore += 0.15;
    });

    // File extension boost
    if (lowerName.endsWith('.mp3') || lowerName.endsWith('.m4a')) {
      musicScore += 0.1;
    }

    const maxScore = Math.max(musicScore, speechScore, audioScore);
    const type = maxScore === musicScore ? 'music' :
                maxScore === speechScore ? 'speech' : 'audio';

    return {
      type,
      confidence: Math.min(maxScore, 1.0)
    };
  }

  private fallbackClassification(fileName?: string): AudioClassificationResult {
    return {
      type: 'audio',
      confidence: 0.5,
      processingTime: 0
    };
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.processingQueue = [];
    this.initialized = false;
  }
}

// Export singleton instance
export const optimizedAudioClassifier = new OptimizedAudioClassifier();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    optimizedAudioClassifier.destroy();
  });
} 