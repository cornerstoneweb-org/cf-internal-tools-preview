---
name: Cornerstone Staff Hub
description: One calm, well-signed place for Cornerstone staff to find what they need.
colors:
  cornerstone-teal: "#0693B2"
  deep-teal: "#04758F"
  teal-wash: "#E7F4F8"
  harvest-orange: "#FE8730"
  harvest-orange-deep: "#B65B0D"
  harvest-orange-wash: "#FFF1E4"
  spring-lime: "#CDD943"
  spring-lime-deep: "#6B7409"
  spring-lime-wash: "#F5F8DF"
  sky-cyan: "#32B9DB"
  cerulean: "#07AED9"
  jungle-night: "#16211C"
  lobby-grey: "#F5F5F7"
  card-white: "#FFFFFF"
  hairline: "#E8E8ED"
  hairline-strong: "#D2D2D7"
  ink: "#1D1D1F"
  slate: "#515760"
  faint: "#6E6E73"
typography:
  display:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.5rem, 6.4vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.1rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"cv11\", \"ss01\""
  label:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  r: "12px"
  r-lg: "20px"
  r-xl: "28px"
  pill: "999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "16px"
  space-4: "24px"
  space-5: "40px"
  space-6: "64px"
components:
  button-primary:
    backgroundColor: "{colors.deep-teal}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  button-primary-hover:
    backgroundColor: "#035F74"
    textColor: "{colors.card-white}"
  button-ghost:
    backgroundColor: "rgba(0,0,0,.05)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "11px 22px"
  card:
    backgroundColor: "{colors.card-white}"
    rounded: "{rounded.r-lg}"
    padding: "24px 24px 22px"
  card-soon:
    backgroundColor: "#EDEDF0"
    textColor: "{colors.slate}"
    rounded: "{rounded.r-lg}"
  announcement-info:
    backgroundColor: "{colors.deep-teal}"
    textColor: "{colors.card-white}"
    rounded: "16px"
  announcement-urgent:
    backgroundColor: "{colors.harvest-orange}"
    textColor: "{colors.ink}"
    rounded: "16px"
  pill-ok:
    backgroundColor: "{colors.spring-lime-wash}"
    textColor: "{colors.spring-lime-deep}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  pill-warn:
    backgroundColor: "{colors.harvest-orange-wash}"
    textColor: "{colors.harvest-orange-deep}"
    rounded: "{rounded.pill}"
    padding: "3px 9px"
  search-field:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "14px"
    padding: "12px 16px"
  nav-link-active:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
---

# Design System: Cornerstone Staff Hub

## Overview

**Creative North Star: "The Welcoming Lobby"**, worn in the **"Connected"** look (October 25, 2026).

**Connected (current).** The page sits on a soft lime glow. Home opens on a dark panel framed in white: "The Connected Staff Hub", a pixel field that fades out behind the title, and lime, blue or orange squares (picked at random each visit) that gather into the CF mark. Every square stands for a person and none is labeled, so no campus or team is singled out. Home blocks are white framed panels; the staff values sit on a second dark panel that bookends the hero. Type is Manrope. Notes below that describe the September look (Inter, app-icon quick links, colored value cards, a teal announcement) are superseded where they conflict; the mockup that set this look is `mockups/` (Connected).

The hub should feel like walking into a Cornerstone lobby on a weekday: bright, calm, clearly signed, and someone has already thought about where you need to go. Most staff are pastors, not technologists, so the look earns trust by being obvious. Big plain headings, one clear action color, and generous space mean nobody has to hunt.

The system is an Apple-leaning restyle (September 2026) on Cornerstone's own palette. A soft grey ground holds white cards that lift slightly on a soft shadow instead of being boxed in by lines. Brand color is used to tell you where you are and what you can press, not to decorate. The one moment of drama is the dark Jungle Night hero on Home, lit by a teal and lime glow.

Density is relaxed on desktop and the same content stacks to a single column on phones, where the section links move to an iPhone-style tab bar at the bottom.

