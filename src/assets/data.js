export const dummySongs = [
  {
    id: "1",
    title: "10,000 Reasons (Bless the Lord)",
    composer: "Matt Redman",
    coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=400",
    recordings: [
      {
        id: "r1",
        title: "Sunday Service Live",
        singer: "Youth Band",
        key: "G Major",
        notes: "Slightly faster tempo for the chorus.",
        isFinal: true,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Sample audio
      },
      {
        id: "r2",
        title: "Acoustic Practice",
        singer: "Sarah M.",
        key: "G Major",
        notes: "Just acoustic guitar and vocals.",
        isFinal: false,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
      }
    ]
  },
  {
    id: "2",
    title: "How Great Thou Art",
    composer: "Carl Boberg",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400",
    recordings: []
  }
];