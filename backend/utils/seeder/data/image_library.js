/**
 * image_library.js - Rock-Solid Production Assets
 * These IDs are manually verified for maximum uptime and quality.
 */

const build = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

export const imageLibrary = {
    "North Indian": {
        "Hero": [build("1517248135467-4c7edcad34c4"), build("1603894584373-5ac82b2ae398")],
        "Generic": [build("1601050690597-df0568f70950")]
    },
    "Chinese": {
        "Hero": [build("1552611052-33e04de081de"), build("1585032226651-752039d1fbf1")],
        "Generic": [build("1512058560366-18510be2db19")]
    },
    "Biryani": {
        "Hero": [build("1631515243349-e0cb75fb8d3a")],
        "Generic": [build("1633945274535-be0014909a50")]
    },
    "Pizza": {
        "Hero": [build("1513104890138-7c749659a591")],
        "Generic": [build("1565299624946-b28f40a0ae38")]
    },
    "Burgers": {
        "Hero": [build("1568901346375-23c9450c58cd")],
        "Generic": [build("1571091718767-18b5b1457add")]
    },
    "Seafood": {
        "Hero": [build("1519708227418-f8fd9267c79a")],
        "Generic": [build("1546069901-ba9599a7e63c")]
    },
    "Cafes": {
        "Hero": [build("1495474472282-f0920626a621")],
        "Generic": [build("1544145945-f904253d0c7b")]
    },
    "Restaurants": {
        "Generic": [build("1514933651103-a2dc2f9d029b"), build("1555396273-0995c80a0152"), build("1552566629-a83d09f63771")]
    }
};
