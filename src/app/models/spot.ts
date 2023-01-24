export type Spot = {
    _id: string
    name: string;
    description: string;
    category: [string];
    geolocation: [Number];
    picture: string;
    rating: Number;
    creationDate: Date;
};