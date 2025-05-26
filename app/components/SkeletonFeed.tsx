import SkeletonPost from './SkeletonPost'

interface SkeletonFeedProps {
  count?: number
}

export default function SkeletonFeed({ count = 5 }: SkeletonFeedProps) {
  return (
    <div className="space-y-6 mt-6">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonPost key={index} />
      ))}
    </div>
  )
} 