# Planning Guide

A playful clicker game where users earn "Poop Points" by clicking on a poop emoji, gamifying the concept of "Proof of Operational Poop" with persistent scoring and satisfying feedback.

**Experience Qualities**: 
1. **Playful** - The app embraces humor with whimsical animations and rewarding interactions that make clicking fun
2. **Satisfying** - Each click provides immediate tactile feedback through animations, sounds, and visual celebrations
3. **Addictive** - Progressive point accumulation and visual feedback create a compelling reason to keep clicking

**Complexity Level**: Micro Tool (single-purpose application)
This is a focused clicker game with a single core mechanic - clicking to earn points - making it perfect as a micro tool with persistent state.

## Essential Features

### Click-to-Earn Mechanism
- **Functionality**: Users click/tap the poop emoji to increment their score
- **Purpose**: Core engagement mechanic that rewards interaction
- **Trigger**: User clicks or taps on the poop emoji
- **Progression**: User sees poop → Clicks poop → Poop animates → Score increments → Visual feedback displays → Ready for next click
- **Success criteria**: Score persists between sessions, click detection is instant, animations feel responsive

### Persistent Score Tracking
- **Functionality**: Score is saved automatically and persists across sessions
- **Purpose**: Creates long-term engagement and sense of progress
- **Trigger**: Automatically saves after each click
- **Progression**: Score changes → Auto-saved to persistent storage → Loads automatically on next visit
- **Success criteria**: Score never resets unless user explicitly clears it, data survives page refreshes

### Click Feedback System
- **Functionality**: Visual and motion feedback for each successful click
- **Purpose**: Makes clicking feel satisfying and responsive
- **Trigger**: Every click on the poop
- **Progression**: Click detected → Poop scales/bounces → "+1" floats up → Animation completes → Ready for next interaction
- **Success criteria**: Feedback is instant (<100ms), animations don't block subsequent clicks

## Edge Case Handling
- **Rapid Clicking**: Debounce animations but allow score to increment freely to reward enthusiastic clicking
- **First Visit**: Show score starting at 0 with clear indication that clicking earns points
- **Large Numbers**: Format scores over 1000 with commas for readability (1,234)
- **Mobile vs Desktop**: Touch targets are generous (minimum 100px) and work equally well on both

## Design Direction
The design should feel fun, slightly absurd, and celebratory. Think arcade game meets internet meme - bold, high-contrast, with punchy colors that pop. The poop should feel like a proud protagonist, not gross. Interactions should feel bouncy and alive, like you're interacting with a character rather than a static button.

## Color Selection
A bold, playful palette inspired by arcade games and modern app design with high contrast and energy.

- **Primary Color**: Deep brown `oklch(0.35 0.08 60)` - Represents the poop itself, warm and rich without being muddy
- **Secondary Colors**: 
  - Vibrant purple `oklch(0.55 0.25 300)` for background depth and mystery
  - Electric cyan `oklch(0.75 0.15 210)` for highlights and accents
- **Accent Color**: Bright yellow-orange `oklch(0.80 0.18 75)` - High-energy color for score displays, CTAs, and celebration effects
- **Foreground/Background Pairings**: 
  - Background (Deep Purple `oklch(0.20 0.15 300)`): Yellow-Orange text `oklch(0.90 0.12 75)` - Ratio 11.2:1 ✓
  - Accent (Yellow-Orange `oklch(0.80 0.18 75)`): Deep Purple text `oklch(0.20 0.15 300)` - Ratio 9.8:1 ✓
  - Primary Brown `oklch(0.35 0.08 60)`: White text `oklch(1 0 0)` - Ratio 8.5:1 ✓

## Font Selection
Fonts should feel bold, rounded, and playful - like a modern arcade game with personality.

- **Primary Font**: Fredoka (from Google Fonts) - A rounded, friendly sans-serif that feels approachable and fun
- **Secondary Font**: Space Grotesk (from Google Fonts) - A technical but playful font for the score counter that adds digital credibility

- **Typographic Hierarchy**: 
  - H1 (App Title): Fredoka Bold/48px/tight letter-spacing for maximum playful impact
  - Score Display: Space Grotesk Bold/64px/tabular numbers for clear readability and digital feel
  - Point Indicator (+1): Fredoka Medium/32px/wide letter-spacing for floating feedback
  - Subtitle: Fredoka Regular/18px/normal tracking for secondary information

## Animations
Animations should be bouncy and satisfying, making each click feel rewarding. Use spring physics for the poop bounce, smooth scale transitions on hover, and floating "+1" indicators that fade up and away. Celebration effects trigger at milestones (100, 500, 1000 points) with confetti or particle bursts. Keep interactions under 300ms so they feel snappy but not rushed.

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
