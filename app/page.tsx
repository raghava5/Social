import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Seven Spokes
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A social network focused on the seven spokes of life
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/home" className="card p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Home</h2>
              <p className="text-gray-600">View your feed and activities</p>
            </Link>
            <Link href="/profile" className="card p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Profile</h2>
              <p className="text-gray-600">Manage your profile and settings</p>
            </Link>
            <Link href="/messages" className="card p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Messages</h2>
              <p className="text-gray-600">Connect with others</p>
            </Link>
            <Link href="/groups" className="card p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Groups</h2>
              <p className="text-gray-600">Join communities</p>
            </Link>
            <Link href="/activities" className="card p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Activities</h2>
              <p className="text-gray-600">Track your progress</p>
            </Link>
            <Link href="/help" className="card p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">Help & Support</h2>
              <p className="text-gray-600">Get assistance</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
