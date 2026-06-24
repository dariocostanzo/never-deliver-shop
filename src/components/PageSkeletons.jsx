export function HomeGridSkeleton({ count = 10 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4" aria-label="Loading products" aria-busy="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-44 sm:h-52 bg-gray-200" />
                    <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mt-3" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ProductPageSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col md:flex-row gap-5 sm:gap-8 animate-pulse" aria-label="Loading product" aria-busy="true">
            <div className="w-full md:w-80 h-72 sm:h-80 bg-gray-200 rounded-lg" />

            <div className="flex-1 space-y-3">
                <div className="h-3 w-1/4 bg-gray-200 rounded" />
                <div className="h-8 w-11/12 bg-gray-200 rounded" />
                <div className="h-4 w-2/5 bg-gray-200 rounded" />
                <div className="h-px bg-gray-200 my-2" />
                <div className="h-8 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-4 w-1/4 bg-gray-200 rounded" />
                <div className="flex gap-3 mt-2">
                    <div className="h-9 w-24 bg-gray-200 rounded" />
                    <div className="h-10 flex-1 bg-gray-200 rounded-full" />
                </div>
                <div className="h-px bg-gray-200 my-2" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-10/12 bg-gray-200 rounded" />
            </div>
        </div>
    );
}

export function OrdersPageSkeleton({ count = 3 }) {
    return (
        <div className="space-y-4" aria-label="Loading orders" aria-busy="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                    <div className="bg-gray-100 border-b px-4 py-3">
                        <div className="h-3 w-2/3 bg-gray-200 rounded" />
                    </div>
                    <div className="px-4 py-4 space-y-3">
                        <div className="h-4 w-1/3 bg-gray-200 rounded" />
                        <div className="flex gap-3">
                            <div className="w-16 h-16 bg-gray-200 rounded" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                                <div className="h-3 w-1/3 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
