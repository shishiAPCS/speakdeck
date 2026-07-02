import { KokoroTTS, TextSplitterStream, detectWebGPU } from './dist/lib/kokoro-bundle.es.js';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const MODEL_KEY = 'speakdeck-kokoro-q8f16-v1-modelscope';
const MODEL_URL = 'https://modelscope.cn/models/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/master/onnx/model_q8f16.onnx';
const VOICE_OPTIONS = [
  { id: 'af_bella', label: 'US · Female' },
  { id: 'am_michael', label: 'US · Male' },
  { id: 'bf_emma', label: 'UK · Female' },
  { id: 'bm_fable', label: 'UK · Male' },
];

const DEFAULT_VOICE = VOICE_OPTIONS[0].id;
const DEFAULT_SPEED = 1.0;
const VOICE_LABELS = Object.fromEntries(VOICE_OPTIONS.map((voice) => [voice.id, voice.label]));

const SAMPLE_TEXT = 'Today I want to talk about a person who has influenced me a lot. He is patient, thoughtful, and always willing to help others. What I admire most is the way he explains difficult ideas in a simple and natural way.';

const state = {
  selectedVoice: DEFAULT_VOICE,
  cacheManager: null,
  kokoro: null,
  waveformPlayer: null,
  audioBlob: null,
  isModelReady: false,
  isInitializing: false,
  isGenerating: false,
  hasGeneratedAudio: false,
  isGeneratedAudioStale: false,
  lastGenerationFailed: false,
  computeMode: 'unknown',
};

const $ = (id) => document.getElementById(id);

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function setChipState(chipId, stateName) {
  const chip = $(chipId);
  if (chip) chip.dataset.state = stateName;
}

function setModelStatus(text, chipState = 'idle') {
  const el = $('tts-model-status');
  if (el) el.textContent = text;
  setChipState('tts-model-status-chip', chipState);
}

function setGenerationStatus(text, chipState = 'idle') {
  const el = $('tts-generation-status');
  if (el) el.textContent = text;
  setChipState('tts-generation-status-chip', chipState);
}

function setVoiceStatus() {
  const el = $('tts-voice-status');
  if (el) el.textContent = VOICE_LABELS[state.selectedVoice] || state.selectedVoice;
}

function setStatusLine(text) {
  const el = $('tts-status-line');
  if (el) el.textContent = text;
}

function setProgress(percent, text = '') {
  const fill = $('tts-progress-fill');
  if (fill) {
    const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
    fill.style.width = `${safePercent}%`;
  }
  if (text) setStatusLine(text);
}

function getGenerateButtonText() {
  if (state.isGenerating) return 'Generating audio...';
  if (state.isInitializing && !state.kokoro) return 'Preparing TTS...';
  if (state.lastGenerationFailed) return 'Try Again';
  if (state.hasGeneratedAudio && state.isGeneratedAudioStale) return 'Generate Updated Audio';
  if (state.hasGeneratedAudio) return 'Regenerate Audio';
  return 'Generate Audio';
}

function setGenerateEnabled(enabled) {
  const btn = $('tts-generate-button');
  if (!btn) return;

  const canClick = !!enabled && !state.isGenerating;
  btn.disabled = !canClick;
  btn.textContent = getGenerateButtonText();

  btn.classList.remove('btn-success', 'btn-warning', 'btn-danger', 'btn-primary');
  if (state.isGenerating || state.isInitializing) {
    btn.classList.add('btn-warning');
  } else if (state.lastGenerationFailed) {
    btn.classList.add('btn-danger');
  } else if (state.hasGeneratedAudio && state.isGeneratedAudioStale) {
    btn.classList.add('btn-primary');
  } else {
    btn.classList.add('btn-success');
  }
}

function markGeneratedAudioStale() {
  if (!state.hasGeneratedAudio || state.isGenerating) return;
  state.isGeneratedAudioStale = true;
  state.lastGenerationFailed = false;
  setGenerationStatus('Script/voice changed · regenerate', 'idle');
  setStatusLine('Script or voice changed. Generate updated audio when ready.');
  setGenerateEnabled(!!state.kokoro);
}

