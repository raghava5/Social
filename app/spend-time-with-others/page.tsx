'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  UsersIcon,
  HeartIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  SparklesIcon,
  HandRaisedIcon,
  GlobeAltIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PhotoIcon,
  ClockIcon,
  BoltIcon,
  UserIcon
} from '@heroicons/react/24/outline'

// Types
type Mission = {
  id: number
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  participants: number
  completions: number
  image?: string
  category: 'Daily' | 'Weekly' | 'Community' | 'Spotlight'
  tags: string[]
  duration: string
}

type Quest = {
  id: number
  title: string
  description: string
  steps: number
  completedSteps: number
  participants: number
  category: string
  location?: string
  date?: string
  impact: string
  image?: string
}

type Meetup = {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  host: string
  attendees: number
  maxAttendees?: number
  values: string[]
  image?: string
}

type Experience = {
  id: number
  title: string
  description: string
  category: string
  date: string
  time: string
  location: string
  host: string
  attendees: number
  maxAttendees: number
  cost: string
  image?: string
}

// Sample data
const empathyMissions: Mission[] = [
  {
    id: 1,
    title: "Buy Coffee for a Neighbor",
    description: "Surprise a neighbor with their favorite coffee or tea. Take a moment to chat and connect.",
    difficulty: "Easy",
    participants: 237,
    completions: 189,
    category: "Daily",
    tags: ["Kindness", "Community", "Connection"],
    duration: "15-30 minutes"
  },
  {
    id: 2,
    title: "Leave Uplifting Notes in Public",
    description: "Create and place positive notes in your local park, library, or community center.",
    difficulty: "Easy",
    participants: 156,
    completions: 132,
    category: "Daily",
    tags: ["Creativity", "Positivity", "Community"],
    duration: "30-45 minutes"
  },
  {
    id: 3,
    title: "Help Someone with Groceries",
    description: "Offer to help carry groceries for an elderly person or someone who could use assistance.",
    difficulty: "Medium",
    participants: 89,
    completions: 72,
    category: "Weekly",
    tags: ["Assistance", "Elderly", "Community"],
    duration: "15-45 minutes"
  },
  {
    id: 4,
    title: "Community Garden Session",
    description: "Join others at a local community garden to plant, weed, or harvest together.",
    difficulty: "Medium",
    participants: 124,
    completions: 98,
    category: "Community",
    tags: ["Nature", "Teamwork", "Sustainability"],
    duration: "1-2 hours"
  },
  {
    id: 5,
    title: "Organize a Neighborhood Cleanup",
    description: "Gather neighbors to clean up a local park, street, or community space together.",
    difficulty: "Hard",
    participants: 76,
    completions: 42,
    category: "Spotlight",
    tags: ["Environment", "Leadership", "Community"],
    duration: "2-3 hours"
  },
  {
    id: 6,
    title: "Tech Help for Seniors",
    description: "Offer your tech skills to help seniors with phone, computer, or internet questions.",
    difficulty: "Medium",
    participants: 93,
    completions: 81,
    category: "Weekly",
    tags: ["Technology", "Assistance", "Elderly"],
    duration: "1 hour"
  }
];

