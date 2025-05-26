'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserCircleIcon,
  SparklesIcon,
  GlobeAltIcon,
  HandRaisedIcon,
  UsersIcon,
  HeartIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BookmarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'

const navigation = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'People', href: '/people', icon: UserGroupIcon },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon },
  { name: 'Activities', href: '/activities', icon: ClipboardDocumentListIcon },
  { name: 'Discover', href: '/discover', icon: GlobeAltIcon },
  { name: 'Spend time with others', href: '/spend-time-with-others', icon: UsersIcon },
  { name: 'Help Others', href: '/help-others', icon: HandRaisedIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
]

const homeNavigation = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'People', href: '/people', icon: UserGroupIcon },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon },
  { name: 'Activities', href: '/activities', icon: ClipboardDocumentListIcon },
  { name: 'Discover', href: '/discover', icon: GlobeAltIcon },
  { name: 'Spend time with others', href: '/spend-time-with-others', icon: UsersIcon },
  { name: 'Help Others', href: '/help-others', icon: HandRaisedIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
]

export default function TopNav() {
  const pathname = usePathname()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { user, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  
  const isHomePage = pathname === '/home'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/home" className="text-2xl font-bold text-blue-600">
              Social
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="w-full max-w-2xl">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Navigation Icons - Show on all pages */}
          <div className="hidden lg:flex items-center space-x-1 px-4">
            {homeNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={item.name}
                >
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </Link>
              )
            })}
          </div>

          {/* Right side navigation items */}
          <div className="flex items-center lg:ml-6">
            <Link
              href="/notifications"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </Link>

            {/* Profile dropdown */}
            <div className="ml-3 relative" ref={menuRef}>
              <button
                className="flex rounded-full bg-white text-sm focus:outline-none"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="sr-only">Open user menu</span>
                {user?.user_metadata?.avatar_url ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/32?text=U';
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/saved-posts"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="flex items-center">
                      <BookmarkIcon className="h-5 w-5 mr-2" />
                      Saved Posts
                    </div>
                  </Link>
                  <Link
                    href="/deleted-posts"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="flex items-center">
                      <TrashIcon className="h-5 w-5 mr-2" />
                      Deleted Posts
                    </div>
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="flex items-center">
                      <Cog6ToothIcon className="h-5 w-5 mr-2" />
                      Settings
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setShowProfileMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      Sign out
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 