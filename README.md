# SpeakDeck

**SpeakDeck** is a browser-based English speaking practice deck for classroom use.

It now has two connected modes:

```text
Transcribe Audio  → local speech-to-text, transcript playback, AI polish prompt
TTS Audio         → script editor, voice selection, generated practice audio, WAV download
```

The project is designed for English speaking practice, student recording review, and teacher-made listening / shadowing audio.

SpeakDeck is static and frontend-only. Student audio is processed locally in the browser. The app does **not** upload student recordings for transcription.

---

## Live Demo

```text
https://shishiapcs.github.io/speakdeck/
```

Main pages:

```text
https://shishiapcs.github.io/speakdeck/index.html
https://shishiapcs.github.io/speakdeck/tts.html
```

---

## What It Does

SpeakDeck supports two teaching workflows.

### 1. Transcribe Student Audio

```text
Load local Whisper model → Choose student audio → Transcribe → Listen and review → Copy AI polish prompt
```

Core workflow:

1. Load or restore a local Whisper `.bin` model.
2. Upload a student audio recording.
3. Transcribe the recording locally in the browser.
4. Review the result with synchronized transcript playback.
5. Click transcript lines to seek the audio.
6. Search inside the transcript.
7. Copy a ready-to-paste AI speaking-polish prompt.
8. Open a preferred AI assistant with shortcut buttons.

### 2. Generate Practice Audio

```text
Type English script → Choose voice → Generate audio → Preview waveform → Download WAV
```

Core workflow:

1. Open the **TTS Audio** page.
2. Type or paste a short English practice script.
3. Choose one of four curated English voices.
4. Generate audio in the browser using Kokoro TTS.
5. Preview the generated audio with a waveform player.
6. Download the result as a WAV file.

---

## Main Features

### Shared App Features

* **Two-mode SpeakDeck interface**
  A top mode switch links the transcription page and the TTS page so they feel like one coherent tool while keeping the code separated.

* **Retro classroom UI**
  The app uses a cassette / pixel-inspired interface with a two-column workstation layout.

* **Self-hosted Chinese pixel font**
  Ark Pixel font files are stored locally under `assets/fonts/ark-pixel/` for a more consistent Chinese UI style.

* **Static frontend-only project**
  No backend, account system, build system, React, Vue, or server API is required.

---

### Transcription Features

* **Local browser transcription**
  Whisper.cpp WebAssembly runs with a local `.bin` model inside the browser.

* **No server upload for transcription**
  Student audio stays on the user's device while this webpage transcribes it.

* **Manual Whisper model import**
  Users download and choose a local Whisper model file such as `ggml-tiny.en.bin`.

* **Cached Whisper model restore**
  Imported models can be stored in browser IndexedDB and restored on later visits.

* **Retro audio deck UI**
  The main control area uses a cassette-deck style interface with tactile playback controls.

* **Spinning cassette reels**
  The cassette reels spin while audio is playing and stop when the audio pauses or ends.

* **Animated input-level meter**
  A lightweight CSS-based LED meter pulses while audio is playing. It is decorative and does not analyze real volume.

* **Transcript Playback**
  The player shows synchronized timestamped transcript lines with current-line highlighting.

* **Click-to-seek, search, and selectable text**
  Users can jump to a transcript line, search for words or phrases, and select text for review.

* **Transcription keyboard shortcuts**

  | Key | Action |
  | --- | --- |
  | `Space` | Play / pause the selected audio |
  | `←` | Jump to the previous transcript line |
  | `→` | Jump to the next transcript line |

* **Copy polish prompt**
  Copies a ready-to-paste spoken-English correction prompt together with the cleaned transcript.

* **AI chatbot shortcuts**
  Provides shortcut buttons for Doubao, DeepSeek, Kimi, Yuanbao, Qwen, Wenxin, Qingyan, and ChatGPT.