function setDownloadEnabled(enabled) {
  const btn = $('tts-download-button');
  if (btn) btn.disabled = !enabled;
}

function showFallback(show) {
  const row = $('tts-fallback-row');
  if (row) row.hidden = !show;
}

function updateTextCount() {
  const text = $('tts-text')?.value || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const count = $('tts-count');
  if (count) count.textContent = `${words} words · ${chars} characters`;
}

function syncVoiceButtons() {
  const buttons = Array.from(document.querySelectorAll('.tts-voice-btn'));
  buttons.forEach((button, index) => {
    const voice = VOICE_OPTIONS[index];
    if (!voice) return;
    button.dataset.voice = voice.id;
    button.textContent = voice.label;
    button.classList.toggle('is-selected', voice.id === state.selectedVoice);
  });
}

function initVoiceButtons() {
  syncVoiceButtons();
  document.querySelectorAll('.tts-voice-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const voice = button.dataset.voice || DEFAULT_VOICE;
      state.selectedVoice = voice;
      document.querySelectorAll('.tts-voice-btn').forEach((b) => b.classList.remove('is-selected'));
      button.classList.add('is-selected');
      setVoiceStatus();
      markGeneratedAudioStale();
    });
  });
  setVoiceStatus();
}

function initScriptButtons() {
  const text = $('tts-text');
  text?.addEventListener('input', () => {
    updateTextCount();
    markGeneratedAudioStale();
  });
  $('tts-clear-text-button')?.addEventListener('click', () => {
    if (text) text.value = '';
    updateTextCount();
    markGeneratedAudioStale();
    text?.focus();
  });
  $('tts-sample-button')?.addEventListener('click', () => {
    if (text) text.value = SAMPLE_TEXT;
    updateTextCount();
    markGeneratedAudioStale();
    text?.focus();
  });
  updateTextCount();
}

async function getCachedModel() {
  if (!state.cacheManager) return null;
  const model = await state.cacheManager.getModel(MODEL_KEY);
  if (!model) return null;
  if (model instanceof Uint8Array) return model;
  if (model instanceof ArrayBuffer) return new Uint8Array(model);
  if (ArrayBuffer.isView(model)) return new Uint8Array(model.buffer, model.byteOffset, model.byteLength);
  return null;
}

async function saveModelToCache(modelData, source = 'ModelScope auto-download') {
  if (!state.cacheManager) throw new Error('Model cache is not available.');
  await state.cacheManager.saveModel(MODEL_KEY, modelData, {
    engine: 'kokoro',
    version: 'Kokoro-82M-v1.0-ONNX',
    dtype: 'q8/q8f16',
    source,
    url: MODEL_URL,
  });
}

