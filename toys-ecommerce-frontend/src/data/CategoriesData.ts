export interface Category {
    id: number;
    name: string;
    imageUrl: string;
    route: string;
}

export const categories: Category[] = [
    { id: 1, name: 'Activity Toys', imageUrl: '/images/activity-toys.png', route: 'activity-toys' },
    { id: 2, name: 'Indoor Games', imageUrl: '/images/indoor-games.png', route: 'indoor-games' },
    { id: 3, name: 'Puzzles', imageUrl: '/images/puzzles.png', route: 'puzzles' },
    { id: 4, name: 'Return Gifts', imageUrl: '/images/return-gifts.png', route: 'return-gifts' },
    { id: 5, name: 'Wooden Toys', imageUrl: '/images/wooden-toys.png', route: 'wooden-toys' },
    // Add more as needed
];