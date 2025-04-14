'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  BoltIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  SparklesIcon,
  AcademicCapIcon,
  HeartIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

// Types for activities data structure
type Activity = {
  id: number
  name: string
  completed: boolean
  level: 'Beginner' | 'Intermediate' | 'Professional'
}

type Subcategory = {
  id: string
  name: string
  activities: Activity[]
}

type Spoke = {
  id: string
  name: string
  icon: any
  progress: number
  subcategories: Subcategory[]
}

// Dummy data for demonstration
const spokes: Spoke[] = [
  {
    id: 'personal',
    name: 'Personal',
    icon: UserCircleIcon,
    progress: 0,
    subcategories: [
      {
        id: 'self-care',
        name: 'Self-Care & Wellbeing',
        activities: [
          { id: 1, name: 'Get 7–8 hours of sleep', completed: false, level: 'Beginner' },
          { id: 2, name: 'Drink water after waking', completed: false, level: 'Beginner' },
          { id: 3, name: 'Take a relaxing bath or shower', completed: false, level: 'Beginner' },
          { id: 4, name: 'Take a mindful walk alone', completed: false, level: 'Beginner' },
          { id: 5, name: 'Set a tech-free evening', completed: false, level: 'Beginner' },
          { id: 6, name: 'Journal your self-care needs', completed: false, level: 'Beginner' },
          { id: 7, name: 'Establish a morning routine', completed: false, level: 'Beginner' },
          { id: 8, name: 'Create a calming nighttime ritual', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Schedule a "me" hour weekly', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Say no to unnecessary obligations', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Plan a solo date or hobby time', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Visit a spa or wellness center', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Read a self-care book', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Identify and replace draining habits', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Build a personalized care plan', completed: false, level: 'Professional' },
          { id: 16, name: 'Try a digital detox weekend', completed: false, level: 'Professional' },
          { id: 17, name: 'Learn skincare or grooming basics', completed: false, level: 'Professional' },
          { id: 18, name: 'Create a DIY self-care kit', completed: false, level: 'Professional' },
          { id: 19, name: 'Celebrate personal wins', completed: false, level: 'Professional' },
          { id: 20, name: 'Host a self-care workshop', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'family-bonding',
        name: 'Family Bonding',
        activities: [
          { id: 1, name: 'Call a family member just to talk', completed: false, level: 'Beginner' },
          { id: 2, name: 'Share a meal with family', completed: false, level: 'Beginner' },
          { id: 3, name: 'Ask about a family story', completed: false, level: 'Beginner' },
          { id: 4, name: 'Write a note of appreciation', completed: false, level: 'Beginner' },
          { id: 5, name: 'Watch a family movie together', completed: false, level: 'Beginner' },
          { id: 6, name: 'Schedule weekly family time', completed: false, level: 'Beginner' },
          { id: 7, name: 'Create a family group chat', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take a family photo', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Plan a small family outing', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Cook a meal with a family member', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Start a shared hobby or game', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Host a family gratitude circle', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Organize a mini family reunion', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a family vision board', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn your family tree', completed: false, level: 'Professional' },
          { id: 16, name: 'Plan a surprise for a relative', completed: false, level: 'Professional' },
          { id: 17, name: 'Have a tech-free family day', completed: false, level: 'Professional' },
          { id: 18, name: 'Address a long-standing issue with empathy', completed: false, level: 'Professional' },
          { id: 19, name: 'Write a family newsletter', completed: false, level: 'Professional' },
          { id: 20, name: 'Facilitate a family traditions revival', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'romantic-relationships',
        name: 'Romantic Relationships',
        activities: [
          { id: 1, name: 'Send a thoughtful message or compliment', completed: false, level: 'Beginner' },
          { id: 2, name: 'Have a no-device dinner', completed: false, level: 'Beginner' },
          { id: 3, name: 'Express appreciation daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Go on a walk together', completed: false, level: 'Beginner' },
          { id: 5, name: 'Share your love languages', completed: false, level: 'Beginner' },
          { id: 6, name: 'Write a handwritten note', completed: false, level: 'Beginner' },
          { id: 7, name: 'Plan a simple surprise date', completed: false, level: 'Beginner' },
          { id: 8, name: 'Share a personal story', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Do a relationship check-in', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Explore a new hobby as a couple', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Cook or build something together', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Read a relationship book', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Set shared relationship goals', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Resolve a conflict calmly', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Try couple meditation', completed: false, level: 'Professional' },
          { id: 16, name: 'Attend a relationship workshop', completed: false, level: 'Professional' },
          { id: 17, name: 'Volunteer together', completed: false, level: 'Professional' },
          { id: 18, name: 'Celebrate milestones creatively', completed: false, level: 'Professional' },
          { id: 19, name: 'Create a shared vision board', completed: false, level: 'Professional' },
          { id: 20, name: 'Mentor younger couples together', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'parenting-childcare',
        name: 'Parenting & Childcare',
        activities: [
          { id: 1, name: 'Spend 10 uninterrupted minutes playing', completed: false, level: 'Beginner' },
          { id: 2, name: 'Read a story to your child', completed: false, level: 'Beginner' },
          { id: 3, name: 'Learn about their favorite interests', completed: false, level: 'Beginner' },
          { id: 4, name: 'Create a daily routine chart', completed: false, level: 'Beginner' },
          { id: 5, name: 'Pack a lunch with a loving note', completed: false, level: 'Beginner' },
          { id: 6, name: 'Use positive reinforcement', completed: false, level: 'Beginner' },
          { id: 7, name: 'Introduce a gratitude ritual', completed: false, level: 'Beginner' },
          { id: 8, name: 'Teach them one life skill', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Take them on a one-on-one outing', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Limit screen time together', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Journal your parenting wins and challenges', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Attend a parenting seminar or webinar', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Involve them in family decisions', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Encourage curiosity and questions', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Establish healthy boundaries', completed: false, level: 'Professional' },
          { id: 16, name: 'Share childhood stories with them', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach emotional expression', completed: false, level: 'Professional' },
          { id: 18, name: 'Practice conscious/intentional parenting', completed: false, level: 'Professional' },
          { id: 19, name: 'Create a legacy scrapbook together', completed: false, level: 'Professional' },
          { id: 20, name: 'Mentor other parents', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'personal-boundaries',
        name: 'Personal Boundaries',
        activities: [
          { id: 1, name: 'Say "no" to something small', completed: false, level: 'Beginner' },
          { id: 2, name: 'Reflect on your energy drains', completed: false, level: 'Beginner' },
          { id: 3, name: 'Identify your comfort zones', completed: false, level: 'Beginner' },
          { id: 4, name: 'Write your boundary priorities', completed: false, level: 'Beginner' },
          { id: 5, name: 'Discuss one boundary with someone close', completed: false, level: 'Beginner' },
          { id: 6, name: 'Avoid overcommitting for a week', completed: false, level: 'Beginner' },
          { id: 7, name: 'Practice setting a time boundary', completed: false, level: 'Beginner' },
          { id: 8, name: 'Create a boundaries checklist', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Respond instead of react when pushed', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Communicate a boundary clearly', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Learn about assertiveness', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Share boundaries in a group setting', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Read books on emotional boundaries', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Journal about boundary violations', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Use "I feel" statements', completed: false, level: 'Professional' },
          { id: 16, name: 'Develop a support script', completed: false, level: 'Professional' },
          { id: 17, name: 'Visualize boundary enforcement', completed: false, level: 'Professional' },
          { id: 18, name: 'Role-play boundary scenarios', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach someone about boundaries', completed: false, level: 'Professional' },
          { id: 20, name: 'Create a boundary coaching module', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'relationship-communication',
        name: 'Relationship Communication',
        activities: [
          { id: 1, name: 'Listen without interrupting', completed: false, level: 'Beginner' },
          { id: 2, name: 'Use open-ended questions', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice active listening daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Reflect back what others say', completed: false, level: 'Beginner' },
          { id: 5, name: 'Avoid "you" accusations in arguments', completed: false, level: 'Beginner' },
          { id: 6, name: 'Express feelings with vulnerability', completed: false, level: 'Beginner' },
          { id: 7, name: 'Write a heartfelt letter', completed: false, level: 'Beginner' },
          { id: 8, name: 'Try a weekly check-in ritual', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Join a communication skills class', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Understand nonverbal cues', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Learn conflict de-escalation techniques', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Use humor mindfully', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Acknowledge others\' needs and triggers', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Mediate a simple conflict', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Teach empathetic communication', completed: false, level: 'Professional' },
          { id: 16, name: 'Practice radical honesty (with safety)', completed: false, level: 'Professional' },
          { id: 17, name: 'Lead a communication circle', completed: false, level: 'Professional' },
          { id: 18, name: 'Read about conscious communication', completed: false, level: 'Professional' },
          { id: 19, name: 'Co-develop communication rules at home', completed: false, level: 'Professional' },
          { id: 20, name: 'Run a workshop on mindful dialogue', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'self-reflection',
        name: 'Self-Reflection & Growth',
        activities: [
          { id: 1, name: 'Answer one reflection question', completed: false, level: 'Beginner' },
          { id: 2, name: 'Journal your mood daily', completed: false, level: 'Beginner' },
          { id: 3, name: 'Create a list of personal strengths', completed: false, level: 'Beginner' },
          { id: 4, name: 'Acknowledge a personal challenge', completed: false, level: 'Beginner' },
          { id: 5, name: 'Write a letter to your future self', completed: false, level: 'Beginner' },
          { id: 6, name: 'Ask for feedback', completed: false, level: 'Beginner' },
          { id: 7, name: 'Take a personality test', completed: false, level: 'Beginner' },
          { id: 8, name: 'Identify core values', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Reflect on a recent decision', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Create a personal growth journal', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Study a personal growth book', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Track your emotional patterns', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Develop a personal mantra', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Set a 30-day growth challenge', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Review your life quarterly', completed: false, level: 'Professional' },
          { id: 16, name: 'Work with a life coach', completed: false, level: 'Professional' },
          { id: 17, name: 'Facilitate reflection groups', completed: false, level: 'Professional' },
          { id: 18, name: 'Map your growth journey visually', completed: false, level: 'Professional' },
          { id: 19, name: 'Build a growth-based content series', completed: false, level: 'Professional' },
          { id: 20, name: 'Develop your own self-reflection guide', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'hobbies-passions',
        name: 'Hobbies & Passions',
        activities: [
          { id: 1, name: 'Make a list of things you love doing', completed: false, level: 'Beginner' },
          { id: 2, name: 'Try a new hobby for one hour', completed: false, level: 'Beginner' },
          { id: 3, name: 'Revisit a past interest', completed: false, level: 'Beginner' },
          { id: 4, name: 'Buy materials for a creative hobby', completed: false, level: 'Beginner' },
          { id: 5, name: 'Set aside hobby time weekly', completed: false, level: 'Beginner' },
          { id: 6, name: 'Follow a tutorial or how-to video', completed: false, level: 'Beginner' },
          { id: 7, name: 'Share your hobby online', completed: false, level: 'Beginner' },
          { id: 8, name: 'Join a local club or class', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Host a hobby night with friends', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Teach your hobby to someone', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Read a book about your passion', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Challenge yourself to improve at it', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Document your progress', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Attend a hobby-based event', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create content around your passion', completed: false, level: 'Professional' },
          { id: 16, name: 'Monetize a passion project', completed: false, level: 'Professional' },
          { id: 17, name: 'Build a portfolio or display', completed: false, level: 'Professional' },
          { id: 18, name: 'Coach others in your skill', completed: false, level: 'Professional' },
          { id: 19, name: 'Collaborate with other hobbyists', completed: false, level: 'Professional' },
          { id: 20, name: 'Launch a hobby-based community', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'home-environment',
        name: 'Home Environment Organization',
        activities: [
          { id: 1, name: 'Make your bed every morning', completed: false, level: 'Beginner' },
          { id: 2, name: 'Clear one cluttered surface', completed: false, level: 'Beginner' },
          { id: 3, name: 'Declutter one drawer', completed: false, level: 'Beginner' },
          { id: 4, name: 'Clean your room mindfully', completed: false, level: 'Beginner' },
          { id: 5, name: 'Light a candle or incense', completed: false, level: 'Beginner' },
          { id: 6, name: 'Organize your digital space', completed: false, level: 'Beginner' },
          { id: 7, name: 'Create a dedicated work or peace area', completed: false, level: 'Beginner' },
          { id: 8, name: 'Display one item that inspires joy', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Clean with relaxing music', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Set a 15-minute tidy-up timer', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Implement a weekly cleaning routine', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Read about feng shui or home flow', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Rearrange furniture for better flow', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Use storage creatively', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a "no-clutter" zone', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a seasonal decluttering ritual', completed: false, level: 'Professional' },
          { id: 17, name: 'Host a minimalism challenge', completed: false, level: 'Professional' },
          { id: 18, name: 'Redesign a corner to reflect your goals', completed: false, level: 'Professional' },
          { id: 19, name: 'Add personalized decor with meaning', completed: false, level: 'Professional' },
          { id: 20, name: 'Teach space organization to others', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'emotional-connection',
        name: 'Emotional Connection with Loved Ones',
        activities: [
          { id: 1, name: 'Hug someone for 10+ seconds', completed: false, level: 'Beginner' },
          { id: 2, name: 'Say "I love you" more often', completed: false, level: 'Beginner' },
          { id: 3, name: 'Share a meaningful memory', completed: false, level: 'Beginner' },
          { id: 4, name: 'Give a genuine compliment', completed: false, level: 'Beginner' },
          { id: 5, name: 'Write a letter of appreciation', completed: false, level: 'Beginner' },
          { id: 6, name: 'Plan a spontaneous outing', completed: false, level: 'Beginner' },
          { id: 7, name: 'Discuss dreams and fears', completed: false, level: 'Beginner' },
          { id: 8, name: 'Apologize sincerely when needed', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Offer emotional support', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Do a check-in call or visit', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Create a "You Matter" gift', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Celebrate their achievements', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Start a connection ritual', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Learn their love language', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Share what you admire in them', completed: false, level: 'Professional' },
          { id: 16, name: 'Do a gratitude exchange', completed: false, level: 'Professional' },
          { id: 17, name: 'Create a memory scrapbook', completed: false, level: 'Professional' },
          { id: 18, name: 'Resolve an old misunderstanding', completed: false, level: 'Professional' },
          { id: 19, name: 'Record joint video messages', completed: false, level: 'Professional' },
          { id: 20, name: 'Facilitate a family or friends\' connection circle', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: SparklesIcon,
    progress: 75,
    subcategories: [
      {
        id: 'meditation',
        name: 'Meditation & Mindfulness',
        activities: [
          { id: 1, name: 'Sit quietly for 1 minute focusing on your breath', completed: false, level: 'Beginner' },
          { id: 2, name: 'Practice 3-minute mindful breathing', completed: false, level: 'Beginner' },
          { id: 3, name: 'Follow a 5-minute guided meditation', completed: false, level: 'Beginner' },
          { id: 4, name: 'Journal thoughts after meditation', completed: false, level: 'Beginner' },
          { id: 5, name: 'Try body scan meditation', completed: false, level: 'Beginner' },
          { id: 6, name: 'Meditate for 10 consecutive days', completed: false, level: 'Beginner' },
          { id: 7, name: 'Meditate for 10 minutes daily', completed: false, level: 'Beginner' },
          { id: 8, name: 'Learn about different types of meditation', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Practice walking meditation', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Attend a meditation circle or class', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Meditate for 20+ minutes consistently', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Read books by spiritual teachers', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Try mantra meditation', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Practice loving-kindness (Metta) meditation', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Join a virtual meditation retreat', completed: false, level: 'Professional' },
          { id: 16, name: 'Host a meditation group', completed: false, level: 'Professional' },
          { id: 17, name: 'Learn to guide others in mindfulness', completed: false, level: 'Professional' },
          { id: 18, name: 'Study mindfulness-based stress reduction (MBSR)', completed: false, level: 'Professional' },
          { id: 19, name: 'Participate in a silent retreat', completed: false, level: 'Professional' },
          { id: 20, name: 'Become a certified mindfulness coach', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'prayer',
        name: 'Prayer & Rituals',
        activities: [
          { id: 1, name: 'Set a daily prayer intention', completed: false, level: 'Beginner' },
          { id: 2, name: 'Light a candle in silence', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice morning or evening prayers', completed: false, level: 'Beginner' },
          { id: 4, name: 'Learn a traditional prayer from your faith', completed: false, level: 'Beginner' },
          { id: 5, name: 'Create a peaceful prayer corner', completed: false, level: 'Beginner' },
          { id: 6, name: 'Say grace before meals', completed: false, level: 'Beginner' },
          { id: 7, name: 'Attend a prayer session or service', completed: false, level: 'Beginner' },
          { id: 8, name: 'Write a personal prayer', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Recite affirmations as modern prayer', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Reflect on prayer in a journal', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Memorize a sacred text', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Learn about interfaith prayers', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Pray for others intentionally', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Join a prayer group', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a ritual around significant days', completed: false, level: 'Professional' },
          { id: 16, name: 'Teach others your prayer ritual', completed: false, level: 'Professional' },
          { id: 17, name: 'Explore prayer beads or tools', completed: false, level: 'Professional' },
          { id: 18, name: 'Compose prayers for your community', completed: false, level: 'Professional' },
          { id: 19, name: 'Lead a community blessing', completed: false, level: 'Professional' },
          { id: 20, name: 'Create a personal or family ritual book', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'nature',
        name: 'Connection with Nature',
        activities: [
          { id: 1, name: 'Spend 5 minutes outdoors in silence', completed: false, level: 'Beginner' },
          { id: 2, name: 'Walk barefoot on grass or sand', completed: false, level: 'Beginner' },
          { id: 3, name: 'Observe a sunrise or sunset', completed: false, level: 'Beginner' },
          { id: 4, name: 'Sit under a tree and journal', completed: false, level: 'Beginner' },
          { id: 5, name: 'Photograph natural beauty', completed: false, level: 'Beginner' },
          { id: 6, name: 'Start a nature observation journal', completed: false, level: 'Beginner' },
          { id: 7, name: 'Learn about local flora and fauna', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take a nature hike', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Practice grounding (earthing)', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Do yoga or meditate outside', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Stargaze and reflect', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Participate in a local clean-up', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Build a small garden', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Camp in nature for a night', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Visit sacred or natural landmarks', completed: false, level: 'Professional' },
          { id: 16, name: 'Organize a nature mindfulness walk', completed: false, level: 'Professional' },
          { id: 17, name: 'Practice eco-spirituality rituals', completed: false, level: 'Professional' },
          { id: 18, name: 'Host an outdoor gratitude ceremony', completed: false, level: 'Professional' },
          { id: 19, name: 'Volunteer in conservation efforts', completed: false, level: 'Professional' },
          { id: 20, name: 'Teach nature-connected spirituality', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'purpose',
        name: 'Purpose & Meaning',
        activities: [
          { id: 1, name: 'Write your personal values', completed: false, level: 'Beginner' },
          { id: 2, name: 'Reflect on your life\'s mission', completed: false, level: 'Beginner' },
          { id: 3, name: 'List things that bring joy and purpose', completed: false, level: 'Beginner' },
          { id: 4, name: 'Journal on "what matters most"', completed: false, level: 'Beginner' },
          { id: 5, name: 'Visualize your ideal life', completed: false, level: 'Beginner' },
          { id: 6, name: 'Read books on finding meaning', completed: false, level: 'Beginner' },
          { id: 7, name: 'Set aligned life goals', completed: false, level: 'Beginner' },
          { id: 8, name: 'Explore your calling or dharma', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Discuss purpose with a mentor', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Revisit your priorities monthly', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Create a vision board', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Take a purpose-finding course', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Record purpose-based affirmations', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Align work with purpose', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Volunteer intentionally', completed: false, level: 'Professional' },
          { id: 16, name: 'Teach others to find purpose', completed: false, level: 'Professional' },
          { id: 17, name: 'Create a life map', completed: false, level: 'Professional' },
          { id: 18, name: 'Write a purpose manifesto', completed: false, level: 'Professional' },
          { id: 19, name: 'Start a purpose-driven project', completed: false, level: 'Professional' },
          { id: 20, name: 'Guide others through purpose discovery', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'gratitude',
        name: 'Gratitude Practice',
        activities: [
          { id: 1, name: 'List 3 things you\'re grateful for daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Say thank you with intention', completed: false, level: 'Beginner' },
          { id: 3, name: 'Share one gratitude moment on social media', completed: false, level: 'Beginner' },
          { id: 4, name: 'Keep a gratitude journal', completed: false, level: 'Beginner' },
          { id: 5, name: 'Write a thank-you letter', completed: false, level: 'Beginner' },
          { id: 6, name: 'Reflect on gratitude before sleeping', completed: false, level: 'Beginner' },
          { id: 7, name: 'Make a gratitude jar', completed: false, level: 'Beginner' },
          { id: 8, name: 'Express gratitude to family/friends', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Draw something you\'re grateful for', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Practice gratitude meditation', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Host a gratitude circle', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create a monthly gratitude wall', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Celebrate someone publicly', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Record gratitude audio messages', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Share stories of thankfulness', completed: false, level: 'Professional' },
          { id: 16, name: 'Teach a gratitude practice class', completed: false, level: 'Professional' },
          { id: 17, name: 'Publish a gratitude blog series', completed: false, level: 'Professional' },
          { id: 18, name: 'Lead a community gratitude challenge', completed: false, level: 'Professional' },
          { id: 19, name: 'Study gratitude science', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a gratitude-based service program', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'reflection',
        name: 'Inner Reflection & Journaling',
        activities: [
          { id: 1, name: 'Free-write for 5 minutes daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Reflect on highs and lows of the day', completed: false, level: 'Beginner' },
          { id: 3, name: 'Use a journaling prompt guide', completed: false, level: 'Beginner' },
          { id: 4, name: 'Write about your emotions', completed: false, level: 'Beginner' },
          { id: 5, name: 'Practice stream-of-consciousness writing', completed: false, level: 'Beginner' },
          { id: 6, name: 'Reflect on decisions you\'ve made', completed: false, level: 'Beginner' },
          { id: 7, name: 'Keep a "lessons learned" log', completed: false, level: 'Beginner' },
          { id: 8, name: 'Journal during emotional events', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Review old journal entries monthly', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Write your autobiography', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Share select entries with a coach or mentor', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create art journaling pages', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Join a journaling circle', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Journal with gratitude and intention', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a yearly reflection template', completed: false, level: 'Professional' },
          { id: 16, name: 'Publish journal excerpts or reflections', completed: false, level: 'Professional' },
          { id: 17, name: 'Start a daily digital journaling habit', completed: false, level: 'Professional' },
          { id: 18, name: 'Journal your dreams', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach reflection journaling workshops', completed: false, level: 'Professional' },
          { id: 20, name: 'Build your own journal prompts toolkit', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'forgiveness',
        name: 'Forgiveness & Letting Go',
        activities: [
          { id: 1, name: 'Identify unresolved resentment', completed: false, level: 'Beginner' },
          { id: 2, name: 'Write a forgiveness letter (unsent)', completed: false, level: 'Beginner' },
          { id: 3, name: 'Reflect on a past hurt and what it taught you', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice forgiveness affirmations', completed: false, level: 'Beginner' },
          { id: 5, name: 'Use breathwork to release tension', completed: false, level: 'Beginner' },
          { id: 6, name: 'Listen to a talk on forgiveness', completed: false, level: 'Beginner' },
          { id: 7, name: 'Forgive someone mentally', completed: false, level: 'Beginner' },
          { id: 8, name: 'Seek apology or reconciliation', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Meditate on letting go', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Share your story anonymously', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Consult a therapist about deep wounds', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Practice Ho\'oponopono', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Join a support or healing circle', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Let go of one limiting belief', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a forgiveness ritual', completed: false, level: 'Professional' },
          { id: 16, name: 'Publicly share your growth', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach forgiveness workshops', completed: false, level: 'Professional' },
          { id: 18, name: 'Reframe painful stories into strengths', completed: false, level: 'Professional' },
          { id: 19, name: 'Build forgiveness challenges or apps', completed: false, level: 'Professional' },
          { id: 20, name: 'Write or speak about your journey', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'learning',
        name: 'Spiritual Learning & Reading',
        activities: [
          { id: 1, name: 'Read one spiritual quote daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Explore one spiritual text', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a documentary on wisdom traditions', completed: false, level: 'Beginner' },
          { id: 4, name: 'Read short stories of saints or sages', completed: false, level: 'Beginner' },
          { id: 5, name: 'Subscribe to a spiritual newsletter', completed: false, level: 'Beginner' },
          { id: 6, name: 'Study one religious philosophy', completed: false, level: 'Beginner' },
          { id: 7, name: 'Learn about mindfulness or Zen', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take online spiritual courses', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Discuss spiritual books in a group', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Journal your insights from readings', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Deep dive into ancient scriptures', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Compare belief systems', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Attend spiritual book clubs', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Curate your own reading list', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Read original texts with commentary', completed: false, level: 'Professional' },
          { id: 16, name: 'Annotate a sacred book', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach what you learn', completed: false, level: 'Professional' },
          { id: 18, name: 'Publish spiritual reflections', completed: false, level: 'Professional' },
          { id: 19, name: 'Interview spiritual practitioners', completed: false, level: 'Professional' },
          { id: 20, name: 'Write your own spiritual book or guide', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'belief',
        name: 'Belief System Exploration',
        activities: [
          { id: 1, name: 'Reflect on what you believe', completed: false, level: 'Beginner' },
          { id: 2, name: 'Learn about your family\'s belief system', completed: false, level: 'Beginner' },
          { id: 3, name: 'Study world religions 101', completed: false, level: 'Beginner' },
          { id: 4, name: 'Visit a new place of worship', completed: false, level: 'Beginner' },
          { id: 5, name: 'Interview someone of a different belief', completed: false, level: 'Beginner' },
          { id: 6, name: 'Explore philosophy (e.g., Stoicism)', completed: false, level: 'Beginner' },
          { id: 7, name: 'Create your spiritual values chart', completed: false, level: 'Beginner' },
          { id: 8, name: 'Explore agnosticism and theism', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Discuss beliefs with respect', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Take an interfaith dialogue course', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Compare religious texts and rituals', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Reflect on your spiritual questions', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Join an interspiritual circle', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Map your belief evolution over time', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Volunteer in diverse spiritual communities', completed: false, level: 'Professional' },
          { id: 16, name: 'Speak about coexistence', completed: false, level: 'Professional' },
          { id: 17, name: 'Host spiritual dialogue sessions', completed: false, level: 'Professional' },
          { id: 18, name: 'Curate a belief exploration blog', completed: false, level: 'Professional' },
          { id: 19, name: 'Design your own belief code', completed: false, level: 'Professional' },
          { id: 20, name: 'Lead a belief diversity campaign', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'service',
        name: 'Service & Compassion',
        activities: [
          { id: 1, name: 'Smile and greet strangers', completed: false, level: 'Beginner' },
          { id: 2, name: 'Offer help to a neighbor', completed: false, level: 'Beginner' },
          { id: 3, name: 'Write a kind note to someone', completed: false, level: 'Beginner' },
          { id: 4, name: 'Pick up litter in your neighborhood', completed: false, level: 'Beginner' },
          { id: 5, name: 'Donate unused items', completed: false, level: 'Beginner' },
          { id: 6, name: 'Support a local cause', completed: false, level: 'Beginner' },
          { id: 7, name: 'Volunteer at a shelter or kitchen', completed: false, level: 'Beginner' },
          { id: 8, name: 'Offer your time to elders', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Start a "help others" challenge', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Sponsor someone\'s education or needs', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Mentor someone in need', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Share stories of kindness', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Host a compassion drive', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a random acts of kindness plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Join a global compassion movement', completed: false, level: 'Professional' },
          { id: 16, name: 'Teach kids about empathy', completed: false, level: 'Professional' },
          { id: 17, name: 'Organize community kindness walks', completed: false, level: 'Professional' },
          { id: 18, name: 'Launch a pay-it-forward campaign', completed: false, level: 'Professional' },
          { id: 19, name: 'Collaborate with NGOs', completed: false, level: 'Professional' },
          { id: 20, name: 'Found your own service-based initiative', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: AcademicCapIcon,
    progress: 60,
    subcategories: [
      {
        id: 'critical-thinking',
        name: 'Critical Thinking & Logic',
        activities: [
          { id: 1, name: 'Solve a basic puzzle or riddle', completed: false, level: 'Beginner' },
          { id: 2, name: 'Analyze both sides of a simple issue', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a logic-based video', completed: false, level: 'Beginner' },
          { id: 4, name: 'Read a short article critically', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn about logical fallacies', completed: false, level: 'Beginner' },
          { id: 6, name: 'Debate a light topic with a friend', completed: false, level: 'Beginner' },
          { id: 7, name: 'Join an online logic quiz', completed: false, level: 'Beginner' },
          { id: 8, name: 'Complete a Sudoku or logic puzzle', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Analyze pros and cons of a decision', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Take a free logic or reasoning course', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Participate in structured debates', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Practice scenario planning', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Play strategic games like chess', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a decision-making matrix', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Read books on logic and reason', completed: false, level: 'Professional' },
          { id: 16, name: 'Solve daily brain teasers', completed: false, level: 'Professional' },
          { id: 17, name: 'Review historical decisions for insight', completed: false, level: 'Professional' },
          { id: 18, name: 'Build a logic-based decision tree', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach critical thinking skills', completed: false, level: 'Professional' },
          { id: 20, name: 'Publish articles on reasoning', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'emotional-intelligence',
        name: 'Emotional Intelligence',
        activities: [
          { id: 1, name: 'Identify your current mood daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Name the emotions you felt each day', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice deep breathing during tension', completed: false, level: 'Beginner' },
          { id: 4, name: 'Reflect on emotional triggers', completed: false, level: 'Beginner' },
          { id: 5, name: 'Read about emotional intelligence basics', completed: false, level: 'Beginner' },
          { id: 6, name: 'Express feelings using "I" statements', completed: false, level: 'Beginner' },
          { id: 7, name: 'Watch a TED Talk on empathy', completed: false, level: 'Beginner' },
          { id: 8, name: 'Apologize sincerely when needed', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Practice perspective-taking', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Recognize emotions in others', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Journal about emotional reactions', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Join an EI improvement course', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Listen actively in conversations', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Track and manage emotional highs/lows', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Teach kids about emotions', completed: false, level: 'Professional' },
          { id: 16, name: 'Mediate peer conflicts calmly', completed: false, level: 'Professional' },
          { id: 17, name: 'Understand emotional regulation theories', completed: false, level: 'Professional' },
          { id: 18, name: 'Build your emotional vocabulary', completed: false, level: 'Professional' },
          { id: 19, name: 'Facilitate emotional support groups', completed: false, level: 'Professional' },
          { id: 20, name: 'Train others in emotional coaching', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'stress-management',
        name: 'Stress Management',
        activities: [
          { id: 1, name: 'List top 5 stressors in your life', completed: false, level: 'Beginner' },
          { id: 2, name: 'Do a 5-minute calming breath session', completed: false, level: 'Beginner' },
          { id: 3, name: 'Write in a stress journal', completed: false, level: 'Beginner' },
          { id: 4, name: 'Take short nature breaks', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn about the stress cycle', completed: false, level: 'Beginner' },
          { id: 6, name: 'Reduce screen time by 30 minutes', completed: false, level: 'Beginner' },
          { id: 7, name: 'Drink herbal tea instead of caffeine', completed: false, level: 'Beginner' },
          { id: 8, name: 'Practice progressive muscle relaxation', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Set healthy boundaries', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Use a guided stress meditation', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Follow a 7-day stress detox', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create a personal calm-down plan', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Attend a stress management webinar', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Reduce commitments for a week', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Practice laughter therapy', completed: false, level: 'Professional' },
          { id: 16, name: 'Learn cortisol triggers and hacks', completed: false, level: 'Professional' },
          { id: 17, name: 'Do expressive writing after stress', completed: false, level: 'Professional' },
          { id: 18, name: 'Lead stress relief circles', completed: false, level: 'Professional' },
          { id: 19, name: 'Track stress levels via app', completed: false, level: 'Professional' },
          { id: 20, name: 'Build your own resilience workbook', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'positive-self-talk',
        name: 'Positive Self-Talk & Affirmations',
        activities: [
          { id: 1, name: 'Write down 3 positive affirmations', completed: false, level: 'Beginner' },
          { id: 2, name: 'Say affirmations in the mirror', completed: false, level: 'Beginner' },
          { id: 3, name: 'Replace one negative thought daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Listen to positive self-talk audio', completed: false, level: 'Beginner' },
          { id: 5, name: 'Create a daily self-talk journal', completed: false, level: 'Beginner' },
          { id: 6, name: 'Repeat affirmations before sleep', completed: false, level: 'Beginner' },
          { id: 7, name: 'Read a book on self-esteem', completed: false, level: 'Beginner' },
          { id: 8, name: 'Develop an affirmation script', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Record your own affirmations', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Practice daily gratitude & self-worth', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Join a positive mindset group', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Teach affirmations to kids', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Personalize affirmations to goals', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Pair affirmations with breathwork', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Post affirmation reminders around home', completed: false, level: 'Professional' },
          { id: 16, name: 'Use affirmation apps', completed: false, level: 'Professional' },
          { id: 17, name: 'Study cognitive behavioral therapy basics', completed: false, level: 'Professional' },
          { id: 18, name: 'Create affirmation art or posters', completed: false, level: 'Professional' },
          { id: 19, name: 'Guide others in affirmations practice', completed: false, level: 'Professional' },
          { id: 20, name: 'Create a self-talk training program', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'focus-concentration',
        name: 'Focus & Concentration',
        activities: [
          { id: 1, name: 'Eliminate one distraction for 30 mins', completed: false, level: 'Beginner' },
          { id: 2, name: 'Use a Pomodoro timer for a task', completed: false, level: 'Beginner' },
          { id: 3, name: 'Read a short article without pausing', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice single-tasking', completed: false, level: 'Beginner' },
          { id: 5, name: 'Write down 3 priority tasks', completed: false, level: 'Beginner' },
          { id: 6, name: 'Minimize app notifications', completed: false, level: 'Beginner' },
          { id: 7, name: 'Do a 5-minute candle stare drill', completed: false, level: 'Beginner' },
          { id: 8, name: 'Create a focus-friendly environment', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Complete a task list mindfully', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Listen to binaural beats', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Join a deep work challenge', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Journal on distractions', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Read books on focus (e.g., Deep Work)', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Practice meditation for focus', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Track your focus peaks and dips', completed: false, level: 'Professional' },
          { id: 16, name: 'Use the Eisenhower Matrix', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach focused work principles', completed: false, level: 'Professional' },
          { id: 18, name: 'Limit multitasking over a week', completed: false, level: 'Professional' },
          { id: 19, name: 'Study attentional control research', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a focus-boosting community plan', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'problem-solving',
        name: 'Problem Solving',
        activities: [
          { id: 1, name: 'Solve a brain teaser daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Identify daily problems and ideas to fix them', completed: false, level: 'Beginner' },
          { id: 3, name: 'Map out a simple challenge', completed: false, level: 'Beginner' },
          { id: 4, name: 'Apply 5 Whys to an issue', completed: false, level: 'Beginner' },
          { id: 5, name: 'Study common problem-solving models', completed: false, level: 'Beginner' },
          { id: 6, name: 'Join a problem-solving workshop', completed: false, level: 'Beginner' },
          { id: 7, name: 'Brainstorm without judgment', completed: false, level: 'Beginner' },
          { id: 8, name: 'Test one small solution', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Use mind-mapping software', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Build pros/cons lists for choices', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Evaluate solution success rates', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Collaborate on solving team issues', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Solve case studies or simulations', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create decision trees', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn systems thinking basics', completed: false, level: 'Professional' },
          { id: 16, name: 'Take a design thinking course', completed: false, level: 'Professional' },
          { id: 17, name: 'Prototype a solution model', completed: false, level: 'Professional' },
          { id: 18, name: 'Teach problem-solving in groups', completed: false, level: 'Professional' },
          { id: 19, name: 'Write a personal case study', completed: false, level: 'Professional' },
          { id: 20, name: 'Launch your own problem-solving blog/podcast', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'continuous-learning',
        name: 'Continuous Learning',
        activities: [
          { id: 1, name: 'Read one article daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Subscribe to a learning podcast', completed: false, level: 'Beginner' },
          { id: 3, name: 'Complete a short online course', completed: false, level: 'Beginner' },
          { id: 4, name: 'Watch an educational documentary', completed: false, level: 'Beginner' },
          { id: 5, name: 'Keep a learning journal', completed: false, level: 'Beginner' },
          { id: 6, name: 'Learn a new word each day', completed: false, level: 'Beginner' },
          { id: 7, name: 'Follow experts in your interests', completed: false, level: 'Beginner' },
          { id: 8, name: 'Schedule 30 mins for daily reading', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Learn a new hobby monthly', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Set a 30-day learning goal', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Join a lifelong learning platform', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Revisit high school or college topics', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Enroll in MOOCs (Coursera, edX, etc.)', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Present what you\'ve learned to others', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create visual notes from a lecture', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a "Book a Month" challenge', completed: false, level: 'Professional' },
          { id: 17, name: 'Study spaced repetition techniques', completed: false, level: 'Professional' },
          { id: 18, name: 'Take a certification exam', completed: false, level: 'Professional' },
          { id: 19, name: 'Mentor someone in your learning', completed: false, level: 'Professional' },
          { id: 20, name: 'Design your own course', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'resilience-building',
        name: 'Resilience Building',
        activities: [
          { id: 1, name: 'Identify a past hardship and its lessons', completed: false, level: 'Beginner' },
          { id: 2, name: 'Start a "bounce-back" journal', completed: false, level: 'Beginner' },
          { id: 3, name: 'Write about failures and growth', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice gratitude after setbacks', completed: false, level: 'Beginner' },
          { id: 5, name: 'Join a peer resilience circle', completed: false, level: 'Beginner' },
          { id: 6, name: 'Learn about growth mindset', completed: false, level: 'Beginner' },
          { id: 7, name: 'Review role models who bounced back', completed: false, level: 'Beginner' },
          { id: 8, name: 'Read books on resilience', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Follow inspiring recovery stories', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Challenge yourself physically (e.g., cold shower)', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Build adversity simulations', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Teach kids about bouncing back', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Visualize overcoming adversity', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Join a coaching or therapy session', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Accept constructive criticism', completed: false, level: 'Professional' },
          { id: 16, name: 'Track recovery time from challenges', completed: false, level: 'Professional' },
          { id: 17, name: 'Speak publicly about bouncing back', completed: false, level: 'Professional' },
          { id: 18, name: 'Create resilience quotes art', completed: false, level: 'Professional' },
          { id: 19, name: 'Build a "Resilience Toolkit"', completed: false, level: 'Professional' },
          { id: 20, name: 'Start a community resilience project', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'time-management',
        name: 'Time Management & Discipline',
        activities: [
          { id: 1, name: 'Track your day in 15-minute chunks', completed: false, level: 'Beginner' },
          { id: 2, name: 'Use a calendar app for a week', completed: false, level: 'Beginner' },
          { id: 3, name: 'Set 3 clear goals daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Say "no" to one distraction', completed: false, level: 'Beginner' },
          { id: 5, name: 'Use a time-blocking schedule', completed: false, level: 'Beginner' },
          { id: 6, name: 'Follow a "Do Not Disturb" routine', completed: false, level: 'Beginner' },
          { id: 7, name: 'Set deadlines and rewards', completed: false, level: 'Beginner' },
          { id: 8, name: 'Identify your productivity peak hours', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Do weekly reviews on how you spend time', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Batch similar tasks', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Automate simple tasks', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create a habit tracker', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Study time management techniques', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Follow the 80/20 rule', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Plan your week on Sunday', completed: false, level: 'Professional' },
          { id: 16, name: 'Learn about atomic habits', completed: false, level: 'Professional' },
          { id: 17, name: 'Avoid time leaks for 5 days', completed: false, level: 'Professional' },
          { id: 18, name: 'Run time audits monthly', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach time management to others', completed: false, level: 'Professional' },
          { id: 20, name: 'Publish a discipline-building guide', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'mental-health',
        name: 'Mental Health Awareness',
        activities: [
          { id: 1, name: 'Learn signs of stress and anxiety', completed: false, level: 'Beginner' },
          { id: 2, name: 'Practice self-compassion daily', completed: false, level: 'Beginner' },
          { id: 3, name: 'Track your mood for a week', completed: false, level: 'Beginner' },
          { id: 4, name: 'Follow mental health creators online', completed: false, level: 'Beginner' },
          { id: 5, name: 'Join an awareness webinar', completed: false, level: 'Beginner' },
          { id: 6, name: 'Read about anxiety, depression, burnout', completed: false, level: 'Beginner' },
          { id: 7, name: 'Reduce stigma by talking openly', completed: false, level: 'Beginner' },
          { id: 8, name: 'Use affirmations for mental wellness', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Volunteer for mental health causes', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Maintain a mental health journal', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Share stories of healing', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Support someone seeking therapy', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Attend a support group', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Participate in mental health campaigns', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn about trauma healing', completed: false, level: 'Professional' },
          { id: 16, name: 'Practice mental health first aid', completed: false, level: 'Professional' },
          { id: 17, name: 'Promote mental health at work', completed: false, level: 'Professional' },
          { id: 18, name: 'Take a certified MH course', completed: false, level: 'Professional' },
          { id: 19, name: 'Mentor youth on awareness', completed: false, level: 'Professional' },
          { id: 20, name: 'Launch your own awareness campaign', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'physical',
    name: 'Physical',
    icon: BoltIcon,
    progress: 60,
    subcategories: [
      {
        id: 'exercise',
        name: 'Exercise & Movement',
        activities: [
          { id: 1, name: 'Stretch for 5 minutes after waking up', completed: false, level: 'Beginner' },
          { id: 2, name: 'Walk for 10 minutes', completed: false, level: 'Beginner' },
          { id: 3, name: 'Do 10 bodyweight squats', completed: false, level: 'Beginner' },
          { id: 4, name: 'Follow a 15-minute home workout video', completed: false, level: 'Beginner' },
          { id: 5, name: 'Walk 5,000 steps in a day', completed: false, level: 'Beginner' },
          { id: 6, name: 'Do 15 push-ups and 20 sit-ups', completed: false, level: 'Beginner' },
          { id: 7, name: 'Try basic yoga poses', completed: false, level: 'Beginner' },
          { id: 8, name: 'Attend a group fitness class', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Complete a 30-minute cardio session', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Try interval training (HIIT)', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Do a 5km jog or walk', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Learn proper warm-up and cool-down routines', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Follow a structured beginner workout program', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Incorporate resistance bands', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Join a local gym or online fitness program', completed: false, level: 'Professional' },
          { id: 16, name: 'Perform bodyweight circuits', completed: false, level: 'Professional' },
          { id: 17, name: 'Learn compound lifts (deadlift, squat, bench press)', completed: false, level: 'Professional' },
          { id: 18, name: 'Track personal records (PRs)', completed: false, level: 'Professional' },
          { id: 19, name: 'Compete in a local fitness challenge', completed: false, level: 'Professional' },
          { id: 20, name: 'Become a certified personal trainer or fitness coach', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'nutrition',
        name: 'Nutrition & Healthy Eating',
        activities: [
          { id: 1, name: 'Drink 6–8 glasses of water daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Replace one sugary snack with a fruit', completed: false, level: 'Beginner' },
          { id: 3, name: 'Eat a home-cooked meal', completed: false, level: 'Beginner' },
          { id: 4, name: 'Track one day of eating in a journal', completed: false, level: 'Beginner' },
          { id: 5, name: 'Eat a balanced breakfast for a week', completed: false, level: 'Beginner' },
          { id: 6, name: 'Avoid fast food for a week', completed: false, level: 'Beginner' },
          { id: 7, name: 'Try a new vegetable', completed: false, level: 'Beginner' },
          { id: 8, name: 'Read a nutrition label', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Prepare a healthy meal with proteins, carbs, and fats', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Reduce processed food intake for a week', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Plan your meals for three days', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Avoid sugary drinks for one week', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Calculate your daily caloric needs', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Follow a 7-day meal prep plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Study macronutrients and micronutrients', completed: false, level: 'Professional' },
          { id: 16, name: 'Balance your plate using the MyPlate method', completed: false, level: 'Professional' },
          { id: 17, name: 'Cook from a nutrition-focused recipe book', completed: false, level: 'Professional' },
          { id: 18, name: 'Meet with a dietitian', completed: false, level: 'Professional' },
          { id: 19, name: 'Track your macros using an app', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a personalized nutrition strategy', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'sleep',
        name: 'Sleep Hygiene',
        activities: [
          { id: 1, name: 'Go to bed at the same time for 3 days', completed: false, level: 'Beginner' },
          { id: 2, name: 'Wake up without an alarm on weekends', completed: false, level: 'Beginner' },
          { id: 3, name: 'Avoid screens 30 minutes before bed', completed: false, level: 'Beginner' },
          { id: 4, name: 'Use a sleep tracking app', completed: false, level: 'Beginner' },
          { id: 5, name: 'Create a wind-down routine (e.g., journaling, stretching)', completed: false, level: 'Beginner' },
          { id: 6, name: 'Limit caffeine after noon', completed: false, level: 'Beginner' },
          { id: 7, name: 'Maintain a dark, cool sleeping environment', completed: false, level: 'Beginner' },
          { id: 8, name: 'Reduce noise using white noise or earplugs', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Sleep 7+ hours for one week', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Avoid large meals before bedtime', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Read before bed instead of watching TV', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Remove electronic devices from the bedroom', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Take a warm shower before sleeping', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Limit naps to 20 minutes', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Track sleep trends weekly', completed: false, level: 'Professional' },
          { id: 16, name: 'Follow a 21-day sleep improvement challenge', completed: false, level: 'Professional' },
          { id: 17, name: 'Study the stages of sleep', completed: false, level: 'Professional' },
          { id: 18, name: 'Understand circadian rhythm cycles', completed: false, level: 'Professional' },
          { id: 19, name: 'Consult a sleep specialist if needed', completed: false, level: 'Professional' },
          { id: 20, name: 'Maintain consistent sleep patterns year-round', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'hydration',
        name: 'Hydration',
        activities: [
          { id: 1, name: 'Drink one full glass of water upon waking', completed: false, level: 'Beginner' },
          { id: 2, name: 'Carry a reusable water bottle', completed: false, level: 'Beginner' },
          { id: 3, name: 'Drink a glass of water before each meal', completed: false, level: 'Beginner' },
          { id: 4, name: 'Track water intake with an app', completed: false, level: 'Beginner' },
          { id: 5, name: 'Set a daily water goal (e.g., 2 liters)', completed: false, level: 'Beginner' },
          { id: 6, name: 'Add natural flavor (lemon, cucumber) to water', completed: false, level: 'Beginner' },
          { id: 7, name: 'Replace one soda per day with water', completed: false, level: 'Beginner' },
          { id: 8, name: 'Use a hydration reminder app', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Drink 8+ glasses of water consistently for a week', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Avoid alcohol for three consecutive days', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Observe effects of hydration on energy levels', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Educate yourself on dehydration symptoms', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Balance electrolytes with food and hydration', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Learn about water intake and physical activity', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Monitor urine color for hydration indicators', completed: false, level: 'Professional' },
          { id: 16, name: 'Hydrate during workouts', completed: false, level: 'Professional' },
          { id: 17, name: 'Compare water needs in different climates', completed: false, level: 'Professional' },
          { id: 18, name: 'Track water intake for a month', completed: false, level: 'Professional' },
          { id: 19, name: 'Understand hydration in athletic performance', completed: false, level: 'Professional' },
          { id: 20, name: 'Educate others on hydration best practices', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'health-checkups',
        name: 'Preventive Health Checkups',
        activities: [
          { id: 1, name: 'Schedule a routine dental check-up', completed: false, level: 'Beginner' },
          { id: 2, name: 'Get a general physical exam', completed: false, level: 'Beginner' },
          { id: 3, name: 'Check blood pressure at a pharmacy', completed: false, level: 'Beginner' },
          { id: 4, name: 'Research age-appropriate health screenings', completed: false, level: 'Beginner' },
          { id: 5, name: 'Visit an eye doctor for a vision check', completed: false, level: 'Beginner' },
          { id: 6, name: 'Track your BMI and understand the result', completed: false, level: 'Beginner' },
          { id: 7, name: 'Schedule an annual health exam', completed: false, level: 'Beginner' },
          { id: 8, name: 'Discuss family medical history with your doctor', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Perform monthly self-checks (breast/testicular)', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Maintain vaccination records', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Get a cholesterol test', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Track blood sugar once', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Keep a health journal', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Understand results from a blood panel', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Visit a specialist (e.g., dermatologist)', completed: false, level: 'Professional' },
          { id: 16, name: 'Ask about early cancer screenings', completed: false, level: 'Professional' },
          { id: 17, name: 'Educate yourself on insurance coverage for checkups', completed: false, level: 'Professional' },
          { id: 18, name: 'Compare your current vitals to past records', completed: false, level: 'Professional' },
          { id: 19, name: 'Set a yearly preventive health calendar', completed: false, level: 'Professional' },
          { id: 20, name: 'Organize a health screening camp in your community', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'posture',
        name: 'Posture & Ergonomics',
        activities: [
          { id: 1, name: 'Check your sitting posture at work', completed: false, level: 'Beginner' },
          { id: 2, name: 'Adjust screen height to eye level', completed: false, level: 'Beginner' },
          { id: 3, name: 'Use a lumbar support pillow', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice standing every 30 minutes', completed: false, level: 'Beginner' },
          { id: 5, name: 'Try seated core exercises', completed: false, level: 'Beginner' },
          { id: 6, name: 'Watch a posture correction video', completed: false, level: 'Beginner' },
          { id: 7, name: 'Adjust your chair for back support', completed: false, level: 'Beginner' },
          { id: 8, name: 'Use an anti-fatigue mat when standing', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Practice wall posture drills', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Do neck stretches daily', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Use a standing desk for 1 hour', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Perform shoulder blade pinches', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Assess posture with a mirror check', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Set daily ergonomic reminders', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a posture improvement plan', completed: false, level: 'Professional' },
          { id: 16, name: 'Attend a workplace ergonomics workshop', completed: false, level: 'Professional' },
          { id: 17, name: 'Learn about workstation design', completed: false, level: 'Professional' },
          { id: 18, name: 'Do foam rolling for spine health', completed: false, level: 'Professional' },
          { id: 19, name: 'Use ergonomic accessories (mouse, keyboard)', completed: false, level: 'Professional' },
          { id: 20, name: 'Build an ergonomic workstation setup', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'strength',
        name: 'Strength & Flexibility',
        activities: [
          { id: 1, name: 'Perform static stretching after a walk', completed: false, level: 'Beginner' },
          { id: 2, name: 'Learn dynamic stretches', completed: false, level: 'Beginner' },
          { id: 3, name: 'Hold a basic plank for 15 seconds', completed: false, level: 'Beginner' },
          { id: 4, name: 'Try a yoga stretch session on YouTube', completed: false, level: 'Beginner' },
          { id: 5, name: 'Increase push-up count over 7 days', completed: false, level: 'Beginner' },
          { id: 6, name: 'Perform resistance band exercises', completed: false, level: 'Beginner' },
          { id: 7, name: 'Use light dumbbells for curls and presses', completed: false, level: 'Beginner' },
          { id: 8, name: 'Try bodyweight lunges', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Hold a 1-minute plank', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Stretch hamstrings and shoulders daily', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Follow a flexibility challenge (e.g., 14 days)', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Improve full-body mobility through mobility drills', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Perform compound strength exercises weekly', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Increase squat and deadlift weights', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn gymnastic movements (pull-up, handstand)', completed: false, level: 'Professional' },
          { id: 16, name: 'Follow a hypertrophy program', completed: false, level: 'Professional' },
          { id: 17, name: 'Integrate powerlifting techniques', completed: false, level: 'Professional' },
          { id: 18, name: 'Track flexibility improvements with measurements', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach strength/flexibility classes', completed: false, level: 'Professional' },
          { id: 20, name: 'Train others professionally', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'breathing',
        name: 'Breathing Practices',
        activities: [
          { id: 1, name: 'Practice deep belly breathing', completed: false, level: 'Beginner' },
          { id: 2, name: 'Do a 4-7-8 breathing cycle', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a breathing technique video', completed: false, level: 'Beginner' },
          { id: 4, name: 'Do breathwork before bed', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn alternate nostril breathing (Nadi Shodhana)', completed: false, level: 'Beginner' },
          { id: 6, name: 'Practice morning energizing breath routines', completed: false, level: 'Beginner' },
          { id: 7, name: 'Use breathing to manage anxiety', completed: false, level: 'Beginner' },
          { id: 8, name: 'Combine breathing with guided meditation', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Track breath holding capacity', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Attend a breathwork workshop', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Learn Wim Hof breathing method', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Sync breathing with exercise', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Log breath rate changes during rest vs activity', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Learn to regulate breath during cardio', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Integrate breathwork into yoga practice', completed: false, level: 'Professional' },
          { id: 16, name: 'Monitor breath awareness throughout the day', completed: false, level: 'Professional' },
          { id: 17, name: 'Understand oxygen-CO2 balance', completed: false, level: 'Professional' },
          { id: 18, name: 'Study breath science and its effects on the nervous system', completed: false, level: 'Professional' },
          { id: 19, name: 'Guide others in group breathing sessions', completed: false, level: 'Professional' },
          { id: 20, name: 'Certify as a breath coach', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'weight',
        name: 'Body Weight Management',
        activities: [
          { id: 1, name: 'Record your current weight', completed: false, level: 'Beginner' },
          { id: 2, name: 'Set a realistic goal weight', completed: false, level: 'Beginner' },
          { id: 3, name: 'Take body measurements (waist, hips)', completed: false, level: 'Beginner' },
          { id: 4, name: 'Track calories for a week', completed: false, level: 'Beginner' },
          { id: 5, name: 'Avoid late-night snacking', completed: false, level: 'Beginner' },
          { id: 6, name: 'Reduce portion sizes', completed: false, level: 'Beginner' },
          { id: 7, name: 'Take stairs instead of elevators', completed: false, level: 'Beginner' },
          { id: 8, name: 'Practice mindful eating', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Walk daily after meals', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Replace sugary drinks with water', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Increase fiber intake', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Measure progress biweekly', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Join a group weight loss challenge', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Follow a balanced meal plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Work with a personal trainer', completed: false, level: 'Professional' },
          { id: 16, name: 'Address emotional eating patterns', completed: false, level: 'Professional' },
          { id: 17, name: 'Combine cardio + resistance workouts', completed: false, level: 'Professional' },
          { id: 18, name: 'Monitor body fat % (bioelectrical impedance)', completed: false, level: 'Professional' },
          { id: 19, name: 'Maintain a healthy weight for 6+ months', completed: false, level: 'Professional' },
          { id: 20, name: 'Mentor others on sustainable body management', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'recreation',
        name: 'Physical Recreation',
        activities: [
          { id: 1, name: 'Take a nature walk', completed: false, level: 'Beginner' },
          { id: 2, name: 'Go for a bicycle ride', completed: false, level: 'Beginner' },
          { id: 3, name: 'Play a casual sport with friends (e.g., badminton)', completed: false, level: 'Beginner' },
          { id: 4, name: 'Try jump rope for 5 minutes', completed: false, level: 'Beginner' },
          { id: 5, name: 'Join a dance class', completed: false, level: 'Beginner' },
          { id: 6, name: 'Do a weekend hike', completed: false, level: 'Beginner' },
          { id: 7, name: 'Try indoor rock climbing', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take a martial arts or boxing intro class', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Attend a fitness bootcamp', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Join a recreational sports league', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Participate in a charity run', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Train for a 5K or 10K', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Learn kayaking or paddleboarding', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Take parkour or obstacle training', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Play competitive team sports', completed: false, level: 'Professional' },
          { id: 16, name: 'Train in advanced dance or gymnastics', completed: false, level: 'Professional' },
          { id: 17, name: 'Enter a recreational competition', completed: false, level: 'Professional' },
          { id: 18, name: 'Plan a fitness vacation or retreat', completed: false, level: 'Professional' },
          { id: 19, name: 'Host a community sports event', completed: false, level: 'Professional' },
          { id: 20, name: 'Lead a local fitness group or camp', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: UserCircleIcon,
    progress: 50,
    subcategories: [
      {
        id: 'self-care',
        name: 'Self-Care & Wellbeing',
        activities: [
          { id: 1, name: 'Take a relaxing bath', completed: false, level: 'Beginner' },
          { id: 2, name: 'Practice good sleep hygiene', completed: false, level: 'Beginner' },
          { id: 3, name: 'Set personal boundaries', completed: false, level: 'Beginner' },
          { id: 4, name: 'Create a morning routine', completed: false, level: 'Beginner' },
          { id: 5, name: 'Practice saying no', completed: false, level: 'Beginner' },
          { id: 6, name: 'Take regular breaks', completed: false, level: 'Beginner' },
          { id: 7, name: 'Declutter your space', completed: false, level: 'Beginner' },
          { id: 8, name: 'Develop a self-care plan', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Create a personal sanctuary', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Practice digital detox', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Learn stress management', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Set up a self-care budget', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Create a wellness journal', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Develop healthy habits', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Become a wellness coach', completed: false, level: 'Professional' },
          { id: 16, name: 'Create self-care programs', completed: false, level: 'Professional' },
          { id: 17, name: 'Lead wellness workshops', completed: false, level: 'Professional' },
          { id: 18, name: 'Develop wellness products', completed: false, level: 'Professional' },
          { id: 19, name: 'Research wellness trends', completed: false, level: 'Professional' },
          { id: 20, name: 'Create a wellness brand', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: BriefcaseIcon,
    progress: 70,
    subcategories: [
      {
        id: 'career',
        name: 'Career Development',
        activities: [
          { id: 1, name: 'Update your resume', completed: false, level: 'Beginner' },
          { id: 2, name: 'Set career goals', completed: false, level: 'Beginner' },
          { id: 3, name: 'Research job opportunities', completed: false, level: 'Beginner' },
          { id: 4, name: 'Create a LinkedIn profile', completed: false, level: 'Beginner' },
          { id: 5, name: 'Practice interview skills', completed: false, level: 'Beginner' },
          { id: 6, name: 'Learn a new software tool', completed: false, level: 'Beginner' },
          { id: 7, name: 'Attend a networking event', completed: false, level: 'Beginner' },
          { id: 8, name: 'Develop a career plan', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Build a professional portfolio', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Take a professional course', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Join a professional association', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Find a mentor', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Develop leadership skills', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a personal brand', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Get professional certification', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a business', completed: false, level: 'Professional' },
          { id: 17, name: 'Become a mentor', completed: false, level: 'Professional' },
          { id: 18, name: 'Lead professional workshops', completed: false, level: 'Professional' },
          { id: 19, name: 'Publish professional articles', completed: false, level: 'Professional' },
          { id: 20, name: 'Develop training programs', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: CurrencyDollarIcon,
    progress: 40,
    subcategories: [
      {
        id: 'money',
        name: 'Financial Management',
        activities: [
          { id: 1, name: 'Create a budget', completed: false, level: 'Beginner' },
          { id: 2, name: 'Track daily expenses', completed: false, level: 'Beginner' },
          { id: 3, name: 'Set up automatic savings', completed: false, level: 'Beginner' },
          { id: 4, name: 'Review bank statements', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn about credit scores', completed: false, level: 'Beginner' },
          { id: 6, name: 'Create an emergency fund', completed: false, level: 'Beginner' },
          { id: 7, name: 'Pay off small debts', completed: false, level: 'Beginner' },
          { id: 8, name: 'Develop an investment plan', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Learn about retirement accounts', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Create a debt repayment plan', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Research investment options', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Set financial goals', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Learn about taxes', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a financial plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Get financial certification', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a financial blog', completed: false, level: 'Professional' },
          { id: 17, name: 'Become a financial advisor', completed: false, level: 'Professional' },
          { id: 18, name: 'Create financial courses', completed: false, level: 'Professional' },
          { id: 19, name: 'Develop investment strategies', completed: false, level: 'Professional' },
          { id: 20, name: 'Start a financial business', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'social',
    name: 'Social',
    icon: UsersIcon,
    progress: 65,
    subcategories: [
      {
        id: 'relationships',
        name: 'Relationships & Community',
        activities: [
          { id: 1, name: 'Call a friend or family member', completed: false, level: 'Beginner' },
          { id: 2, name: 'Join a social group', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice active listening', completed: false, level: 'Beginner' },
          { id: 4, name: 'Attend a community event', completed: false, level: 'Beginner' },
          { id: 5, name: 'Volunteer for a cause', completed: false, level: 'Beginner' },
          { id: 6, name: 'Practice gratitude in relationships', completed: false, level: 'Beginner' },
          { id: 7, name: 'Set healthy boundaries', completed: false, level: 'Beginner' },
          { id: 8, name: 'Develop communication skills', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Join a support group', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Practice conflict resolution', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Build a professional network', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Learn about different cultures', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Develop empathy skills', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a social support plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Become a community leader', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a social initiative', completed: false, level: 'Professional' },
          { id: 17, name: 'Lead social workshops', completed: false, level: 'Professional' },
          { id: 18, name: 'Create community programs', completed: false, level: 'Professional' },
          { id: 19, name: 'Develop social skills curriculum', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a social enterprise', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: UserCircleIcon,
    progress: 0,
    subcategories: [
      {
        id: 'family-bonding',
        name: 'Family Bonding',
        activities: [
          { id: 1, name: 'Call a family member just to talk', completed: false, level: 'Beginner' },
          { id: 2, name: 'Share a meal with family', completed: false, level: 'Beginner' },
          { id: 3, name: 'Ask about a family story', completed: false, level: 'Beginner' },
          { id: 4, name: 'Write a note of appreciation', completed: false, level: 'Beginner' },
          { id: 5, name: 'Watch a family movie together', completed: false, level: 'Beginner' },
          { id: 6, name: 'Schedule weekly family time', completed: false, level: 'Beginner' },
          { id: 7, name: 'Create a family group chat', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take a family photo', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Plan a small family outing', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Cook a meal with a family member', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Start a shared hobby or game', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Host a family gratitude circle', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Organize a mini family reunion', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a family vision board', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn your family tree', completed: false, level: 'Professional' },
          { id: 16, name: 'Plan a surprise for a relative', completed: false, level: 'Professional' },
          { id: 17, name: 'Have a tech-free family day', completed: false, level: 'Professional' },
          { id: 18, name: 'Address a long-standing issue with empathy', completed: false, level: 'Professional' },
          { id: 19, name: 'Write a family newsletter', completed: false, level: 'Professional' },
          { id: 20, name: 'Facilitate a family traditions revival', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'romantic-relationships',
        name: 'Romantic Relationships',
        activities: [
          { id: 1, name: 'Send a thoughtful message or compliment', completed: false, level: 'Beginner' },
          { id: 2, name: 'Have a no-device dinner', completed: false, level: 'Beginner' },
          { id: 3, name: 'Express appreciation daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Go on a walk together', completed: false, level: 'Beginner' },
          { id: 5, name: 'Share your love languages', completed: false, level: 'Beginner' },
          { id: 6, name: 'Write a handwritten note', completed: false, level: 'Beginner' },
          { id: 7, name: 'Plan a simple surprise date', completed: false, level: 'Beginner' },
          { id: 8, name: 'Share a personal story', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Do a relationship check-in', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Explore a new hobby as a couple', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Cook or build something together', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Read a relationship book', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Set shared relationship goals', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Resolve a conflict calmly', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Try couple meditation', completed: false, level: 'Professional' },
          { id: 16, name: 'Attend a relationship workshop', completed: false, level: 'Professional' },
          { id: 17, name: 'Volunteer together', completed: false, level: 'Professional' },
          { id: 18, name: 'Celebrate milestones creatively', completed: false, level: 'Professional' },
          { id: 19, name: 'Create a shared vision board', completed: false, level: 'Professional' },
          { id: 20, name: 'Mentor younger couples together', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'parenting-childcare',
        name: 'Parenting & Childcare',
        activities: [
          { id: 1, name: 'Spend 10 uninterrupted minutes playing', completed: false, level: 'Beginner' },
          { id: 2, name: 'Read a story to your child', completed: false, level: 'Beginner' },
          { id: 3, name: 'Learn about their favorite interests', completed: false, level: 'Beginner' },
          { id: 4, name: 'Create a daily routine chart', completed: false, level: 'Beginner' },
          { id: 5, name: 'Pack a lunch with a loving note', completed: false, level: 'Beginner' },
          { id: 6, name: 'Use positive reinforcement', completed: false, level: 'Beginner' },
          { id: 7, name: 'Introduce a gratitude ritual', completed: false, level: 'Beginner' },
          { id: 8, name: 'Teach them one life skill', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Take them on a one-on-one outing', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Limit screen time together', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Journal your parenting wins and challenges', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Attend a parenting seminar or webinar', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Involve them in family decisions', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Encourage curiosity and questions', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Establish healthy boundaries', completed: false, level: 'Professional' },
          { id: 16, name: 'Share childhood stories with them', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach emotional expression', completed: false, level: 'Professional' },
          { id: 18, name: 'Practice conscious/intentional parenting', completed: false, level: 'Professional' },
          { id: 19, name: 'Create a legacy scrapbook together', completed: false, level: 'Professional' },
          { id: 20, name: 'Mentor other parents', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'self-care',
        name: 'Self-Care Routines',
        activities: [
          { id: 1, name: 'Get 7–8 hours of sleep', completed: false, level: 'Beginner' },
          { id: 2, name: 'Drink water after waking', completed: false, level: 'Beginner' },
          { id: 3, name: 'Take a relaxing bath or shower', completed: false, level: 'Beginner' },
          { id: 4, name: 'Take a mindful walk alone', completed: false, level: 'Beginner' },
          { id: 5, name: 'Set a tech-free evening', completed: false, level: 'Beginner' },
          { id: 6, name: 'Journal your self-care needs', completed: false, level: 'Beginner' },
          { id: 7, name: 'Establish a morning routine', completed: false, level: 'Beginner' },
          { id: 8, name: 'Create a calming nighttime ritual', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Schedule a "me" hour weekly', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Say no to unnecessary obligations', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Plan a solo date or hobby time', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Visit a spa or wellness center', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Read a self-care book', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Identify and replace draining habits', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Build a personalized care plan', completed: false, level: 'Professional' },
          { id: 16, name: 'Try a digital detox weekend', completed: false, level: 'Professional' },
          { id: 17, name: 'Learn skincare or grooming basics', completed: false, level: 'Professional' },
          { id: 18, name: 'Create a DIY self-care kit', completed: false, level: 'Professional' },
          { id: 19, name: 'Celebrate personal wins', completed: false, level: 'Professional' },
          { id: 20, name: 'Host a self-care workshop', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'personal-boundaries',
        name: 'Personal Boundaries',
        activities: [
          { id: 1, name: 'Say "no" to something small', completed: false, level: 'Beginner' },
          { id: 2, name: 'Reflect on your energy drains', completed: false, level: 'Beginner' },
          { id: 3, name: 'Identify your comfort zones', completed: false, level: 'Beginner' },
          { id: 4, name: 'Write your boundary priorities', completed: false, level: 'Beginner' },
          { id: 5, name: 'Discuss one boundary with someone close', completed: false, level: 'Beginner' },
          { id: 6, name: 'Avoid overcommitting for a week', completed: false, level: 'Beginner' },
          { id: 7, name: 'Practice setting a time boundary', completed: false, level: 'Beginner' },
          { id: 8, name: 'Create a boundaries checklist', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Respond instead of react when pushed', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Communicate a boundary clearly', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Learn about assertiveness', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Share boundaries in a group setting', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Read books on emotional boundaries', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Journal about boundary violations', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Use "I feel" statements', completed: false, level: 'Professional' },
          { id: 16, name: 'Develop a support script', completed: false, level: 'Professional' },
          { id: 17, name: 'Visualize boundary enforcement', completed: false, level: 'Professional' },
          { id: 18, name: 'Role-play boundary scenarios', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach someone about boundaries', completed: false, level: 'Professional' },
          { id: 20, name: 'Create a boundary coaching module', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'relationship-communication',
        name: 'Relationship Communication',
        activities: [
          { id: 1, name: 'Listen without interrupting', completed: false, level: 'Beginner' },
          { id: 2, name: 'Use open-ended questions', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice active listening daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Reflect back what others say', completed: false, level: 'Beginner' },
          { id: 5, name: 'Avoid "you" accusations in arguments', completed: false, level: 'Beginner' },
          { id: 6, name: 'Express feelings with vulnerability', completed: false, level: 'Beginner' },
          { id: 7, name: 'Write a heartfelt letter', completed: false, level: 'Beginner' },
          { id: 8, name: 'Try a weekly check-in ritual', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Join a communication skills class', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Understand nonverbal cues', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Learn conflict de-escalation techniques', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Use humor mindfully', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Acknowledge others\' needs and triggers', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Mediate a simple conflict', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Teach empathetic communication', completed: false, level: 'Professional' },
          { id: 16, name: 'Practice radical honesty (with safety)', completed: false, level: 'Professional' },
          { id: 17, name: 'Lead a communication circle', completed: false, level: 'Professional' },
          { id: 18, name: 'Read about conscious communication', completed: false, level: 'Professional' },
          { id: 19, name: 'Co-develop communication rules at home', completed: false, level: 'Professional' },
          { id: 20, name: 'Run a workshop on mindful dialogue', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'self-reflection',
        name: 'Self-Reflection & Growth',
        activities: [
          { id: 1, name: 'Answer one reflection question', completed: false, level: 'Beginner' },
          { id: 2, name: 'Journal your mood daily', completed: false, level: 'Beginner' },
          { id: 3, name: 'Create a list of personal strengths', completed: false, level: 'Beginner' },
          { id: 4, name: 'Acknowledge a personal challenge', completed: false, level: 'Beginner' },
          { id: 5, name: 'Write a letter to your future self', completed: false, level: 'Beginner' },
          { id: 6, name: 'Ask for feedback', completed: false, level: 'Beginner' },
          { id: 7, name: 'Take a personality test', completed: false, level: 'Beginner' },
          { id: 8, name: 'Identify core values', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Reflect on a recent decision', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Create a personal growth journal', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Study a personal growth book', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Track your emotional patterns', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Develop a personal mantra', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Set a 30-day growth challenge', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Review your life quarterly', completed: false, level: 'Professional' },
          { id: 16, name: 'Work with a life coach', completed: false, level: 'Professional' },
          { id: 17, name: 'Facilitate reflection groups', completed: false, level: 'Professional' },
          { id: 18, name: 'Map your growth journey visually', completed: false, level: 'Professional' },
          { id: 19, name: 'Build a growth-based content series', completed: false, level: 'Professional' },
          { id: 20, name: 'Develop your own self-reflection guide', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'hobbies-passions',
        name: 'Hobbies & Passions',
        activities: [
          { id: 1, name: 'Make a list of things you love doing', completed: false, level: 'Beginner' },
          { id: 2, name: 'Try a new hobby for one hour', completed: false, level: 'Beginner' },
          { id: 3, name: 'Revisit a past interest', completed: false, level: 'Beginner' },
          { id: 4, name: 'Buy materials for a creative hobby', completed: false, level: 'Beginner' },
          { id: 5, name: 'Set aside hobby time weekly', completed: false, level: 'Beginner' },
          { id: 6, name: 'Follow a tutorial or how-to video', completed: false, level: 'Beginner' },
          { id: 7, name: 'Share your hobby online', completed: false, level: 'Beginner' },
          { id: 8, name: 'Join a local club or class', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Host a hobby night with friends', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Teach your hobby to someone', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Read a book about your passion', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Challenge yourself to improve at it', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Document your progress', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Attend a hobby-based event', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create content around your passion', completed: false, level: 'Professional' },
          { id: 16, name: 'Monetize a passion project', completed: false, level: 'Professional' },
          { id: 17, name: 'Build a portfolio or display', completed: false, level: 'Professional' },
          { id: 18, name: 'Coach others in your skill', completed: false, level: 'Professional' },
          { id: 19, name: 'Collaborate with other hobbyists', completed: false, level: 'Professional' },
          { id: 20, name: 'Launch a hobby-based community', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'home-environment',
        name: 'Home Environment Organization',
        activities: [
          { id: 1, name: 'Make your bed every morning', completed: false, level: 'Beginner' },
          { id: 2, name: 'Clear one cluttered surface', completed: false, level: 'Beginner' },
          { id: 3, name: 'Declutter one drawer', completed: false, level: 'Beginner' },
          { id: 4, name: 'Clean your room mindfully', completed: false, level: 'Beginner' },
          { id: 5, name: 'Light a candle or incense', completed: false, level: 'Beginner' },
          { id: 6, name: 'Organize your digital space', completed: false, level: 'Beginner' },
          { id: 7, name: 'Create a dedicated work or peace area', completed: false, level: 'Beginner' },
          { id: 8, name: 'Display one item that inspires joy', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Clean with relaxing music', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Set a 15-minute tidy-up timer', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Implement a weekly cleaning routine', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Read about feng shui or home flow', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Rearrange furniture for better flow', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Use storage creatively', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a "no-clutter" zone', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a seasonal decluttering ritual', completed: false, level: 'Professional' },
          { id: 17, name: 'Host a minimalism challenge', completed: false, level: 'Professional' },
          { id: 18, name: 'Redesign a corner to reflect your goals', completed: false, level: 'Professional' },
          { id: 19, name: 'Add personalized decor with meaning', completed: false, level: 'Professional' },
          { id: 20, name: 'Teach space organization to others', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'emotional-connection',
        name: 'Emotional Connection with Loved Ones',
        activities: [
          { id: 1, name: 'Hug someone for 10+ seconds', completed: false, level: 'Beginner' },
          { id: 2, name: 'Say "I love you" more often', completed: false, level: 'Beginner' },
          { id: 3, name: 'Share a meaningful memory', completed: false, level: 'Beginner' },
          { id: 4, name: 'Give a genuine compliment', completed: false, level: 'Beginner' },
          { id: 5, name: 'Write a letter of appreciation', completed: false, level: 'Beginner' },
          { id: 6, name: 'Plan a spontaneous outing', completed: false, level: 'Beginner' },
          { id: 7, name: 'Discuss dreams and fears', completed: false, level: 'Beginner' },
          { id: 8, name: 'Apologize sincerely when needed', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Offer emotional support', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Do a check-in call or visit', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Create a "You Matter" gift', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Celebrate their achievements', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Start a connection ritual', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Learn their love language', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Share what you admire in them', completed: false, level: 'Professional' },
          { id: 16, name: 'Do a gratitude exchange', completed: false, level: 'Professional' },
          { id: 17, name: 'Create a memory scrapbook', completed: false, level: 'Professional' },
          { id: 18, name: 'Resolve an old misunderstanding', completed: false, level: 'Professional' },
          { id: 19, name: 'Record joint video messages', completed: false, level: 'Professional' },
          { id: 20, name: 'Facilitate a family or friends\' connection circle', completed: false, level: 'Professional' }
        ]
      }
    ]
  }
]

const helpRequests = [
  {
    id: 1,
    title: 'Need help with meditation practice',
    category: 'Spiritual',
    description: 'Looking for a meditation buddy to practice together',
    karmaPoints: 50,
    status: 'Open',
  },
  {
    id: 2,
    title: 'Seeking financial advice',
    category: 'Financial',
    description: 'Need guidance on investment strategies',
    karmaPoints: 100,
    status: 'Open',
  },
]

const helpOffers = [
  {
    id: 1,
    title: 'Offering fitness coaching',
    category: 'Physical',
    description: 'Free personal training sessions for beginners',
    karmaPoints: 75,
    status: 'Available',
  },
  {
    id: 2,
    title: 'Professional mentoring',
    category: 'Professional',
    description: 'Career guidance and resume review',
    karmaPoints: 150,
    status: 'Available',
  },
]

export default function Activities() {
  const [activeTab, setActiveTab] = useState('spokes')
  const [selectedSpoke, setSelectedSpoke] = useState<typeof spokes[0] | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)

  // Initialize the view with the first subcategory of the selected spoke
  const initializeSpoke = (spokeName: string) => {
    const spoke = spokes.find(s => s.name === spokeName)
    if (spoke) {
      setSelectedSpoke(spoke)
      setSelectedSubcategory(spoke.subcategories[0])
    }
  }

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Activities</h1>
        </div>

        {/* Horizontal Menu Bar */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex overflow-x-auto">
            {[
              'Help Others',
              'Spiritual',
              'Mental',
              'Physical',
              'Personal',
              'Professional',
              'Financial',
              'Social',
            ].map((item) => (
              <button
                key={item}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                  selectedSpoke?.name === item || (item === 'Help Others' && selectedSpoke === null)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => {
                  if (item === 'Help Others') {
                    setSelectedSpoke(null)
                    setSelectedSubcategory(null)
                  } else {
                    initializeSpoke(item)
                  }
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {selectedSpoke === null ? (
          <div className="space-y-8">
            {/* Help Requests */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Help Requests</h2>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Create Request
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {helpRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium">{request.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {request.karmaPoints} KP
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {request.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                        {request.category}
                      </span>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Offer Help
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Offers */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Help Offers</h2>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Create Offer
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {helpOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium">{offer.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {offer.karmaPoints} KP
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {offer.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                        {offer.category}
                      </span>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Request Help
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Subcategories Sidebar */}
            <div className="col-span-3 bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {selectedSpoke.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedSubcategory?.id === subcategory.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSubcategorySelect(subcategory)}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities List */}
            <div className="col-span-9 bg-white rounded-lg shadow-sm p-6">
              {selectedSubcategory && (
                <>
                  <h2 className="text-2xl font-semibold mb-6">{selectedSubcategory.name}</h2>
                  <div className="space-y-6">
                    {['Beginner', 'Intermediate', 'Professional'].map((level) => (
                      <div key={level}>
                        <h3 className="text-lg font-medium mb-4">{level}</h3>
                        <div className="grid gap-4">
                          {selectedSubcategory.activities
                            .filter((activity) => activity.level === level)
                            .map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center space-x-4">
                                  <input
                                    type="checkbox"
                                    checked={activity.completed}
                                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    onChange={() => {
                                      // TODO: Implement activity completion logic
                                    }}
                                  />
                                  <span className="text-gray-700">{activity.name}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 