async function downloadModelWithProgress() {
  setModelStatus('Downloading model...', 'working');
  setGenerationStatus('First-time setup', 'working');
  setProgress(0, 'Downloading Kokoro model from ModelScope...');
  showFallback(false);

  const response = await fetch(MODEL_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Model download failed: HTTP ${response.status}`);
  }
  if (!response.body) {
    throw new Error('This browser cannot stream the model download.');
  }

  const total = Number(response.headers.get('Content-Length')) || 0;
  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;

    if (total > 0) {
      const percent = (loaded / total) * 100;
      setProgress(percent, `Downloading model: ${percent.toFixed(1)}% · ${formatBytes(loaded)} / ${formatBytes(total)}`);
    } else {
      setProgress(0, `Downloading model: ${formatBytes(loaded)} downloaded...`);
    }
  }

  const blob = new Blob(chunks, { type: 'application/octet-stream' });
  const modelData = new Uint8Array(await blob.arrayBuffer());
  if (!modelData.byteLength) throw new Error('Downloaded model is empty.');
  return modelData;
}

async function importModelFromFile(file) {
  if (!file) return;
  try {
    setGenerateEnabled(false);
    setDownloadEnabled(false);
    showFallback(false);
    setModelStatus('Importing model...', 'working');
    setGenerationStatus('Importing local file', 'working');
    setProgress(0, `Reading local model file: ${file.name}`);

    const data = new Uint8Array(await file.arrayBuffer());
    if (!data.byteLength) throw new Error('Imported file is empty.');

    setProgress(50, 'Saving imported model to browser cache...');
    await saveModelToCache(data, `Manual import: ${file.name}`);
    setProgress(100, 'Imported model saved. Initializing TTS...');
    await initializeKokoro(data);
  } catch (err) {
    console.error(err);
    showFallback(true);
    setModelStatus('Import failed', 'error');
    setGenerationStatus('Model setup failed', 'error');
    setStatusLine(`Import failed: ${err.message || err}`);
  }
}

async function ensureModelReady() {
  if (state.isModelReady && state.kokoro) return;
  if (state.isInitializing) return;

  state.isInitializing = true;
  setGenerateEnabled(false);
  setDownloadEnabled(false);

  try {
    setModelStatus('Checking cache...', 'working');
    setGenerationStatus('Preparing TTS', 'working');
    setProgress(4, 'Checking browser cache for Kokoro model...');

    let modelData = await getCachedModel();
    if (modelData && modelData.byteLength) {
      setProgress(100, `Loaded model from browser cache: ${formatBytes(modelData.byteLength)}`);
      setModelStatus('Cached model found', 'working');
    } else {
      modelData = await downloadModelWithProgress();
      setProgress(95, 'Saving model to browser cache...');
      await saveModelToCache(modelData);
      setProgress(100, `Model cached: ${formatBytes(modelData.byteLength)}`);
    }

    await initializeKokoro(modelData);
  } catch (err) {
    console.error(err);
    showFallback(true);
    setGenerateEnabled(false);
    setModelStatus('Model setup failed', 'error');
    setGenerationStatus('Setup failed', 'error');
    setStatusLine(`Automatic setup failed: ${err.message || err}`);
  } finally {
    state.isInitializing = false;
    setGenerateEnabled(!!state.kokoro);
  }
}

async function initializeKokoro(modelData) {
  if (!modelData || !modelData.byteLength) throw new Error('No valid model data available.');

  setModelStatus('Initializing TTS...', 'working');
  setGenerationStatus('Loading Kokoro', 'working');
  setStatusLine('Initializing Kokoro TTS engine...');

  const hasWebGPU = await detectWebGPU().catch(() => false);
  const preferredDevice = hasWebGPU ? 'webgpu' : 'wasm';
  const attempts = [
    { device: preferredDevice, dtype: 'q8' },
    { device: 'wasm', dtype: 'q8' },
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      state.computeMode = `${attempt.device.toUpperCase()} · ${attempt.dtype}`;
      setStatusLine(`Loading Kokoro with ${state.computeMode}...`);
      const customLoadFn = async () => modelData;
      state.kokoro = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: attempt.dtype,
        device: attempt.device,
        load_fn: customLoadFn,
      });
      console.log('Kokoro voices:', state.kokoro.voices);
      state.isModelReady = true;
      setModelStatus(`Ready · ${state.computeMode}`, 'ready');
      setGenerationStatus('Idle · Ready to generate', 'idle');
      setStatusLine(`TTS model ready. Voice count: ${Object.keys(state.kokoro.voices || {}).length || 'unknown'}.`);
      setGenerateEnabled(true);
      return;
    } catch (err) {
      console.warn('Kokoro init attempt failed:', attempt, err);
      lastError = err;
    }
  }

  // If cached model is incompatible/corrupt, remove it so the next refresh can try again.
  try { await state.cacheManager?.deleteModel(MODEL_KEY); } catch (_) {}
  throw lastError || new Error('Kokoro initialization failed.');
}

function audioChunkToBlob(chunk) {
  if (!chunk) throw new Error('No audio chunk returned by Kokoro.');
  if (typeof chunk.toBlob === 'function') return chunk.toBlob();
  if (chunk instanceof Blob) return chunk;
  if (chunk instanceof ArrayBuffer) return new Blob([chunk], { type: 'audio/wav' });
  if (ArrayBuffer.isView(chunk)) return new Blob([chunk.buffer], { type: 'audio/wav' });
  if (chunk.buffer) return new Blob([chunk.buffer], { type: 'audio/wav' });
  throw new Error('Unknown audio format returned by Kokoro.');
}

async function generateAudio() {
  const text = $('tts-text')?.value.trim() || '';
  if (!text) {
    setGenerationStatus('No script text', 'error');
    setStatusLine('Please type or paste some English text first.');
    $('tts-text')?.focus();
    return;
  }

  if (!state.kokoro) {
    await ensureModelReady();
    if (!state.kokoro) return;
  }

  try {
    state.isGenerating = true;
    state.audioBlob = null;
    state.hasGeneratedAudio = false;
    state.isGeneratedAudioStale = false;
    state.lastGenerationFailed = false;
    setDownloadEnabled(false);
    setGenerateEnabled(false);
    setGenerationStatus('Generating audio...', 'working');
    setStatusLine(`Generating with ${VOICE_LABELS[state.selectedVoice] || state.selectedVoice}...`);

    const streamer = new TextSplitterStream();
    streamer.push(text);
    streamer.close();

    const chunks = [];
    const stream = state.kokoro.stream(streamer, {
      voice: state.selectedVoice,
      speed: DEFAULT_SPEED,
      streamAudio: false,
    });

    for await (const { audio } of stream) {
      if (audio) chunks.push(audio);
      setStatusLine(`Generating audio... received ${chunks.length} chunk${chunks.length === 1 ? '' : 's'}.`);
    }

    if (!chunks.length) throw new Error('Kokoro returned no audio.');
    state.audioBlob = audioChunkToBlob(chunks[0]);

    if (!state.waveformPlayer) {
      state.waveformPlayer = new window.WaveformPlayer($('tts-waveform-container'));
    }

    await state.waveformPlayer.loadAudio(state.audioBlob);
    try { state.waveformPlayer.play(); } catch (_) {}

    state.hasGeneratedAudio = true;
    state.isGeneratedAudioStale = false;
    state.lastGenerationFailed = false;
    setDownloadEnabled(true);
    setGenerationStatus('Done · Preview ready', 'done');
    setStatusLine(`Generated WAV: ${formatBytes(state.audioBlob.size)}. You can preview or download it now.`);
  } catch (err) {
    console.error(err);
    state.hasGeneratedAudio = false;
    state.isGeneratedAudioStale = false;
    state.lastGenerationFailed = true;
    setGenerationStatus('Generation failed', 'error');
    setStatusLine(`Generation failed: ${err.message || err}`);
  } finally {
    state.isGenerating = false;
    setGenerateEnabled(!!state.kokoro);
  }
}

function downloadAudio() {
  if (!state.audioBlob) return;
  const label = (VOICE_LABELS[state.selectedVoice] || state.selectedVoice).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '');
  const url = URL.createObjectURL(state.audioBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `speakdeck-tts-${label}-${stamp}.wav`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function clearTTSCache() {
  if (!state.cacheManager) return;
  if (!confirm('Clear the cached TTS model from this browser? The next use will download it again.')) return;
  try {
    await state.cacheManager.deleteModel(MODEL_KEY);
    state.kokoro = null;
    state.isModelReady = false;
    state.audioBlob = null;
    state.hasGeneratedAudio = false;
    state.isGeneratedAudioStale = false;
    state.lastGenerationFailed = false;
    setDownloadEnabled(false);
    setGenerateEnabled(false);
    setProgress(0, 'TTS cache cleared. Refresh the page to download again.');
    setModelStatus('Cache cleared', 'idle');
    setGenerationStatus('Refresh needed', 'idle');
  } catch (err) {
    console.error(err);
    setStatusLine(`Failed to clear cache: ${err.message || err}`);
  }
}

function isTypingTarget(element) {
  if (!element) return false;
  const tagName = element.tagName;
  return element.isContentEditable || tagName === 'TEXTAREA' || tagName === 'INPUT' || tagName === 'SELECT';
}

const SHORT_SEEK_SECONDS = 3;
const LONG_SEEK_SECONDS = 10;

function patchWaveformPauseBehavior(player) {
  if (!player || player.__speakDeckPausePatchApplied) return;

  // The original WaveformPlayer.pause() calls source.stop(). In Web Audio,
  // stop() fires the source.onended handler, and this player's onended handler
  // calls stop(), which resets pauseTime to 0. This small instance patch keeps
  // pause/resume from jumping back to the beginning.
  player.pause = function pauseWithoutReset() {
    if (!this.source) return;

    this.pauseTime = this.getCurrentTime();
    const sourceToStop = this.source;
    this.source = null;

    // Prevent the intentional pause from being treated as natural audio ending.
    sourceToStop.onended = null;
    try { sourceToStop.stop(); } catch (_) {}

    this.isPlaying = false;
    this.playIcon.style.display = 'block';
    this.pauseIcon.style.display = 'none';
    this.currentTimeEl.textContent = this.formatTime(this.pauseTime);
    this.drawProgress();
  };

  player.__speakDeckPausePatchApplied = true;
}

function toggleGeneratedAudio() {
  const player = state.waveformPlayer;
  if (!player || !player.audioBuffer) return;
  patchWaveformPauseBehavior(player);

  if (player.isPlaying && typeof player.pause === 'function') {
    player.pause();
  } else if (typeof player.play === 'function') {
    player.play();
  }
}

function nudgeGeneratedAudio(seconds) {
  const player = state.waveformPlayer;
  if (!player || !player.audioBuffer || typeof player.seek !== 'function') return;
  patchWaveformPauseBehavior(player);

  const current = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : 0;
  player.seek(current + seconds);
}

function isPlaybackShortcut(event) {
  return event.code === 'Space' || event.key === 'ArrowLeft' || event.key === 'ArrowRight';
}

function handlePlaybackShortcut(event) {
  if (isTypingTarget(document.activeElement)) return false;
  if (!state.waveformPlayer || !state.waveformPlayer.audioBuffer) return false;
  if (!isPlaybackShortcut(event)) return false;

  event.preventDefault();
  event.stopPropagation();

  if (event.code === 'Space') {
    toggleGeneratedAudio();
    document.activeElement?.blur?.();
    return true;
  }

  if (event.key === 'ArrowLeft') {
    nudgeGeneratedAudio(event.shiftKey ? -LONG_SEEK_SECONDS : -SHORT_SEEK_SECONDS);
    return true;
  }

  if (event.key === 'ArrowRight') {
    nudgeGeneratedAudio(event.shiftKey ? LONG_SEEK_SECONDS : SHORT_SEEK_SECONDS);
    return true;
  }

  return false;
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    handlePlaybackShortcut(event);
  }, true);

  // Prevent Space keyup from triggering a focused button click after our shortcut.
  document.addEventListener('keyup', (event) => {
    if (event.code === 'Space' && !isTypingTarget(document.activeElement)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

function initWaveformShell() {
  const container = $('tts-waveform-container');
  if (container && window.WaveformPlayer) {
    state.waveformPlayer = new window.WaveformPlayer(container);
    patchWaveformPauseBehavior(state.waveformPlayer);
    // Keep it empty until the first generation; the player UI still looks better than a blank box.
  }
}

function init() {
  if (!window.ModelCacheManager) {
    setStatusLine('ModelCacheManager failed to load. Check tts/model-cache-manager.js.');
    setModelStatus('Cache unavailable', 'error');
    return;
  }
  if (!window.WaveformPlayer) {
    setStatusLine('WaveformPlayer failed to load. Check tts/waveform-player.js.');
    setGenerationStatus('Waveform unavailable', 'error');
    return;
  }

  state.cacheManager = new window.ModelCacheManager();
  initVoiceButtons();
  initScriptButtons();
  initWaveformShell();
  initKeyboardShortcuts();

  $('tts-generate-button')?.addEventListener('click', generateAudio);
  $('tts-download-button')?.addEventListener('click', downloadAudio);
  $('tts-clear-cache-button')?.addEventListener('click', clearTTSCache);
  $('tts-model-import')?.addEventListener('change', (event) => importModelFromFile(event.target.files?.[0]));

  ensureModelReady();
}

document.addEventListener('DOMContentLoaded', init);
