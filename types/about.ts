// types/about.ts

export interface HeroContent {
  title: string
  subtitle: string
  image: string
}

export interface Counter {
  id: string
  label: string
  value: number
}

export interface TeamMember {
  name: string
  role: string
  avatar: string
}

export interface TimelineItem {
  year: string
  title: string
  content: string
}

export interface AboutContent {
  hero: HeroContent
  counters: Counter[]
  team: TeamMember[]
  timeline: TimelineItem[]
}