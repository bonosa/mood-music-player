export const GENRES = {
    pop: "Pop",
    rock: "Rock",
    classical: "Classical",
    jazz: "Jazz",
    electronic: "Electronic",
    hiphop: "Hip Hop",
    indie: "Indie",
    metal: "Metal"
  };
  
  export const MOODS = {
    happiness: {
      description: "Your facial expressions show signs of joy and contentment. We detected raised cheeks, crinkled eyes, and an upward curved smile - all classic indicators of happiness!",
      songsByGenre: {
        pop: [
          {
            name: "Happy - Pharrell Williams",
            reason: "Upbeat tempo and positive lyrics to maintain your great mood",
            previewUrl: "https://p.scdn.co/mp3-preview/6b00000be293f6b75b7e632760ab6949e5ba9a08",
            fullSongUrl: "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH",
            youtubeUrl: "https://www.youtube.com/watch?v=ZbZSe6N_BXs"
          }
        ]
        // ... other genres
      },
      gradient: "from-yellow-500/20 to-orange-500/20"
    },
    // ... other moods
  };