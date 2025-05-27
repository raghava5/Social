'use client'

import Link from 'next/link'
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  HandRaisedIcon,
  UserIcon,
  BookmarkIcon,
  CalendarIcon,
  PhotoIcon,
  VideoCameraIcon,
  ClipboardDocumentListIcon,
  GlobeAltIcon,
  SparklesIcon,
  UsersIcon,
  TrashIcon,
  HeartIcon,
  PuzzlePieceIcon,
  FireIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'
import { usePathname, useSearchParams } from 'next/navigation'

const navigation = [
  { name: 'All Posts', href: '/home', icon: HomeIcon },
  { name: 'Spiritual', href: '/home?spoke=Spiritual', icon: SparklesIcon },
  { name: 'Mental', href: '/home?spoke=Mental', icon: AcademicCapIcon },
  { name: 'Physical', href: '/home?spoke=Physical', icon: FireIcon },
  { name: 'Personal', href: '/home?spoke=Personal', icon: HeartIcon },
  { name: 'Professional', href: '/home?spoke=Professional', icon: BriefcaseIcon },
  { name: 'Financial', href: '/home?spoke=Financial', icon: CurrencyDollarIcon },
  { name: 'Social', href: '/home?spoke=Social', icon: UserGroupIcon },
  { name: 'Societal', href: '/home?spoke=Societal', icon: GlobeAltIcon },
  { name: 'Fun & Recreation', href: '/home?spoke=Fun', icon: UsersIcon },
]

const shortcuts = [
  { name: 'Saved Posts', href: '/saved-posts', icon: BookmarkIcon },
  { name: 'Deleted Posts', href: '/deleted-posts', icon: TrashIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Photos', href: '/photos', icon: PhotoIcon },
  { name: 'Videos', href: '/videos', icon: VideoCameraIcon },
]

export default function LeftSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-16">
      <div className="flex flex-col flex-grow overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            // Extract spoke parameter from href for navigation items
            const spokeParam = item.href.includes('spoke=') ? item.href.split('spoke=')[1] : null
            const currentSpoke = searchParams?.get('spoke')
            const isActive = pathname === '/home' && spokeParam === currentSpoke
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 ${
                    isActive
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-start">
              <span className="pr-3 bg-white text-sm text-gray-500">Shortcuts</span>
            </div>
          </div>
          
          {shortcuts.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 ${
                    isActive
                      ? 'text-blue-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 