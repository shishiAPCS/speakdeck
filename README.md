# SpeakDeck

**SpeakDeck** is a browser-based English speaking practice deck powered by Whisper.cpp WebAssembly.

It combines local speech-to-text, transcript playback, cassette-style audio review, and a copy-ready AI polish prompt workflow. It is designed for classroom use, especially for English speaking practice and student recording review.

Student audio is processed locally in the browser. This webpage does **not** upload audio for transcription.

## Live Demo

After GitHub Pages is enabled for the new repository, the tool should be available at:

```text
https://shishiapcs.github.io/speakdeck/
```

## What It Does

SpeakDeck helps students and teachers move through a simple speaking-review workflow:

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

## Main Features

* **Local browser transcription**
  Whisper.cpp WebAssembly runs with a local `.bin` model inside the browser.

* **No server upload**
  Audio stays on the user's device while this webpage transcribes it.

* **Manual model import**
  Users download and choose a local Whisper model file such as `ggml-tiny.en.bin`.

* **Cached model restore**
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

* **Keyboard shortcuts**

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

## Privacy Note

SpeakDeck does not upload audio for transcription. Whisper transcription runs locally in the browser.

The `Copy polish prompt` button only copies text to the clipboard. It does not call ChatGPT, DeepSeek, Kimi, Doubao, or any other AI API.

If a user manually pastes the copied prompt into a third-party AI service, that third-party service's own privacy policy applies.

Model files are loaded from the local device. When caching is available, the imported model is stored in browser IndexedDB for the same site origin. Clearing browser site data removes the cached model.

## How to Use

### Step 1: Download a Whisper model

For most classroom speaking-review use, start with:

```text
tiny.en
```

It is the smallest and fastest English model. Downloading a model is usually a one-time step.

### Step 2: Import the model

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

## Browser and Audio Format Notes

Use the latest version of Chrome or Microsoft Edge when possible. Safari and iOS may work, but audio support depends on the browser's built-in decoder.

Recommended formats:

* MP3
* WAV
* M4A/AAC

If an audio file plays on macOS but fails in the browser, convert it to MP3 or WAV and try again:

```bash
ffmpeg -i input.m4a -ac 1 -ar 16000 output.wav
```

## Local Testing

From the project folder, run:

```bash
python3 -m http.server 8013
```

Then open:

```text
http://localhost:8013/
```

Do not double-click `index.html` directly. Use a local server.

## Required Files

The repository should include:

```text
index.html
helpers.js
main.js
libmain.js
coi-serviceworker.js
README.md
```

Do **not** commit student audio files or Whisper model `.bin` files.

Recommended `.gitignore`:

```gitignore
# Whisper models
*.bin
*.gguf

# Student audio / media
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

## Development Notes

This project is static and frontend-only:

* HTML
* CSS
* vanilla JavaScript
* Whisper.cpp WebAssembly
* GitHub Pages

No backend, build system, React, Vue, or server API is required.

Usually safe to edit:

* `index.html`
* `helpers.js`
* `README.md`

Avoid editing unless necessary:

* `main.js`
* `libmain.js`
* `coi-serviceworker.js`

These are runtime/generated files and are easy to break accidentally.

## Latest Updates

### 2026-06-23 Update: SpeakDeck Product Rename

The project banner was renamed from **Whisper Transcriber** to **SpeakDeck** under **Mr.Mou English Lab**.

The new name better matches the cassette-deck interface and leaves room for future speaking-practice features beyond transcription.

Banner text:

```text
Mr.Mou English Lab
SpeakDeck
本地转写 · 听读回放 · AI 口语润色
```

### 2026-06-23 Update: Final Retro UI Polish

This update adds the final visual polish before publishing:

* Spinning cassette reels while audio is playing.
* A lower, non-overlapping **INPUT LEVEL** LED meter.
* A fake CSS-based LED animation while audio is playing.
* A custom retro speaker/mute icon that matches the transport buttons.
* Lightweight stylized AI shortcut icons with no external image assets.
* ChatGPT added as the eighth AI shortcut button for a balanced 2 × 4 layout.

### 2026-06-23 Update: Retro Audio Workstation UI

This update redesigns the page into a playback-first audio/transcript workstation.

Changes:

* Reorganized the page around a two-column desktop layout: audio controls on the left, transcript playback on the right.
* Added a retro tape-deck style audio panel with custom playback controls, time display, and seek bar.
* Made **Transcript Playback** visible much earlier and styled it like a clean classroom worksheet.
* Moved **Copy polish prompt** and AI chatbot shortcuts into the main audio workflow.
* Converted model setup and debug output into secondary collapsible drawers.
* Kept the project static and frontend-only: HTML, CSS, and vanilla JavaScript.

### 2026-06-22 Update: Transcript Playback Keyboard Shortcuts

This update adds keyboard shortcuts for faster transcript review:

| Key | Action |
| --- | --- |
| `Space` | Play / pause the selected audio |
| `←` | Jump to the previous transcript line |
| `→` | Jump to the next transcript line |

The shortcuts are ignored while typing in the search box or using other interactive controls.

### 2026-06-20 Update: AI Polish Prompt and Chatbot Shortcuts

This update refines the transcript footer for classroom feedback:

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

## Future Ideas

Possible future features:

* Pronunciation-risk highlighting.
* Teacher-friendly export format.
* Multiple prompt modes for different feedback styles.
* Class activity templates.
* Optional speaking report generation.

These should be added carefully, one feature at a time, to avoid breaking the stable local transcription workflow.