**Key Characteristics:**
- Calm grey ground, white cards, soft shadows, almost no borders.
- Cornerstone Teal for actions and links; each section owns one CF accent as a small dot.
- Manrope with tight, confident headline tracking.
- Pill buttons and generously rounded cards (20px).
- Frosted glass bars: top nav on desktop, tab bar on phone.

## Colors

A quiet neutral room with Cornerstone's teal as the voice and orange and lime as the occasional highlight.

### Primary
- **Cornerstone Teal**: The website's CF blue and the main accent. Focus rings, search focus glow, active states, and the default section color. Chosen over the other two CF blues because it is what staff already see on cornerstoneweb.org.
- **Deep Teal**: The button and link color. White text on it clears contrast, so every pressable thing in the hub uses it. Also the info announcement banner.
- **Teal Wash**: Pale teal tint for soft highlighted grounds.

### Secondary
- **Harvest Orange**: The Requests section accent and the urgent announcement banner, always with dark ink text on top, never white.
- **Harvest Orange Deep / Wash**: The text and ground pair for warning pills.

### Tertiary
- **Spring Lime**: The HR section accent and the glow in the Home hero. Bright, so it is used for edges and dots, never for text.
- **Spring Lime Deep / Wash**: The text and ground pair for "OK" pills.
- **Sky Cyan** and **Cerulean**: The other two CF blues, used only as the Guides and Brand section accents and in campus tags.

### Neutral
- **Jungle Night**: Cornerstone's Dark Jungle Green. The Home hero ground and the toast background. The only dark surface in the system.
- **Lobby Grey**: The page ground everywhere, and the browser theme color.
- **Card White**: Every card, the search field, and menus.
- **Hairline / Hairline Strong**: Light dividers and the search field outline. Used sparingly; shadow does most of the separating.
- **Ink**: Headings and primary text.
- **Slate**: Body text on cards (7:1 on white).
- **Faint**: Small grey text, subtitles, and notes (5:1 on white, 4.6:1 on Lobby Grey). The lightest grey allowed for text.

### Named Rules
**The Color Means Place Rule.** Section accents say "which section am I in". The same accent appears on the nav highlight, the home card, and the section page dot, and nowhere else.

**The Teal Carries White Rule.** White text only goes on Deep Teal or Jungle Night. Orange and lime always carry dark ink.

**The Lime Never Speaks Rule.** Spring Lime is never used as text. Mixed text from a section accent stays at or below the tested mix (52% for "Coming soon" pills) so every CF accent clears 4.5:1.

## Typography

**Display Font:** Manrope (with -apple-system, system-ui fallback)
**Body Font:** Manrope

**Character:** One family doing everything. Headlines are bold with tight negative tracking so they read as confident and modern; body text stays at a comfortable 16px with relaxed line height so it reads easily for anyone.

### Hierarchy
- **Display** (700, clamp 2.5 to 4.25rem, 1.02): Home hero headline only.
- **Headline** (700, clamp 2.1 to 3rem, 1.04): Page titles and the welcome heading.
- **Title** (700, 1.2 to 1.65rem, 1.12 to 1.2): Card and tile titles.
- **Body** (400, 16px, 1.5): All reading text. Welcome and long text run at 1.65 line height and cap near 54 to 62ch.
- **Label** (600, 11 to 13.5px): Pills, nav links, tags. Announcement tags are the one uppercase label (.7rem, .08em tracking).

### Named Rules
**The Plain Words Rule.** Headings say what is on the page in everyday words. Type size does the emphasis; no all-caps headings, no decorative fonts.

## Layout

Content sits in a centered column up to 1180px wide with 40px side padding, dropping to 16px under 900px. Spacing follows a six-step scale (4, 8, 16, 24, 40, 64px). Card grids use auto-fill columns with a 260 to 300px minimum and an 18px gap, so they fall to one column on phones without breakpoint rules.

Under 720px the top nav links hide and a fixed bottom tab bar (58px plus safe area) takes over, with 24px icons and labels. Inputs stay at 16px on phones so iOS does not zoom.

