# Planning Guide

**Experience Qualities**: 

**Experience Qualities**: 
This is a focused clicker game with a single core mechanic - clicking to earn points - making it perfect as a micro
## Essential Features
### Click-to-Earn Mechanism

**Complexity Level**: Micro Tool (single-purpose application)
This is a focused clicker game with a single core mechanic - clicking to earn points - making it perfect as a micro tool with persistent state.

## Essential Features

### Click-to-Earn Mechanism
- **Functionality**: Users click/tap the poop emoji to increment their score
- **Purpose**: Core engagement mechanic that rewards interaction
- **Trigger**: User clicks or taps on the poop emoji
- **Rapid Clicking**: Debounce animations but allow score to increment freely to reward enthusiastic clicking
- **Large Numbers**: Format scores over 1000 with commas for readability (1,234)

The design should feel fun, s
## Color Selection

- **Secondary Colors**: 
  - Electric cyan `oklch(0.75 0.15 210)` for highlights and accents
- **Foreground/Background Pairings**: 


Fonts should feel bold, rounded, and playful - like a modern arcade game 
- **Primary Font**: Fredoka (from Google Fonts) - A rounded,

  - H1 (App Title): Fredoka Bold/48px/tight letter-spacing for maximum playful impact
  - Point Indicator (+1): Fredoka Medium/32px/wide letter-spacing for floating feedback

Animations should be 
- **Rapid Clicking**: Debounce animations but allow score to increment freely to reward enthusiastic clicking
  - Custom clickable poop component (not a standard button) using framer-motion for spring a
- **Large Numbers**: Format scores over 1000 with commas for readability (1,234)
- **Customizations**: 

  
  - Poop: Default (subtle pulse), Hover (scale 1.05), Active (scale 0.95 + rotate), Celebration (bounce + glow)

## Color Selection
  - Trophy icon from Phosphor for milestone badges

  - Poop to score: gap-12 for clear visual separation
- **Secondary Colors**: 
  - Single column layout at all breakpoints
  - Electric cyan `oklch(0.75 0.15 210)` for highlights and accents

- **Foreground/Background Pairings**: 











  - H1 (App Title): Fredoka Bold/48px/tight letter-spacing for maximum playful impact

  - Point Indicator (+1): Fredoka Medium/32px/wide letter-spacing for floating feedback





## Component Selection
- **Components**: 
  - Custom clickable poop component (not a standard button) using framer-motion for spring animations
  - Card component from Shadcn for score display with subtle shadow and rounded corners
  - Badge component for milestone achievements
  
- **Customizations**: 
  - Large circular poop button (200px) with custom hover/active states
  - Floating point indicators using framer-motion's AnimatePresence
  - Gradient background using CSS with layered radial gradients for depth
  
- **States**: 
  - Poop: Default (subtle pulse), Hover (scale 1.05), Active (scale 0.95 + rotate), Celebration (bounce + glow)
  - Score display: Static until update, then brief highlight flash
  
- **Icon Selection**: 
  - Use the provided poop image as the main interactive element
  - Fallback to 💩 emoji if image fails to load
  - Trophy icon from Phosphor for milestone badges
  
- **Spacing**: 
  - Main container: p-8 for breathing room
  - Poop to score: gap-12 for clear visual separation
  - Score card: p-6 with rounded-2xl for soft edges
  
- **Mobile**: 
  - Single column layout at all breakpoints
  - Poop scales down slightly on mobile (150px) but remains prominent
  - Score counter fixed to top of viewport on scroll
  - Touch feedback with haptic-style bounce on tap