const kindnessQuests: Quest[] = [
  {
    id: 1,
    title: "Neighborhood Cleanup Initiative",
    description: "Organize a team to clean up litter in your local park or streets, making your neighborhood a cleaner and safer place.",
    steps: 5,
    completedSteps: 2,
    participants: 18,
    category: "Environment",
    location: "Riverside Park",
    date: "June 15, 2024",
    impact: "240 pounds of litter collected",
    image: ""
  },
  {
    id: 2,
    title: "Community Charity Bake Sale",
    description: "Plan and execute a bake sale with proceeds going to your local food bank. Connect with neighbors while raising funds for a good cause.",
    steps: 6,
    completedSteps: 1,
    participants: 12,
    category: "Fundraising",
    location: "Community Center",
    date: "July 2, 2024",
    impact: "$850 raised for local food bank",
    image: ""
  },
  {
    id: 3,
    title: "Animal Shelter Support Day",
    description: "Gather supplies and volunteer at your local animal shelter. Help with walking dogs, socializing cats, or shelter maintenance.",
    steps: 4,
    completedSteps: 0,
    participants: 9,
    category: "Animal Welfare",
    location: "Happy Paws Shelter",
    date: "June 20, 2024",
    impact: "Support for 45+ shelter animals",
    image: ""
  },
  {
    id: 4,
    title: "Senior Center Tech Help",
    description: "Organize a day where volunteers help seniors with technology questions, from setting up email to video calling family members.",
    steps: 3,
    completedSteps: 3,
    participants: 14,
    category: "Education",
    location: "Golden Years Center",
    date: "July 8, 2024",
    impact: "Assisted 32 seniors with technology",
    image: ""
  }
];

const valuesMeetups: Meetup[] = [
  {
    id: 1,
    title: "Environmental Stewardship Hike",
    description: "Join fellow nature lovers for a guided hike while discussing ways to protect our local environment. Bring water and comfortable shoes!",
    date: "June 18, 2024",
    time: "9:00 AM - 11:30 AM",
    location: "Redwood Trail, City Park",
    host: "Green Guardians",
    attendees: 12,
    maxAttendees: 20,
    values: ["Environmental Sustainability", "Appreciation of Nature", "Active Lifestyle"]
  },
  {
    id: 2,
    title: "Intergenerational Story Circle",
    description: "Bridge the generation gap through storytelling. Seniors and youth will share life experiences and perspectives in a supportive environment.",
    date: "June 20, 2024",
    time: "4:00 PM - 6:00 PM",
    location: "Community Library, Meeting Room 2",
    host: "Bridge Builders Community",
    attendees: 8,
    maxAttendees: 16,
    values: ["Intergenerational Connections", "Wisdom Sharing", "Active Listening"]
  },
  {
    id: 3,
    title: "Mindful Cooking Workshop",
    description: "Learn to prepare healthy meals while practicing mindfulness. We'll explore the connection between conscientious eating and personal well-being.",
    date: "June 25, 2024",
    time: "6:30 PM - 8:30 PM",
    location: "Wellness Kitchen Studio",
    host: "Mindful Chefs Collective",
    attendees: 15,
    maxAttendees: 18,
    values: ["Mindful Living", "Healthy Lifestyle", "Sustainable Food Choices"]
  },
  {
    id: 4,
    title: "Volunteer Skills Exchange",
    description: "Connect with others passionate about volunteering. Share your skills, learn new ones, and find opportunities to make a difference together.",
    date: "July 2, 2024",
    time: "5:30 PM - 7:30 PM",
    location: "Hope Community Center",
    host: "Volunteer Alliance",
    attendees: 22,
    maxAttendees: 30,
    values: ["Community Service", "Skill Sharing", "Collective Impact"]
  },
  {
    id: 5,
    title: "Cultural Heritage Celebration",
    description: "Celebrate diverse cultural traditions through shared stories, music, and food. Bring a dish or cultural item that represents your heritage.",
    date: "July 8, 2024",
    time: "12:00 PM - 3:00 PM",
    location: "Multicultural Center Plaza",
    host: "Unity in Diversity Network",
    attendees: 28,
    maxAttendees: 50,
    values: ["Cultural Appreciation", "Diversity", "Global Citizenship"]
  }
];

