import React from 'react';
import { Heart, Cake, Sparkles, Flame, PartyPopper } from 'lucide-react';
import type { EventType } from '../../types';

export interface QuickTemplate {
  title: string;
  eventType: EventType;
  budget: number;
  guestCount: number;
  location: string;
  theme: string;
  cultural: string;
  dietary: string;
  priorities: string[];
  notes: string;
}

export const quickTemplates: QuickTemplate[] = [
  {
    title: 'Grand Heritage Palace Wedding',
    eventType: 'wedding',
    budget: 1500000,
    guestCount: 250,
    location: 'Umaid Bhawan Palace, Jodhpur',
    theme: 'Royal Rajputana Gold & Crimson',
    cultural: 'Traditional Marwari Heritage',
    dietary: 'Gourmet Pure Vegetarian Banquet',
    priorities: ['catering', 'venue', 'decoration'],
    notes: 'Need live royal nagada welcome, vintage car entry, and stage pyrotechnics.',
  },
  {
    title: 'National Tech Hackathon & Conference',
    eventType: 'college',
    budget: 350000,
    guestCount: 180,
    location: 'Convention Center, Bengaluru',
    theme: 'Modern Cyber Minimalist',
    cultural: 'Corporate Tech Innovation',
    dietary: 'High-energy wraps, snack bowls & specialty coffee bar',
    priorities: ['venue', 'entertainment', 'catering'],
    notes: 'Dual Gigabit fiber internet, multi-display LED walls, and 24-hr catering access.',
  },
  {
    title: 'Retro Neon 30th Birthday Bash',
    eventType: 'birthday',
    budget: 75000,
    guestCount: 50,
    location: 'Rooftop Lounge, Mumbai',
    theme: '80s Retro Neon Glow',
    cultural: 'Cosmopolitan Party',
    dietary: 'Finger food sliders, live taco station, artisanal mocktail bar',
    priorities: ['entertainment', 'decoration', 'catering'],
    notes: 'Glow accessories, live DJ set with 80s synth-pop, and custom neon photo booth.',
  },
  {
    title: 'Annual Charity Fundraising Gala',
    eventType: 'community',
    budget: 600000,
    guestCount: 200,
    location: 'Grand Ballroom, New Delhi',
    theme: 'Black-Tie Midnight Elegance',
    cultural: 'Philanthropic Formal',
    dietary: '4-Course Plated Fine Dining & Champagne Reception',
    priorities: ['venue', 'catering', 'photography'],
    notes: 'Silent auction display tables, keynote stage setup, and press media backdrop.',
  },
];

export const priorityOptions = [
  { id: 'venue', label: 'Venue & Ambiance' },
  { id: 'catering', label: 'Food & Gourmet Dining' },
  { id: 'decoration', label: 'Bespoke Floral & Stage Decor' },
  { id: 'photography', label: 'Photography & Videography' },
  { id: 'entertainment', label: 'DJ, Music & Live Entertainment' },
];

export const categoryPresets: { id: EventType; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'wedding', label: 'Wedding & Reception', icon: Heart, desc: 'Bespoke ceremonies, catering & decor' },
  { id: 'birthday', label: 'Birthday Celebration', icon: Cake, desc: 'Themes, cakes & party entertainment' },
  { id: 'anniversary', label: 'Milestone Anniversary', icon: Sparkles, desc: 'Intimate dinner & memory timeline' },
  { id: 'college', label: 'College Festival', icon: Flame, desc: 'Trussing, audio gear & crowd logistics' },
  { id: 'community', label: 'Community Gala', icon: PartyPopper, desc: 'Public permits, seating & staging' },
];
