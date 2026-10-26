// Content for the Audio to Text page — used for the visible page and its structured data.
// Plain JS (no JSX): landings.js imports the shared lists at build time.

export const AUDIO_TO_TEXT_URL = 'https://samarthdalela.xyz/audio-to-text/'

// Whisper models (onnx-community/<id> on Hugging Face). Sizes are the 8-bit files, downloaded once and cached.
export const models = [
  { id: 'whisper-tiny', label: 'Fast — quick results (≈40 MB download)' },
  { id: 'whisper-base', label: 'Balanced — recommended (≈75 MB download)' },
  { id: 'whisper-small', label: 'Most accurate — best for Hindi & accents (≈240 MB)' },
]

// Whisper language codes; '' lets the model detect the language itself.
export const languages = [
  ['', 'Detect automatically'],
  ['en', 'English'],
  ['hi', 'Hindi (हिन्दी)'],
  ['bn', 'Bengali (বাংলা)'],
  ['mr', 'Marathi (मराठी)'],
  ['gu', 'Gujarati (ગુજરાતી)'],
  ['pa', 'Punjabi (ਪੰਜਾਬੀ)'],
  ['ta', 'Tamil (தமிழ்)'],
  ['te', 'Telugu (తెలుగు)'],
  ['kn', 'Kannada (ಕನ್ನಡ)'],
  ['ml', 'Malayalam (മലയാളം)'],
  ['ur', 'Urdu (اردو)'],
  ['ne', 'Nepali (नेपाली)'],
  ['ar', 'Arabic'],
  ['zh', 'Chinese'],
  ['nl', 'Dutch'],
  ['fr', 'French'],
  ['de', 'German'],
  ['id', 'Indonesian'],
  ['it', 'Italian'],
  ['ja', 'Japanese'],
  ['ko', 'Korean'],
  ['pt', 'Portuguese'],
  ['ru', 'Russian'],
  ['es', 'Spanish'],
  ['tr', 'Turkish'],
  ['vi', 'Vietnamese'],
]

export const audioSteps = [
  {
    name: 'Add your recording',
    text: 'Drop an audio or video file (MP3, WAV, M4A, OGG, WebM, MP4…) or press Record to speak into your microphone.',
  },
  {
    name: 'Pick language and accuracy',
    text: 'Leave the language on “Detect automatically” or choose it, and pick Fast, Balanced or Most accurate.',
  },
  {
    name: 'Transcribe',
    text: 'Press Transcribe. The text appears piece by piece with timestamps while your device listens to the recording.',
  },
  {
    name: 'Edit and download',
    text: 'Fix any word right in the transcript, then copy it or download TXT, Word (DOCX), SRT or VTT subtitles.',
  },
]

// Shared by the main page and the audio landing pages.
export const audioShared = [
  { title: '100% private — nothing uploaded', text: 'The speech recognition runs on your own device. Your recording never leaves your phone or computer — safe for interviews, meetings and voice notes.' },
  { title: 'Free, no sign-up, no limits', text: 'No account, no minutes-per-month cap, no watermark and no paid plan. Transcribe as many recordings as you like.' },
  { title: 'Works on phone and computer', text: 'Use it in Chrome, Edge, Firefox or Safari on Windows, Mac, Android or iPhone — no app or software to install.' },
]

export const audioFeatures = [
  { title: 'Audio and video to text', text: 'MP3, WAV, M4A, AAC, OGG, OPUS, FLAC, WebM and MP4 — including WhatsApp voice notes and phone recordings.' },
  { title: 'Record from your microphone', text: 'No file? Press Record, speak, and turn your voice into text in one click.' },
  { title: '25+ languages incl. Hindi', text: 'English, Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati, Urdu, Spanish, French and more — or let it detect the language.' },
  { title: 'Translate to English', text: 'Speak or record in Hindi or another language and get the transcript translated into English text.' },
  { title: 'Timestamps & subtitles', text: 'Every line is timestamped. Download SRT or VTT subtitle files for YouTube, Premiere Pro, CapCut or VLC.' },
  { title: 'Edit, copy or download', text: 'Correct words in place, then copy the text or download TXT or a Word document (DOCX).' },
  { title: 'Powered by Whisper AI', text: 'Uses OpenAI’s open-source Whisper speech recognition model — the same technology behind many paid apps.' },
  ...audioShared,
]

export const audioFaqs = [
  {
    q: 'How do I convert audio to text for free?',
    a: 'Add your audio or video file in the box above (or press Record), choose the language and press Transcribe. When it finishes, copy the text or download it as TXT, Word, SRT or VTT. It is free with no sign-up.',
  },
  {
    q: 'Is my recording uploaded to a server?',
    a: 'No. The speech recognition model runs inside your browser, on your own device. Only the model itself is downloaded (once); your audio is never sent anywhere.',
  },
  {
    q: 'Which file formats are supported?',
    a: 'Any audio or video your browser can play: MP3, WAV, M4A, AAC, OGG, OPUS, FLAC, WebM and MP4 — including WhatsApp voice notes (.opus/.ogg) and iPhone voice memos (.m4a).',
  },
  {
    q: 'Can it transcribe Hindi audio to text?',
    a: 'Yes. Choose Hindi as the language and the “Most accurate” option for the best results; the text is written in Devanagari. It also supports Bengali, Marathi, Tamil, Telugu, Gujarati, Punjabi, Urdu and more.',
  },
  {
    q: 'Can I translate Hindi speech into English text?',
    a: 'Yes. Set “Output” to “Translate to English” and the recording is transcribed straight into English text.',
  },
  {
    q: 'How accurate is the transcription?',
    a: 'It uses OpenAI’s Whisper model, which is very good with clear speech. “Most accurate” handles accents, Indian languages and background noise best; “Fast” is quicker but makes more mistakes. You can correct any word before downloading.',
  },
  {
    q: 'Why does the first transcription take longer?',
    a: 'The first time, your browser downloads the speech model (about 40–240 MB depending on the option). It is then saved on your device, so the next transcriptions start much faster.',
  },
  {
    q: 'How long can the recording be?',
    a: 'There is no fixed limit. Recordings of up to about an hour work well on most computers; longer files need more memory and time. On phones, shorter recordings are faster.',
  },
  {
    q: 'Can I make subtitles for a YouTube video?',
    a: 'Yes. Add the video file, transcribe it and download the SRT or VTT file. Upload it in YouTube Studio under Subtitles, or import it into Premiere Pro, CapCut, DaVinci Resolve or VLC.',
  },
  {
    q: 'Can I transcribe a Zoom, Google Meet or Teams meeting?',
    a: 'Yes. Add the meeting recording (MP4 or M4A) and press Transcribe to text. Timestamps make it easy to find who said what; for long meetings use a computer.',
  },
  {
    q: 'Can I convert a phone call recording to text?',
    a: 'Yes. Call recordings from Android and iPhone (MP3, M4A, AMR or WAV) can be added directly. Clear audio gives the best results.',
  },
  {
    q: 'Does it add punctuation automatically?',
    a: 'Yes. Whisper adds full stops, commas, question marks and capital letters for you, so the text is ready to read.',
  },
  {
    q: 'How do I convert audio to text in Microsoft Word?',
    a: 'Transcribe the recording here, then press Word to download a .docx file. It opens in Microsoft Word, Google Docs and WPS Office, with or without timestamps.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes, on Android and iPhone. For long recordings a computer is faster, because the speech recognition runs on your device.',
  },
]