* **Collapsible Model Bay and Debug terminal**
  Model setup and raw Whisper output remain available without dominating the main workspace.

---

### TTS Audio Features

* **Separate TTS page**
  `tts.html` is an independent page that shares the SpeakDeck visual style but keeps TTS code away from the stable transcription workflow.

* **Kokoro-only first version**
  The TTS page uses a single Kokoro TTS model path instead of exposing multiple engines or model choices.

* **ModelScope-first model download**
  The Kokoro ONNX model is downloaded from ModelScope on first use, which is more suitable for mainland China users than relying on Hugging Face.

* **Automatic model restore**
  The TTS model is cached in browser IndexedDB after the first successful download or import. Later visits can restore it without downloading again, unless browser site data is cleared or evicted.

* **Download progress display**
  When the model is missing, the page shows download / preparation progress instead of appearing frozen.

* **Manual fallback setup**
  Manual model download, local model import, and cache clearing are hidden inside **Model tools / fallback setup** so daily users see a cleaner interface.

* **Four curated English voices**

  | UI label | Kokoro voice ID |
  | --- | --- |
  | US · Female | `af_bella` |
  | US · Male | `am_michael` |
  | UK · Female | `bf_emma` |
  | UK · Male | `bm_fable` |

  The default voice is **US · Female**.

* **Large script editor**
  The right panel gives users a large space to write or edit practice text.

* **Word and character count**
  The editor shows word and character counts to help users keep clips short.

* **Script length tip**
  Short clips generate faster. A good classroom target is about **50–200 words per audio clip**. Longer scripts may take several minutes on slower devices.

* **Generate button states**
  The generate button clearly changes state:

  ```text
  Preparing TTS...
  Generate Audio
  Generating audio...
  Regenerate Audio
  Generate Updated Audio
  Try Again
  ```

* **Waveform preview**
  Generated audio appears in a larger preview area using `waveform-player.js`.

* **WAV download**
  The generated audio can be downloaded as a `.wav` file.

* **Generated-audio keyboard shortcuts**

  | Key | Action |
  | --- | --- |
  | `Space` | Play / pause generated audio |
  | `←` | Back 3 seconds |
  | `→` | Forward 3 seconds |
  | `Shift + ←` | Back 10 seconds |
  | `Shift + →` | Forward 10 seconds |

  Shortcuts are ignored while typing in the script editor.

---

## Privacy Note

SpeakDeck does not upload student audio for transcription. Whisper transcription runs locally in the browser.

The `Copy polish prompt` button only copies text to the clipboard. It does not call ChatGPT, DeepSeek, Kimi, Doubao, or any other AI API.

If a user manually pastes the copied prompt into a third-party AI service, that third-party service's own privacy policy applies.

For the TTS page, the generated audio is produced in the browser after the Kokoro runtime and model are available. The first-time model download comes from an external model host, currently ModelScope. The script text is not intentionally sent to an online TTS service.

Model files are loaded from the local device or downloaded as static model files. When caching is available, imported or downloaded models are stored in browser IndexedDB for the same site origin. Clearing browser site data removes the cached model.

---

## How to Use

## A. Transcribe Student Audio

### Step 1: Download a Whisper model

For most classroom speaking-review use, start with:

```text
tiny.en
```

It is the smallest and fastest English model. Downloading a model is usually a one-time step.

### Step 2: Import the Whisper model

Open **Model Bay / Setup**, then choose the downloaded `.bin` file, for example:

```text
ggml-tiny.en.bin
```

After a successful import, the browser can cache the model for later visits.

### Step 3: Choose an audio file

Use the audio deck to select a student recording. The audio preview will appear in the player.

### Step 4: Start transcription

Click `Start transcribing`.

The button state changes through the workflow:

```text
Start transcribing → Transcribing... please wait → All done
```

If something fails, the button shows `Transcription failed`.

### Step 5: Review with Transcript Playback

Use the player to listen, follow the highlighted transcript line, click a line to seek, search for words or phrases, and select text for review.