const sharedExperiences: Experience[] = [
  {
    id: 1,
    title: "Community Garden Workshop",
    description: "Learn organic gardening techniques while helping to maintain the community garden. All experience levels welcome!",
    category: "Gardening",
    date: "June 19, 2024",
    time: "10:00 AM - 12:30 PM",
    location: "Urban Roots Community Garden",
    host: "Master Gardener Association",
    attendees: 8,
    maxAttendees: 15,
    cost: "Free",
    image: ""
  },
  {
    id: 2,
    title: "Art for Kindness Workshop",
    description: "Create art pieces with positive messages to be displayed throughout the community. Supplies provided!",
    category: "Arts & Crafts",
    date: "June 22, 2024",
    time: "2:00 PM - 4:30 PM",
    location: "Creative Commons Studio",
    host: "Art Matters Collective",
    attendees: 12,
    maxAttendees: 20,
    cost: "$5 materials fee",
    image: ""
  },
  {
    id: 3,
    title: "Neighborhood Potluck Dinner",
    description: "Meet your neighbors over a shared meal. Bring a dish that represents your cultural heritage or favorite recipe.",
    category: "Food & Culture",
    date: "June 28, 2024",
    time: "6:00 PM - 8:30 PM",
    location: "Maple Street Park Pavilion",
    host: "Neighborhood Association",
    attendees: 34,
    maxAttendees: 50,
    cost: "Free (bring a dish)",
    image: ""
  },
  {
    id: 4,
    title: "Photography Walk: Urban Nature",
    description: "Discover hidden nature in our urban environment while learning photography tips. Bring your camera or smartphone.",
    category: "Photography",
    date: "July 3, 2024",
    time: "9:00 AM - 11:00 AM",
    location: "City Center (meet at the fountain)",
    host: "Urban Explorers Photography Club",
    attendees: 9,
    maxAttendees: 12,
    cost: "Free",
    image: ""
  },
  {
    id: 5,
    title: "Board Game Social",
    description: "Connect with others over classic and modern board games. Games provided, but feel free to bring your favorites!",
    category: "Games",
    date: "July 5, 2024",
    time: "7:00 PM - 10:00 PM",
    location: "Community Center, Room 103",
    host: "Tabletop Games Group",
    attendees: 16,
    maxAttendees: 24,
    cost: "$3 suggested donation",
    image: ""
  }
];

// Additional tabs for Support Circles, Living Beings, and Reconnection sections
const additionalTabs = [
  {
    id: 'support',
    name: 'Support Circles',
    icon: ChatBubbleLeftRightIcon
  },
  {
    id: 'living-beings',
    name: 'Living Beings',
    icon: GlobeAltIcon
  },
  {
    id: 'reconnection',
    name: 'Reconnection',
    icon: ArrowPathIcon
  }
];

