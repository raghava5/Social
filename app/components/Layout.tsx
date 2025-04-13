'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UserIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14">
            {/* Left section */}
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                SevenSpokes
              </Link>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search SevenSpokes"
                  className="input-field w-64"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Center section */}
            <div className="flex items-center space-x-1">
              <Link
                href="/home"
                className={`nav-link ${pathname === '/home' ? 'active' : ''}`}
              >
                <HomeIcon className="h-6 w-6" />
              </Link>
              <Link
                href="/groups"
                className={`nav-link ${pathname === '/groups' ? 'active' : ''}`}
              >
                <UserGroupIcon className="h-6 w-6" />
              </Link>
              <Link
                href="/messages"
                className={`nav-link ${pathname === '/messages' ? 'active' : ''}`}
              >
                <ChatBubbleLeftIcon className="h-6 w-6" />
              </Link>
              <Link
                href="/notifications"
                className={`nav-link ${
                  pathname === '/notifications' ? 'active' : ''
                }`}
              >
                <BellIcon className="h-6 w-6" />
              </Link>
              <Link
                href="/profile"
                className={`nav-link ${pathname === '/profile' ? 'active' : ''}`}
              >
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2">
              <button className="btn-primary">
                <PlusIcon className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left sidebar */}
          <div className="col-span-3">
            <div className="card p-4 space-y-4">
              <Link href="/profile" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <span className="font-medium">Your Name</span>
              </Link>
              <Link href="/friends" className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                <span>Friends</span>
              </Link>
              <Link href="/groups" className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                <span>Groups</span>
              </Link>
              <Link href="/marketplace" className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                <span>Marketplace</span>
              </Link>
              <Link href="/watch" className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                <span>Watch</span>
              </Link>
              <Link href="/memories" className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                <span>Memories</span>
              </Link>
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-6">{children}</div>

          {/* Right sidebar */}
          <div className="col-span-3">
            <div className="card p-4 space-y-4">
              <h3 className="font-semibold">Sponsored</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-32 bg-gray-300 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Sponsored Content</p>
                    <p className="text-sm text-gray-500">example.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 h-32 bg-gray-300 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Sponsored Content</p>
                    <p className="text-sm text-gray-500">example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 