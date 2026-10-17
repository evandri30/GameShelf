import type { GameProps } from "@/types"

export type GotyGame = GameProps & { awardYear: number }

// The Game Awards GOTY winners. Snapshot of RAWG data: winners never change, so there is no need
// to fetch 12 game details on every cache miss.
export const gotyWinners: GotyGame[] = [
    {
        awardYear: 2025,
        id: 983210,
        slug: "clair-obscur-expedition-33",
        name: "Clair Obscur: Expedition 33",
        background_image: "https://media.rawg.io/media/games/466/4667f17fdee9ebbcea2049e54f8e2b96.jpg",
        rating: 4.42,
        released: "2025-04-24",
        metacritic: null,
        esrb_rating: null,
        genres: [
            {
                id: 5,
                name: "RPG"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2024,
        id: 982817,
        slug: "astro-bot",
        name: "Astro Bot",
        background_image: "https://media.rawg.io/media/games/b19/b19cdd6be95ffffd63fdd2d1fbac057a.jpg",
        rating: 4.36,
        released: "2024-09-06",
        metacritic: null,
        esrb_rating: {
            id: 2,
            name: "Everyone 10+",
            slug: "everyone-10-plus"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 83,
                name: "Platformer"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2023,
        id: 324997,
        slug: "baldurs-gate-3",
        name: "Baldur's Gate III",
        background_image: "https://media.rawg.io/media/games/699/69907ecf13f172e9e144069769c3be73.jpg",
        rating: 4.43,
        released: "2023-08-03",
        metacritic: 97,
        esrb_rating: {
            id: 4,
            name: "Mature",
            slug: "mature"
        },
        genres: [
            {
                id: 3,
                name: "Adventure"
            },
            {
                id: 5,
                name: "RPG"
            },
            {
                id: 10,
                name: "Strategy"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2022,
        id: 326243,
        slug: "elden-ring",
        name: "Elden Ring",
        background_image: "https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg",
        rating: 4.38,
        released: "2022-02-25",
        metacritic: 95,
        esrb_rating: {
            id: 4,
            name: "Mature",
            slug: "mature"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 5,
                name: "RPG"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2021,
        id: 455597,
        slug: "it-takes-two-2",
        name: "It Takes Two",
        background_image: "https://media.rawg.io/media/games/d47/d479582ed0a46496ad34f65c7099d7e5.jpg",
        rating: 4.45,
        released: "2021-03-26",
        metacritic: 88,
        esrb_rating: {
            id: 2,
            name: "Everyone 10+",
            slug: "everyone-10-plus"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 3,
                name: "Adventure"
            },
            {
                id: 83,
                name: "Platformer"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2020,
        id: 51325,
        slug: "the-last-of-us-part-2",
        name: "The Last of Us Part II",
        background_image: "https://media.rawg.io/media/games/909/909974d1c7863c2027241e265fe7011f.jpg",
        rating: 4.41,
        released: "2020-06-19",
        metacritic: 93,
        esrb_rating: {
            id: 4,
            name: "Mature",
            slug: "mature"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 2,
                name: "Shooter"
            },
            {
                id: 3,
                name: "Adventure"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2019,
        id: 50734,
        slug: "shadows-die-twice",
        name: "Sekiro: Shadows Die Twice",
        background_image: "https://media.rawg.io/media/games/67f/67f62d1f062a6164f57575e0604ee9f6.jpg",
        rating: 4.38,
        released: "2019-03-22",
        metacritic: 90,
        esrb_rating: {
            id: 4,
            name: "Mature",
            slug: "mature"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 5,
                name: "RPG"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2018,
        id: 58175,
        slug: "god-of-war-2",
        name: "God of War (2018)",
        background_image: "https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be59.jpg",
        rating: 4.54,
        released: "2018-04-20",
        metacritic: 94,
        esrb_rating: {
            id: 4,
            name: "Mature",
            slug: "mature"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2017,
        id: 22511,
        slug: "the-legend-of-zelda-breath-of-the-wild",
        name: "The Legend of Zelda: Breath of the Wild",
        background_image: "https://media.rawg.io/media/games/cc1/cc196a5ad763955d6532cdba236f730c.jpg",
        rating: 4.47,
        released: "2017-03-03",
        metacritic: 97,
        esrb_rating: {
            id: 2,
            name: "Everyone 10+",
            slug: "everyone-10-plus"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 3,
                name: "Adventure"
            },
            {
                id: 5,
                name: "RPG"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2016,
        id: 22508,
        slug: "overwatch",
        name: "Overwatch",
        background_image: "https://media.rawg.io/media/games/4ea/4ea507ceebeabb43edbc09468f5aaac6.jpg",
        rating: 4.13,
        released: "2016-05-24",
        metacritic: 91,
        esrb_rating: {
            id: 3,
            name: "Teen",
            slug: "teen"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 2,
                name: "Shooter"
            },
            {
                id: 40,
                name: "Casual"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2015,
        id: 3328,
        slug: "the-witcher-3-wild-hunt",
        name: "The Witcher 3: Wild Hunt",
        background_image: "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
        rating: 4.64,
        released: "2015-05-18",
        metacritic: 92,
        esrb_rating: {
            id: 4,
            name: "Mature",
            slug: "mature"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 5,
                name: "RPG"
            }
        ],
        platforms: []
    },
    {
        awardYear: 2014,
        id: 28559,
        slug: "dragon-age-inquisition",
        name: "Dragon Age: Inquisition",
        background_image: "https://media.rawg.io/media/games/260/26023c855f1769a93411d6a7ea084632.jpeg",
        rating: 3.79,
        released: "2014-11-18",
        metacritic: 86,
        esrb_rating: {
            id: 4,
            name: "Mature",
            slug: "mature"
        },
        genres: [
            {
                id: 4,
                name: "Action"
            },
            {
                id: 5,
                name: "RPG"
            },
            {
                id: 10,
                name: "Strategy"
            }
        ],
        platforms: []
    }
]