### Step 6: Copy the polish prompt

Click `Copy polish prompt`.

The app copies a spoken-English correction prompt and the cleaned transcript as one paragraph.

### Step 7: Paste into an AI assistant

Use one of the shortcut buttons, or open your preferred AI assistant manually.

Paste the copied prompt into the AI assistant and send it.

The app does not send the transcript automatically.

---

## B. Generate Practice Audio

### Step 1: Open TTS Audio

Use the top mode switch and open:

```text
tts.html
```

### Step 2: Let the TTS model prepare

On first use, the page checks browser cache. If the Kokoro model is missing, it downloads the model automatically and shows progress.

After the first successful download or import, the model is restored from browser IndexedDB on later visits.

### Step 3: Type or paste a short script

Use the script editor on the right.

Recommended length:

```text
Best: 50–200 words
Still okay: 200–300 words
Avoid: 500+ words in one clip
```

Generation time depends heavily on device speed, browser, WebGPU/WASM support, whether the model is already loaded, and script length.

### Step 4: Choose a voice

Default:

```text
US · Female
```

Available voices:

```text
US · Female
US · Male
UK · Female
UK · Male
```

### Step 5: Generate audio

Click `Generate Audio`.

After the first successful generation, the button becomes `Regenerate Audio`. If the script or voice changes, it becomes `Generate Updated Audio`.

### Step 6: Preview and download

Use the waveform player to preview the generated audio, then click `Download WAV`.

---

## Browser and Audio Format Notes

Use the latest version of Chrome or Microsoft Edge when possible.

Safari and iOS may work for some parts, but audio support, WebAssembly behavior, WebGPU support, and browser storage behavior can vary.

### Recommended transcription input formats

* MP3
* WAV
* M4A/AAC

If an audio file plays on macOS but fails in the browser, convert it to MP3 or WAV and try again:

```bash
ffmpeg -i input.m4a -ac 1 -ar 16000 output.wav
```

### TTS output format

The TTS page currently downloads generated audio as:

```text
WAV
```

MP3 export is not included in the first version to keep the tool simple and stable.

---

## Local Testing

From the project folder, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
http://localhost:8000/tts.html
```

Do not double-click `index.html` directly. Use a local server.

---

## Required Files

The repository should include:

```text
index.html
tts.html
helpers.js
main.js
libmain.js
coi-serviceworker.js
README.md

assets/
└── fonts/
    └── ark-pixel/
        ├── OFL.txt
        ├── ark-pixel-10px-monospaced-latin.otf.woff2
        └── ark-pixel-10px-monospaced-zh_cn.otf.woff2

tts/
├── speakdeck-tts.js
├── model-cache-manager.js
├── waveform-player.js
└── dist/
    └── lib/
        ├── kokoro-bundle.es.js
        └── kokoro-bundle.umd.js
```

Do **not** commit student audio files, generated audio files, Whisper model `.bin` files, or large Kokoro `.onnx` model files.

Recommended `.gitignore`:

```gitignore
# Whisper / local model files
*.bin
*.gguf
*.onnx

# Student audio / generated media
*.mp3
*.wav
*.m4a
*.aac
*.flac
*.mp4
*.mov

# macOS
.DS_Store

