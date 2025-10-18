# Water Drop Catcher Game 💧

A fun web-based game inspired by charity: water's mission to provide clean water for all!

## Game Description

Help catch clean water drops while avoiding dirty ones! Your mission is to collect as much clean water as possible in 30 seconds.

## How to Play

1. **Start**: Click the "START GAME" button
2. **Move**: Use arrow keys (← →) or move your mouse to control the bucket
3. **Catch**: Position your bucket to catch the falling water drops
4. **Score**: 
   - Clean drops (blue) = +1 point 💧
   - Dirty drops (brown) = -1 point
   - Missed drops = no change
5. **Win**: Score more than 10 points to win!
6. **Replay**: Click "PLAY AGAIN!" to restart

## Game Features

- ⏱️ 30-second timer
- 🎯 Collision detection
- 📱 Responsive design (works on mobile and desktop)
- 🎨 Beautiful charity: water inspired design
- ✨ Floating score animations
- 🏆 Win/lose conditions with encouraging messages

## Controls

- **Keyboard**: Arrow keys (← →) or WASD
- **Mouse**: Move horizontally to control bucket position

## Technology Stack

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript
- Responsive design

## Inspiration

This game is inspired by charity: water's mission to provide clean, safe drinking water to people in developing countries. Every point represents the importance of clean water access!

## Running the Game

Simply open `index.html` in a web browser, or serve it through a local HTTP server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.
In this game, users collect as many falling water drops as possible. Users tap to collect drops before they hit the ground. You’ll be working from a partially built version of the game. Some functionality is already provided, and your job is to complete the rest.

## What’s Already Done

The starter files already include:

- A **heading and tagline**
- A **start button**
- A **game container** where water drops appear
- A **placeholder timer and score** (not functional yet)
- A **logo image** from charity: water
- Working code that:
  - Starts the game when the start button is clicked
  - Makes water drops fall randomly at different sizes

## What You Need to Add

Here’s what you're required to implement to bring the game to life:

### Game Functionality

- **Update the score**
  - +1 point for each drop clicked  

- **Add a 30-second timer**
  - When the timer reaches 0, the game ends  

- **Display a message when the game ends**
  - If the player scores **20 or more points**, show a **winning** message  
  - If the player scores **less than 20 points**, show a **"try again"** message  
  - Create one array of possible winning messages and one array of losing messages
  - Depending on whether the user wins or loses, randomly pick and display a message from the appropriate array

### Visual Styling

- **Add charity: water branding**
  
  - Use the provided logo  
  - Use the [charity: water brand guidelines](https://drive.google.com/file/d/1ct4zYRIwHAtxoNQoeaVwWYPdnruSC6sr/view) to stay on-brand with colors and styling
  - Add styling rules to ensure your game layout adjusts well across different screen sizes


These are the minimum requirements, but if you'd like an additional challenge go ahead and give the LevelUps a shot! For example, you can set up logic to make some of the drops "bad" drops that remove points if the user click them, complete with a different color to distinguish them from "good" drops. Have fun and make the game your own!

If you have any questions or need any assistance with your code, reach out to the HelpHub or attend a Drop-In Hour. You got this!!
