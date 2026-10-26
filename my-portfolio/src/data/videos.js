// Video lectures shown on /videos/. To add a lecture, add an entry at the top of `videos`:
// `id` is the part after "embed/" in the YouTube embed link, e.g. youtube.com/embed/<id>.
// For a playlist, also set `playlist` to the part after "list=" in its link; the player then plays the whole series.
export const VIDEOS_URL = 'https://samarthdalela.xyz/videos/'
export const CHANNEL_URL = 'https://www.youtube.com/@samarthdalela7473'

export const videos = [
  {
    id: '7kaghMtrX3s',
    playlist: 'PLIlnuxo6sjrI',
    title: 'useEffect Hook in React Explained | Side Effects & Dependency Array (Beginner Friendly)',
    topic: 'React',
    duration: 'PT3M37S',
    length: '3:37',
    uploadDate: '2026-10-26T10:55:04-07:00',
    description:
      'What useEffect is, what “side effects” mean in React, and how the dependency array decides when your effect runs — on every render, only once, or when a value changes. Explained step by step for beginners.',
    points: [
      'What a side effect is and why React needs useEffect',
      'Running an effect after every render, once on mount, or when a value changes',
      'How the dependency array works ([], [value] or no array)',
      'Cleanup functions — stopping timers and listeners',
    ],
  },
  {
    id: 'pWyinLaCWk4',
    playlist: 'PLRtl95Yb142bGvS4lVGIEMWVYBo3LTZda',
    title: 'Blender Absolute Basics — Introduction Series for Beginners',
    topic: 'Blender',
    duration: 'PT23M38S',
    length: '23:38',
    uploadDate: '2021-05-22T22:00:09-07:00',
    description:
      'A beginner series on Blender fundamentals: start from zero and get comfortable with the interface, moving around the 3D viewport and working with objects, one step at a time.',
    points: [
      'Getting around the Blender interface',
      'Navigating the 3D viewport',
      'Adding, moving, rotating and scaling objects',
      'The fundamentals you need before modelling and animation',
    ],
  },
  {
    id: '7ajl3FVjnyM',
    playlist: 'PLRtl95Yb142Z3KO9REIP7s31A8VOmS50q',
    title: 'Adobe Animate — 2D Character Tracing & Animation Series',
    topic: 'Adobe Animate',
    duration: 'PT29M55S',
    length: '29:55',
    uploadDate: '2020-10-14T02:30:01-07:00',
    description:
      'Learn 2D animation in Adobe Animate, starting with how to trace a character from an image — clean outlines you can colour and bring to life in the later parts of the series.',
    points: [
      'Importing a reference image and setting up layers',
      'Tracing a 2D character with clean lines',
      'Preparing the character for colouring and animation',
      'Building on it part by part through the series',
    ],
  },
  {
    id: 'Y693Si5dmq8',
    playlist: 'PLRtl95Yb142brbQfdm7iN-Ri9Un3lEBXp',
    title: 'Adobe Audition — Noise Reduction, Normalization, Amplifier & Compressor',
    topic: 'Adobe Audition',
    duration: 'PT8M24S',
    length: '8:24',
    uploadDate: '2020-09-23T02:30:12-07:00',
    description:
      'Make your voice recordings sound clean and professional in Adobe Audition: remove background noise, even out the volume and add punch with the amplifier and compressor.',
    points: [
      'Removing background noise with noise reduction',
      'Normalizing audio to a consistent level',
      'Boosting quiet recordings with the amplifier',
      'Using the compressor for a clear, even voice',
    ],
  },
]

export const videoFaqs = [
  {
    q: 'Are these video lectures free?',
    a: 'Yes. Every lecture is free to watch on this page and on my YouTube channel — no sign-up, no paid course.',
  },
  {
    q: 'Who are these lectures for?',
    a: 'Beginners and students learning web development (React and JavaScript), 3D with Blender, 2D animation with Adobe Animate or audio editing with Adobe Audition, who want each idea explained simply, step by step, in plain language.',
  },
  {
    q: 'How often are new videos added?',
    a: 'New lectures are added regularly. Subscribe to the YouTube channel to get notified when the next concept is explained.',
  },
  {
    q: 'Can I request a topic?',
    a: 'Yes — email me the concept you are stuck on and I may explain it in the next video.',
  },
]
