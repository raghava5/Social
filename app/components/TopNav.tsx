'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

export default function TopNav() {
  const pathname = usePathname()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const navItems = [
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Groups', href: '/groups', icon: UserGroupIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
  ]

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo and Search */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">SevenSpokes</span>
            </Link>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search SevenSpokes"
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Center section - Navigation */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              )
            })}
          </div>

          {/* Right section - User menu */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200">
              <PlusIcon className="h-6 w-6 text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <span className="text-sm font-medium">John Doe</span>
              </button>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/help"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Help & Support
                  </Link>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 