**The Thumb Reach Rule.** On a phone, primary navigation lives at the bottom of the screen, within thumb reach.

## Elevation & Depth

Depth comes from soft, layered shadows and frosted glass, not from borders. Surfaces sit gently above the grey ground at rest and lift a little more on hover.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 30px rgba(0,0,0,.05)`): Every card and tile at rest.
- **Lifted** (`box-shadow: 0 2px 4px rgba(0,0,0,.05), 0 18px 44px rgba(0,0,0,.10)`): Hovered cards, menus, toasts.
- **Frosted bar**: Translucent white (78%) with a 20px blur, used for the top nav and phone tab bar.

### Named Rules
**The Lift Means Pressable Rule.** A card that lifts on hover (3px up, Lifted shadow) is a link. A "Coming soon" card goes flat grey with no shadow and no lift, so the eye reads "not yet" before reading a word.

## Shapes

Friendly, generously rounded forms. Small controls are 12px, cards 20px, the hero 28px, and every button, nav link, and pill is a full pill shape. Circles are used for avatars, icon buttons, and the section color dots. The Home quick links are app-icon squares (76px, 19px radius) with a soft gradient.

## Components

### Buttons
Friendly and touchable.
- **Shape:** Full pill (999px).
- **Primary:** Deep Teal with white text, 600 weight, 11px by 22px padding.
- **Hover / Focus:** Darkens one step on hover, shrinks to 98% on press. Focus shows a 2px Cornerstone Teal outline with 2px offset.
- **Ghost:** A 5% black tint with ink text, for secondary actions.

### Chips (Pills)
- **Style:** Small pill (11px, 600) with a colored dot before the text, on a pale wash of the same color.
- **State:** OK (lime), Warn (orange), Muted (grey), and Coming soon (the section's own accent, no dot).

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** Card White; Coming soon cards use a flat light grey.
- **Shadow Strategy:** Resting, lifting on hover (see Elevation & Depth).
- **Border:** None.
- **Internal Padding:** 24px.
- **Accent:** A 10px section-color dot above the title.

### Inputs / Fields
- **Style:** White search field, 1px Hairline Strong outline, 14px radius, 17px text.
- **Focus:** Outline turns Cornerstone Teal with a soft 4px teal glow.

### Navigation
- **Desktop:** Sticky frosted bar, 52px tall, CF logo left, pill-shaped section links (13.5px, 500). The active link is bold on a 12% tint of its section color.
- **Phone:** Links move to a fixed frosted tab bar at the bottom; the active tab turns Deep Teal.

### Announcement Banner
A solid color strip that reads as "not a card": Deep Teal with white text for info, Harvest Orange with dark ink for urgent. 16px radius, an icon tile on the left, and a white pill action on the right.

### Home Hero
Jungle Night ground lit by a cyan glow at the top right and a lime glow at the bottom right, 28px radius, with the white display headline and a faint CF mark. It can take a photo with a dark gradient for legibility.

## Do's and Don'ts

### Do:
- **Do** use Deep Teal for every button and link, so "teal means press" holds everywhere.
- **Do** give each section one CF accent and repeat it on its nav highlight, card, and page dot.
- **Do** separate surfaces with the Resting shadow on Lobby Grey rather than adding borders.
- **Do** keep text at Faint (#6E6E73) or darker; nothing lighter for words.
- **Do** keep tap targets phone-sized and inputs at 16px or larger on phones.
- **Do** respect reduced motion: transitions are short (0.2 to 0.3s) and switch off entirely when requested.

### Don't:
- **Don't** put white text on orange, lime, or cyan.
- **Don't** use lime for text.
- **Don't** add a dark surface beyond the Home hero, the staff values panel and toasts.
- **Don't** show a lifted, colorful card for something that isn't live yet; use the flat grey Coming soon card.
- **Don't** introduce new fonts, colors, or a sidebar; the shell is shared by every tool.
