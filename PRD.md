# Planning Guide

A retro terminal-style clicker game where users earn "Poop Points" by clicking the poop emoji, styled as a nostalgic command-line interface.

**Experience Qualities**: 
1. **Nostalgic** - Evokes the feeling of classic terminal interfaces and retro computing
2. **Focused** - Single-purpose interaction with clear visual feedback in monospace style
3. **Satisfying** - Immediate tactile feedback with terminal-style animations and text effects

**Complexity Level**: Micro Tool (single-purpose application)
A focused clicker game with a single core mechanic styled as a terminal interface. The terminal aesthetic creates a unique, memorable experience that stands apart from typical clicker games.

## Essential Features

### Click-to-Earn Mechanism
- **Functionality**: Users click/tap the poop emoji to increment their score, displayed as terminal output
- **Purpose**: Core engagement mechanic wrapped in nostalgic terminal aesthetic
- **Trigger**: User clicks or taps on the poop emoji
- **Progression**: Click poop → Score increments → Terminal feedback appears → Points animate upward
- **Success criteria**: Each click increments score by 1, updates persist between sessions, terminal-style feedback confirms action

### Terminal Display
- **Functionality**: Score and status displayed as terminal output with monospace fonts and scan lines
- **Purpose**: Creates immersive retro computing aesthetic
- **Trigger**: App loads and updates on each interaction
- **Progression**: App initializes → Terminal prompt appears → Score displayed as system output → Updates log in terminal style
- **Success criteria**: Text appears in monospace font, scan line effect visible, color scheme matches CRT monitors

### Milestone Achievements
- **Functionality**: Badge appears at score milestones (100, 500, 1000+) displayed as terminal alerts
- **Purpose**: Rewards progression and encourages continued engagement
- **Trigger**: Score reaches milestone threshold
- **Progression**: Score hits milestone → Terminal alert appears → Badge displays with ASCII art or symbols
- **Success criteria**: Milestones trigger at correct values, badges persist while score remains above threshold

## Edge Case Handling
- **Rapid Clicking**: All clicks register immediately, animations queue smoothly without blocking
- **Large Numbers**: Format scores over 1000 with commas in terminal style (1,234)
- **First Load**: Initialize score at 0 with welcome terminal message
- **Data Persistence**: Score auto-saves using useKV, displays "DATA SAVED" terminal message

## Design Direction

The design should evoke the nostalgia of classic terminal interfaces - CRT monitors with green phosphor text, scan lines, and the satisfying chunky aesthetic of early computing. Think DOS prompts, Unix terminals, and retro hacker aesthetics. The experience should feel like you're interacting with a playful system from the golden age of computing.

## Color Selection

Terminal green-on-black color scheme inspired by classic CRT monitors and phosphor displays.

- **Primary Color**: Terminal Green `oklch(0.75 0.20 145)` - Bright phosphor green for main text and interactive elements
- **Secondary Colors**: 
  - Dark Terminal Background `oklch(0.12 0.02 180)` - Near-black with subtle green tint
  - Dim Terminal Green `oklch(0.45 0.12 145)` - Muted green for secondary text
- **Accent Color**: Bright Cyan `oklch(0.80 0.15 200)` - Electric blue-cyan for highlights and focus states
- **Foreground/Background Pairings**: 
  - Primary Text (Bright Green `oklch(0.75 0.20 145)`): On Dark Background `oklch(0.12 0.02 180)` - Ratio 9.2:1 ✓
  - Accent (Cyan `oklch(0.80 0.15 200)`): On Dark Background `oklch(0.12 0.02 180)` - Ratio 10.5:1 ✓
  - Muted Text (Dim Green `oklch(0.45 0.12 145)`): On Dark Background `oklch(0.12 0.02 180)` - Ratio 4.8:1 ✓

## Font Selection

Monospace fonts exclusively to maintain terminal authenticity with technical precision and retro character.

- **Primary Font**: JetBrains Mono - Modern monospace with excellent readability and terminal character
- **Typographic Hierarchy**: 
  - H1 (App Title): JetBrains Mono Bold/32px/wide letter-spacing for command-line header feel
  - Score Display: JetBrains Mono Bold/56px/tabular-nums for clear numerical readout
  - Body Text: JetBrains Mono Regular/16px/normal for terminal output
  - Point Indicator (+1): JetBrains Mono Bold/24px for floating feedback

## Animations

Animations should feel like terminal output - text appearing character-by-character, scan lines moving, and subtle CRT flicker effects. All motion should enhance the retro computing aesthetic.

- **Text Appearance**: Brief flicker effect on score updates mimicking CRT refresh
- **Floating Points**: Fade up and out with slight green glow trail
- **Click Feedback**: Brief pulse with scanline distortion effect
- **Idle State**: Subtle scan line animation continuously moving down the screen
- **Cursor**: Blinking terminal cursor effect near interactive elements

## Component Selection

- **Components**: 
  - Card component styled as terminal window with border and title bar
  - Badge component styled as terminal alert boxes with ASCII borders
  - Custom poop button with terminal-style hover states
  
- **Customizations**: 
  - Terminal window frame with rounded corners and subtle shadow
  - Scan line overlay using CSS gradient animation
  - CRT screen curvature using subtle border-radius
  - Phosphor glow effect using text-shadow and box-shadow
  
- **States**: 
  - Poop Button: Default (pulsing glow), Hover (brighter glow + scale), Active (scan line flash), Focus (cyan outline)
  - Text Elements: Appear with subtle flicker, update with brief glow
  
- **Icon Selection**: 
  - 💩 emoji as main interactive element (rendered large)
  - ASCII characters for decorative elements (> prompt, [ ] brackets)
  - Simple geometric shapes for terminal UI chrome
  
- **Spacing**: 
  - Terminal padding: p-6 with consistent monospace rhythm
  - Line height: 1.5 for comfortable terminal reading
  - Gap between sections: gap-6 maintaining terminal structure
  
- **Mobile**: 
  - Single column terminal layout at all breakpoints
  - Font scales down proportionally (H1: 24px, Score: 40px on mobile)
  - Touch targets remain 44px minimum with padding
  - Terminal window fills viewport with minimal margins
