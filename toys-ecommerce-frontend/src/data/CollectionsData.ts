export interface Collection {
    id: number;
    name: string;
    route: string;
    description: string;
}

export const collections: Collection[] = [
    { id: 1, name: '0 - 2 Years', route: '0-2-years', description: 'Explore safe and stimulating toys for babies aged 0 to 2 years.' },
    { id: 2, name: '2 - 4 Years', route: '2-4-years', description: 'Fun and educational toys designed for toddlers and preschoolers.' },
    { id: 3, name: '4 - 6 Years', route: '4-6-years', description: 'Toys that challenge and develop skills for early school-age children.' },
    { id: 4, name: '6 + Years', route: '6-plus-years', description: 'Advanced games and creative kits for older children.' },
];