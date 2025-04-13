'use client'

import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

// Dummy data for search results
const dummyResults = {
  users: [
    { id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
  ],
  groups: [
    { id: 1, name: 'Tech Enthusiasts', members: 1250 },
    { id: 2, name: 'Mindfulness Group', members: 856 },
  ],
  posts: [
    { id: 1, title: 'Morning Meditation Tips', author: 'John Doe' },
    { id: 2, title: 'Healthy Eating Guide', author: 'Jane Smith' },
  ],
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof dummyResults | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      // Simulate API call with dummy data
      setResults(dummyResults)
      setIsOpen(true)
    } else {
      setResults(null)
      setIsOpen(false)
    }
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search for people, groups, posts..."
          className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </form>

      {isOpen && results && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-2">
            {/* Users */}
            {results.users.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 px-2 mb-2">People</h3>
                {results.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full mr-3"
                    />
                    <span className="text-sm">{user.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Groups */}
            {results.groups.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 px-2 mb-2">Groups</h3>
                {results.groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => router.push(`/groups/${group.id}`)}
                  >
                    <span className="text-sm">{group.name}</span>
                    <span className="text-xs text-gray-500">{group.members} members</span>
                  </div>
                ))}
              </div>
            )}

            {/* Posts */}
            {results.posts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 px-2 mb-2">Posts</h3>
                {results.posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => router.push(`/posts/${post.id}`)}
                  >
                    <div className="text-sm font-medium">{post.title}</div>
                    <div className="text-xs text-gray-500">by {post.author}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 