const SkeletonLoader = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64 w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        ))}
    </div>
);