# Local temp files
*.log
.tmp/
```

---

## Development Notes

This project is static and frontend-only:

* HTML
* CSS
* vanilla JavaScript
* Whisper.cpp WebAssembly
* Kokoro browser TTS runtime
* IndexedDB browser caching
* GitHub Pages

Usually safe to edit:

* `index.html`
* `tts.html`
* `tts/speakdeck-tts.js`
* `README.md`

Edit carefully:

* `helpers.js`
* `tts/model-cache-manager.js`
* `tts/waveform-player.js`

Avoid editing unless necessary:

* `main.js`
* `libmain.js`
* `coi-serviceworker.js`
* `tts/dist/lib/kokoro-bundle.es.js`
* `tts/dist/lib/kokoro-bundle.umd.js`

These are runtime / library files and are easier to break accidentally.

### TTS voice maintenance

To change TTS voices later, edit the voice list in:

```text
tts/speakdeck-tts.js
```

Current voice config:

```js
const VOICE_OPTIONS = [
  { id: 'af_bella', label: 'US · Female' },
  { id: 'am_michael', label: 'US · Male' },
  { id: 'bf_emma', label: 'UK · Female' },
  { id: 'bm_fable', label: 'UK · Male' },
];
```

The first item is the default voice.

### TTS model hosting note

The TTS app should not require the full TTS.rocks repository. For this SpeakDeck version, keep only the Kokoro runtime files needed by the page.

The large ONNX model should be downloaded once by the browser and cached in IndexedDB, or imported manually as a fallback. Avoid committing large model files to GitHub.

### Font note

Ark Pixel gives the UI a stronger retro Chinese style. If a Chinese character is not included in the font, the browser will fall back to the next Chinese font in the CSS stack. That is expected behavior.

---

## Latest Updates

### 2026-07-02 Update: TTS Page Ready to Publish

This update adds and polishes the new **TTS Audio** page.

Changes:

* Added `tts.html` as a separate TTS page while keeping `index.html` as the transcription page.
* Added a top mode switch linking **Transcribe** and **TTS Audio**.
* Unified the banner copy:

  ```text
  Mr.Mou English Lab
  SpeakDeck
  英语口语工具箱 · 本地转写 · 音频合成 · 听读回放
  ```

* Added self-hosted Ark Pixel font files for Chinese UI text.
* Added Kokoro-based browser TTS generation.
* Switched first-time TTS model download to ModelScope for better mainland China access.
* Added browser IndexedDB caching for the TTS model.
* Added manual fallback model tools in a collapsed drawer.
* Added four curated voices:
  * `af_bella` — US · Female
  * `am_michael` — US · Male
  * `bf_emma` — UK · Female
  * `bm_fable` — UK · Male
* Set **US · Female** as the default voice.
* Reordered voice buttons into a clearer Female / Male layout.
* Added a large script editor with word and character count.
* Added a script-length tip for faster generation.
* Added waveform preview for generated audio.
* Added WAV download.
* Moved `Clear TTS Cache` into the model tools drawer.
* Cleaned up the TTS console so daily controls are visible and technical setup is hidden.

Bug fixes and interaction polish:

* Fixed generate button state flow:

  ```text
  Generate Audio → Generating audio... → Regenerate Audio
  ```

* Added `Generate Updated Audio` when script text or voice changes after generation.
* Added generated-audio keyboard shortcuts.
* Changed normal arrow-key skip from 5 seconds to 3 seconds.
* Fixed the Space play/pause bug that restarted generated audio instead of resuming.
* Prevented keyboard shortcuts from interfering while typing in the script editor.
* Enlarged the waveform preview area.
* Hid unnecessary speed / loop waveform controls for a cleaner v1 UI.

### 2026-07-01 Update: First Working TTS Prototype

This update proved the TTS feature is practical inside SpeakDeck.

Changes:

* Built the first working `tts.html` page.
* Added `tts/speakdeck-tts.js`.
* Added `tts/model-cache-manager.js`.
* Added `tts/waveform-player.js`.
* Confirmed the flow works:

  ```text
  Type text → choose voice → generate audio → preview waveform → download WAV
  ```

* Confirmed Kokoro + ModelScope download + browser cache + generated WAV path works in the browser.

### 2026-06-23 Update: SpeakDeck Product Rename

The project banner was renamed from **Whisper Transcriber** to **SpeakDeck** under **Mr.Mou English Lab**.

The new name better matches the cassette-deck interface and leaves room for future speaking-practice features beyond transcription.

Original banner text:

```text
Mr.Mou English Lab
SpeakDeck
本地转写 · 听读回放 · AI 口语润色
```

### 2026-06-23 Update: Final Retro UI Polish

This update added the final visual polish before publishing the transcription page:

* Spinning cassette reels while audio is playing.
* A lower, non-overlapping **INPUT LEVEL** LED meter.
* A fake CSS-based LED animation while audio is playing.
* A custom retro speaker/mute icon that matches the transport buttons.
* Lightweight stylized AI shortcut icons with no external image assets.
* ChatGPT added as the eighth AI shortcut button for a balanced 2 × 4 layout.

### 2026-06-23 Update: Retro Audio Workstation UI

This update redesigned the transcription page into a playback-first audio/transcript workstation.

Changes:

* Reorganized the page around a two-column desktop layout: audio controls on the left, transcript playback on the right.
* Added a retro tape-deck style audio panel with custom playback controls, time display, and seek bar.
* Made **Transcript Playback** visible much earlier and styled it like a clean classroom worksheet.
* Moved **Copy polish prompt** and AI chatbot shortcuts into the main audio workflow.
* Converted model setup and debug output into secondary collapsible drawers.
* Kept the project static and frontend-only: HTML, CSS, and vanilla JavaScript.

### 2026-06-22 Update: Transcript Playback Keyboard Shortcuts

This update added keyboard shortcuts for faster transcript review:

| Key | Action |
| --- | --- |
| `Space` | Play / pause the selected audio |
| `←` | Jump to the previous transcript line |
| `→` | Jump to the next transcript line |

The shortcuts are ignored while typing in the search box or using other interactive controls.

### 2026-06-20 Update: AI Polish Prompt and Chatbot Shortcuts

This update refined the transcript footer for classroom feedback:

* Replaced the visible `Download text file` button with `Copy polish prompt`.
* Copies a fixed spoken-English correction prompt together with the cleaned transcript.
* Formats the transcript as one clean paragraph without timestamps or debug logs.
* Adds shortcut links to common AI chatbot websites.
* Keeps the workflow frontend-only: no API, no backend, and no automatic transcript sending.

### 2026-06-13 Update: Transcript Playback and Cached Model Restore

This update added the transcript playback workflow: audio player, synchronized timestamped lines, search, click-to-seek, selectable text, collapsible debug terminal, model caching in IndexedDB, and clearer transcription button states.

### 2026-06-08 Update: Independent Project and Pixel UI

The tool was separated into its own project and given a pixel/RPG-style interface. Model loading changed to manual local `.bin` import, mainland China-friendly model links were added, and the page focused on uploaded student audio with preview and clean transcript copying.

### 2025-08-14 Earlier Version

The earlier version introduced local browser transcription with Whisper.cpp WebAssembly, browser model caching, audio upload, and limited mobile support. Audio format support has always depended on the browser decoder.

---

## Known Notes Before Publishing

* The TTS model download depends on ModelScope on first use. If ModelScope is unavailable, use the manual model import fallback.
* Browser cache / IndexedDB can be cleared by users or evicted by the browser. If that happens, models need to be downloaded or imported again.
* Google Fonts may be slow or blocked in some environments. Ark Pixel is self-hosted, but the English `VT323` font may still fall back if Google Fonts fails.
* If the logo path is missing, either add the logo file or remove the logo `<img>` tag from both pages.
* Keep generated audio clips short. Very long scripts can make local browser TTS feel slow.

---

## Future Ideas

Possible future features:

* Pronunciation-risk highlighting.
* Teacher-friendly export format.
* Multiple prompt modes for different feedback styles.
* Class activity templates.
* Optional speaking report generation.
* Optional local/self-hosted TTS model import instructions for users who cannot access ModelScope.
* Optional MP3 export if WAV file size becomes a problem.
* Better waveform scrubbing if students need drag-to-seek.

These should be added carefully, one feature at a time, to avoid breaking the stable transcription and TTS workflows.
