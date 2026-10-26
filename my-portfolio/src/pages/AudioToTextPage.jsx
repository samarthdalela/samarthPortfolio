import ToolPage from './ToolPage'
import AudioToText from '../components/AudioToText'
import { AUDIO_TO_TEXT_URL, audioFaqs, audioFeatures, audioSteps } from '../data/audioToText'
import { moreTools } from '../data/landings'

function AudioToTextPage() {
  return (
    <ToolPage
      name="Audio to Text Converter"
      url={AUDIO_TO_TEXT_URL}
      summary="Transcribe audio and video to text online, free. Upload an MP3, WAV, M4A, WhatsApp voice note or MP4 — or record your voice — and get an editable transcript with timestamps in English, Hindi and 25+ languages. Powered by Whisper AI, running on your device: no sign-up, no limits, nothing uploaded."
      price="₹1000/month"
      badges={['No sign-up', 'No minute limits', 'Hindi & 25+ languages', 'Private — runs on your device']}
      tool={<AudioToText />}
      steps={audioSteps}
      howToTitle="How to convert audio to text in 4 steps"
      featuresTitle="Everything you need to turn speech into text"
      featuresSub="For interviews, lectures, meetings, podcasts, YouTube videos, voice notes and subtitles."
      features={audioFeatures}
      featureIcon="mic"
      faqTitle="Audio to text — frequently asked questions"
      faqs={audioFaqs}
      related={{
        href: 'https://whispersnotes.netlify.app/',
        text: 'Transcribing a meeting? Get the summary, action items and Minutes of Meeting (MoM) with WisperNotes — free',
      }}
      more={moreTools('/audio-to-text/')}
      app={{
        category: 'MultimediaApplication',
        description:
          'Free online audio to text converter and transcription tool. Transcribes MP3, WAV, M4A, OGG, WebM and MP4 recordings or microphone input to editable text with timestamps in English, Hindi and 25+ languages using the Whisper AI model in the browser. Exports TXT, DOCX, SRT and VTT. No upload, no sign-up.',
        featureList: audioFeatures.map((f) => f.title).join(', '),
      }}
    />
  )
}

export default AudioToTextPage