export default function SpendTimeWithOthersPage() {
  const [activeTab, setActiveTab] = useState('empathy')
  const [selectedMissionCategory, setSelectedMissionCategory] = useState<string>('all')
  const [selectedQuestCategory, setSelectedQuestCategory] = useState<string>('all')
  const [selectedValueTag, setSelectedValueTag] = useState<string>('all')
  const [selectedExperienceCategory, setSelectedExperienceCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showMoreTabs, setShowMoreTabs] = useState(false)

  // Filter missions by category and search term
  const filteredMissions = empathyMissions.filter(mission => 
    (selectedMissionCategory === 'all' || mission.category.toLowerCase() === selectedMissionCategory.toLowerCase()) &&
    (mission.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     mission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     mission.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  // Filter quests by category and search term
  const filteredQuests = kindnessQuests.filter(quest => 
    (selectedQuestCategory === 'all' || quest.category.toLowerCase() === selectedQuestCategory.toLowerCase()) &&
    (quest.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     quest.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Filter meetups by value tag and search term
  const filteredMeetups = valuesMeetups.filter(meetup => 
    (selectedValueTag === 'all' || meetup.values.some(val => val.toLowerCase().includes(selectedValueTag.toLowerCase()))) &&
    (searchTerm === '' || 
     meetup.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     meetup.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     meetup.values.some(val => val.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  // Filter experiences by category and search term
  const filteredExperiences = sharedExperiences.filter(exp => 
    (selectedExperienceCategory === 'all' || exp.category.toLowerCase().includes(selectedExperienceCategory.toLowerCase())) &&
    (searchTerm === '' || 
     exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     exp.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const allValueTags = Array.from(new Set(valuesMeetups.flatMap(meetup => meetup.values)))
  const allExperienceCategories = Array.from(new Set(sharedExperiences.map(exp => exp.category)))

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Spend Time with Others</h1>
          <p className="mt-2 text-gray-600">
            Meaningful connection experiences to address social isolation, strengthen empathy, and co-create positive change
          </p>
        </div>
        
        {/* Main Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="bg-white inline-flex rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('empathy')}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'empathy'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              Empathy Missions
            </button>
            <button
              onClick={() => setActiveTab('kindness')}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'kindness'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              Kindness Quests
            </button>
            <button
              onClick={() => setActiveTab('meetups')}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'meetups'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              Values-Aligned Meetups
            </button>
            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'experiences'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600'
              }`}
            >
              Shared Experiences
            </button>
            
            {showMoreTabs && additionalTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600'
                }`}
              >
                {tab.name}
              </button>
            ))}
            
            <button 
              onClick={() => setShowMoreTabs(!showMoreTabs)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600"
            >
              {showMoreTabs ? '< Less' : 'More >'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'empathy' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Empathy Missions</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search missions..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2 border rounded-lg bg-white"
                  value={selectedMissionCategory}
                  onChange={(e) => setSelectedMissionCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="daily">Daily Missions</option>
                  <option value="weekly">Weekly Missions</option>
                  <option value="community">Community Missions</option>
                  <option value="spotlight">Spotlight Missions</option>
                </select>
              </div>
            </div>

            {/* Your Empathy Score */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your Empathy Score</h3>
                  <p className="text-gray-600">Track your impact through completed missions</p>
                </div>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-2xl font-bold text-blue-600">78</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Level 3: Compassion Builder</p>
                    <div className="w-36 h-2 bg-gray-200 rounded-full mt-1">
                      <div className="w-3/4 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">22 points to Level 4</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredMissions.map(mission => (
                <div key={mission.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        mission.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                        mission.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {mission.difficulty}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {mission.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{mission.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{mission.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mission.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>{mission.participants} participants</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{mission.duration}</span>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Join this Mission
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Community Highlights */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <p className="font-medium">Sarah & Michael</p>
                      <p className="text-xs text-gray-500">Completed "Buy Coffee for a Neighbor"</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    "We bought coffee for our elderly neighbor and ended up spending an hour hearing amazing stories about our neighborhood's history!"
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <p className="font-medium">The Martin Family</p>
                      <p className="text-xs text-gray-500">Completed "Community Garden Session"</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    "Our kids learned so much about growing food, and we met three new families who live just blocks away!"
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <p className="font-medium">Tech Helpers Club</p>
                      <p className="text-xs text-gray-500">Completed "Tech Help for Seniors"</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    "We helped 12 seniors set up video calls to connect with their families. The smiles were priceless!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kindness' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Kindness Quests: Community Projects</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search quests..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2 border rounded-lg bg-white"
                  value={selectedQuestCategory}
                  onChange={(e) => setSelectedQuestCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="environment">Environment</option>
                  <option value="fundraising">Fundraising</option>
                  <option value="animal welfare">Animal Welfare</option>
                  <option value="education">Education</option>
                </select>
              </div>
            </div>

            {/* Featured Project */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="md:flex">
                <div className="md:w-2/3 p-6">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">FEATURED</span>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Environment</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Community Garden Revitalization</h3>
                  <p className="text-gray-600 mb-4">
                    Join us in transforming an abandoned lot into a thriving community garden where neighbors can grow food, 
                    share gardening tips, and build stronger bonds through sustainable agriculture.
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="mr-4">Oakwood Community Center</span>
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Starting June 18, 2024</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Progress</p>
                      <div className="w-full sm:w-48 h-2 bg-gray-200 rounded-full">
                        <div className="w-1/3 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">2 of 6 steps completed</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Team</p>
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {[1,2,3,4].map(num => (
                            <div key={num} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white"></div>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">+12 more</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Join this Quest
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="md:w-1/3 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white">
                  <div className="text-center p-6">
                    <GlobeAltIcon className="h-16 w-16 mx-auto mb-3" />
                    <p className="font-bold">Key Impact</p>
                    <p className="text-lg">3,000 sq ft of green space created</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quest Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {filteredQuests.map(quest => (
                <div key={quest.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {quest.category}
                      </span>
                      <div className="text-sm text-gray-500 flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>{quest.participants} participants</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{quest.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{quest.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      {quest.location && (
                        <>
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span className="mr-3">{quest.location}</span>
                        </>
                      )}
                      {quest.date && (
                        <>
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{quest.date}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-700 font-medium">{quest.completedSteps}/{quest.steps} steps</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-600 rounded-full" 
                          style={{width: `${(quest.completedSteps / quest.steps) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                      <span className="font-medium">Impact:</span>
                      <span className="ml-1">{quest.impact}</span>
                    </div>
                    
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Join this Quest
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Planning Tools */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quest Planning Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer">
                  <CalendarIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium mb-1">Scheduling Assistant</h4>
                  <p className="text-sm text-gray-600">Find the perfect time for all team members with our smart scheduler</p>
                </div>
                <div className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer">
                  <CheckCircleIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium mb-1">Task Manager</h4>
                  <p className="text-sm text-gray-600">Divide responsibilities and track progress with our task board</p>
                </div>
                <div className="border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600 mb-2" />
                  <h4 className="font-medium mb-1">Team Chat</h4>
                  <p className="text-sm text-gray-600">Stay connected with real-time messaging and file sharing</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meetups' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Values-Aligned Meetups</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search meetups..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2 border rounded-lg bg-white"
                  value={selectedValueTag}
                  onChange={(e) => setSelectedValueTag(e.target.value)}
                >
                  <option value="all">All Values</option>
                  {allValueTags.map((tag, index) => (
                    <option key={index} value={tag.toLowerCase()}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Value Matching */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold text-gray-900">Your Core Values Profile</h3>
                  <p className="text-gray-600">Find meetups aligned with what matters most to you</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">Environmental Sustainability</span>
                  <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">Community Service</span>
                  <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">Lifelong Learning</span>
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">Mindful Living</span>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Update Values
                  </button>
                </div>
              </div>
            </div>

            {/* Meetup Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {filteredMeetups.map(meetup => (
                <div key={meetup.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">{meetup.date}</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {meetup.attendees}/{meetup.maxAttendees} attending
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{meetup.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{meetup.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {meetup.values.map((value, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {value}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Time</p>
                        <p className="text-gray-600">{meetup.time}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Location</p>
                        <p className="text-gray-600">{meetup.location}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Host</p>
                        <p className="text-gray-600">{meetup.host}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Values Match</p>
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                            <div className="w-3/4 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-green-600">75%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        RSVP
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Host a Meetup */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="md:flex items-center">
                <div className="md:w-3/4 mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-2">Host Your Own Values-Aligned Meetup</h3>
                  <p className="opacity-90 mb-4">
                    Create meaningful connections by bringing together people who share your values. We'll help you with resources, 
                    guides, and tools to make your meetup successful.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      <span>Free hosting tools</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      <span>Conversation guides</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      <span>Activity resources</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/4 md:text-right">
                  <button className="w-full md:w-auto px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition">
                    Start Hosting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experiences' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Shared Experiences Live</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search experiences..."
                    className="px-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2 border rounded-lg bg-white"
                  value={selectedExperienceCategory}
                  onChange={(e) => setSelectedExperienceCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {allExperienceCategories.map((category, index) => (
                    <option key={index} value={category.toLowerCase()}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Map View */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Experiences Near You</h3>
                <div className="flex items-center text-sm text-blue-600">
                  <span>View all on map</span>
                  <MapPinIcon className="h-4 w-4 ml-1" />
                </div>
              </div>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Interactive map will display here</p>
              </div>
            </div>

            {/* Featured Experience */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="md:flex">
                <div className="md:w-2/3 p-6">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2">FEATURED</span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Workshop</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Collaborative Mural Project</h3>
                  <p className="text-gray-600 mb-4">
                    Join local artists and neighbors to create a community mural representing our shared values and history. 
                    No artistic experience required — just bring your enthusiasm!
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Date & Time</p>
                      <p className="text-gray-600">July 15, 2024 • 10:00 AM - 4:00 PM</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Location</p>
                      <p className="text-gray-600">Main Street Community Center</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Host</p>
                      <p className="text-gray-600">Public Art Initiative</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Cost</p>
                      <p className="text-gray-600">Free (materials provided)</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      RSVP to Attend
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="md:w-1/3 bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PuzzlePieceIcon className="h-10 w-10" />
                    </div>
                    <p className="font-bold">Current RSVPs</p>
                    <p className="text-lg">27/40 spots</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredExperiences.map(experience => (
                <div key={experience.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                  <div className={`h-2 bg-gradient-to-r ${
                    experience.category.includes('Garden') ? 'from-green-400 to-emerald-500' :
                    experience.category.includes('Art') ? 'from-purple-400 to-pink-500' :
                    experience.category.includes('Food') ? 'from-yellow-400 to-orange-500' :
                    experience.category.includes('Photo') ? 'from-blue-400 to-indigo-500' :
                    'from-gray-400 to-gray-500'
                  }`}></div>
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {experience.category}
                      </span>
                      <div className="text-sm text-gray-500 flex items-center">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>{experience.attendees}/{experience.maxAttendees}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{experience.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{experience.description}</p>
                    
                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                      <div className="flex items-start">
                        <CalendarIcon className="h-4 w-4 mr-2 mt-0.5" />
                        <span>{experience.date}, {experience.time}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="h-4 w-4 mr-2 mt-0.5" />
                        <span>{experience.location}</span>
                      </div>
                      <div className="flex items-start">
                        <UserIcon className="h-4 w-4 mr-2 mt-0.5" />
                        <span>Hosted by {experience.host}</span>
                      </div>
                      {experience.cost && (
                        <div className="flex items-start">
                          <span className="mr-2 font-medium">Cost:</span>
                          <span>{experience.cost}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Join Experience
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Host an Experience */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="md:flex items-center justify-between">
                <div className="md:w-2/3 mb-4 md:mb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Host Your Own Experience</h3>
                  <p className="text-gray-600">
                    Share your passion, skills, or knowledge with others by hosting a small group experience. 
                    We provide all the tools and resources you need to create a meaningful gathering.
                  </p>
                </div>
                <div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Start Planning
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for additional tabs */}
        {(activeTab === 'support' || activeTab === 'living-beings' || activeTab === 'reconnection') && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'support' && <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />}
              {activeTab === 'living-beings' && <GlobeAltIcon className="h-8 w-8 text-blue-600" />}
              {activeTab === 'reconnection' && <ArrowPathIcon className="h-8 w-8 text-blue-600" />}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {activeTab === 'support' && 'Support Circles Meet-Ups'}
              {activeTab === 'living-beings' && 'Living Beings Action Hub'}
              {activeTab === 'reconnection' && 'Reconnection Prompts'}
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto mb-6">
              {activeTab === 'support' && 'Connect with your online support circles in person through coffee chats, walking groups, and study sessions.'}
              {activeTab === 'living-beings' && 'Find volunteer opportunities with environmental and animal-welfare organizations in your area.'}
              {activeTab === 'reconnection' && 'Reconnect with dormant contacts through AI-driven reminders and location-based meeting suggestions.'}
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              {activeTab === 'support' && 'Find Support Circles'}
              {activeTab === 'living-beings' && 'Explore Opportunities'}
              {activeTab === 'reconnection' && 'Start Reconnecting'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 
