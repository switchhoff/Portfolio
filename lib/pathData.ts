export type ContentBlock = 
  | { type: 'text'; text: string }
  | { type: 'image' | 'gif'; src: string; alt?: string; link?: string }
  | { type: 'gallery'; images: { src: string; alt?: string; link?: string }[] }
  | { type: 'audio'; src: string; label: string }
  | { type: 'link'; url: string; label?: string; icon?: 'github' | 'instagram' | 'printables' | 'external' | 'linkedin' | 'mail' | 'phone'; fontSize?: string | number };

export interface PathObject {
  path: number;
  name: string;
  category: "projects" | "experience" | "education" | "about" | "interests" | "generic";
  description?: string;
  content?: ContentBlock[];
  date?: string;
  company?: string;
  role?: string;
  items?: (string | { label: string; href?: string; sub?: boolean; image?: string; audio?: string; action?: string })[];
  entries?: { date: string; title: string }[];
  subtext?: string;
  image?: string;
  imageLink?: string;
  tags?: string[];
  wip?: boolean;
  links?: {
    github?: string;
    instagram?: string;
    printables?: string;
    external?: string;
    label?: string;
  }[];
}

export const PATH_DATA: Record<number, PathObject> = {
  2: {
    path: 2,
    name: "Monsoon",
    category: "projects",
    wip: true,
    tags: ["GAME DESIGN", "ART"],
    content: [
      { type: 'text', text: "I am in the process of creating a thematic reskin of Dune: Imperium, based on the book Monsoon by Wilbur Smith — following the Courtney Family's adventures on the high seas of East Africa." },
      { type: 'text', text: "I'm working to map all elements into consistent, aesthetic equivalents and redesign the base to suit my vision. Sneak peek at some concept art below." },
      { type: 'image', src: "/General Pieces.png" }
    ],
  },
  4: {
    path: 4,
    name: "Art",
    category: "interests",
    description: "Favourite Artists:",
    items: [
      "Hans Heysen",
      "Albert Namatjira",
      "Matthew Bell",
    ],
    links: [],
  },
  6: {
    path: 6,
    name: "Threadquarters",
    category: "projects",
    description: "Jacket",
    wip: true,
    tags: ["SOFTWARE", "CLOTHING"],
    links: [{ github: "https://github.com/switchhoff/Threadquarters", label: "GitHub" }],
  },
  8: {
    path: 8,
    name: "Golf",
    category: "interests",
    description: "",
    items: [
      "HCP = 38",
      { label: "Berwick Montuna Golf Club", href: "https://www.berwickmontuna.com.au/", sub: false },
      { label: "Hit me up to connect for a round", action: "golf_form" },
    ],
    links: [],
  },
  10: {
    path: 10,
    name: "Saxophone",
    category: "interests",
    description: "Favourites",
    items: [
      { label: "Daisy Bell", audio: "/audio/Daisy.m4a" },
      { label: "The Entertainer", audio: "/audio/Entertainer.m4a" },
      { label: "Stitches", audio: "/audio/Stitches.m4a" },
    ],
    links: [],
  },
  12: {
    path: 12,
    name: "Votemotm",
    category: "projects",
    description: "I've built a set of progressive web apps for my football team as a platform for man of the match voting, fan engagement and stat tracking — reducing unnecessary messages, confusion about game locations, and directly connecting fans to players. Currently 30+ users across Players, Coaches, Admin and Fans, with plans to deploy to the wider community.",
    image: "/kdfcmotm.png",
    tags: ["DATA ANALYTICS", "SPORT"],
    links: [{ github: "https://github.com/switchhoff/Votemotm", label: "GitHub" }],
  },
  14: {
    path: 14,
    name: "BeNFL",
    category: "projects",
    description: "I've built a web-scraping platform for a custom use case: avoiding sport spoilers before watching the game. It collects stats from every NFL game and runs them through a custom algorithm designed by my brother to calculate Watchability — without revealing the score. The user can then identify the best game of the week to watch on replay.",
    image: "/benfl.png",
    tags: ["DATA ANALYTICS", "SPORT"],
    links: [{ github: "https://github.com/switchhoff/BeNFL", label: "GitHub" }],
  },
  16: {
    path: 16,
    name: "PawsButton",
    category: "projects",
    description: "I've built a household pet care tracking app that logs feeding, walks and more. Every member of the household has an account and is notified when the pets have or have not been fed — preventing double feeding, missed meals, or worst of all, no evening walk around the block.",
    image: "/pawsbutton.png",
    tags: ["SOFTWARE", "PETS"],
    links: [{ github: "https://github.com/switchhoff/PawsButton", label: "GitHub" }],
  },
  18: {
    path: 18,
    name: "Reading",
    category: "interests",
    description: "Favourites",
    items: [
      { label: "Brotherband Chronicles", href: "https://flanagan.fandom.com/wiki/The_Brotherband_Chronicles", image: "https://static.wikia.nocookie.net/rangersapprentice/images/0/0d/The_Outcasts_%28Eng_1%29.jpg/revision/latest/scale-to-width-down/1000?cb=20190506222054" },
      { label: "Conqueror Series", href: "https://en.wikipedia.org/wiki/Wolf_of_the_Plains", image: "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/ConnIggulden_WolfOfThePlains.jpg/250px-ConnIggulden_WolfOfThePlains.jpg" },
      { label: "Courtney Novels", href: "https://en.wikipedia.org/wiki/The_Courtney_Novels", image: "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Monsoon_-_bookcover.jpg/250px-Monsoon_-_bookcover.jpg" },
    ],
    links: [],
  },
  20: {
    path: 20,
    name: "Easter Egg",
    category: "generic",
    description: "You found an Easter Egg!",
    links: [],
  },
  22: {
    path: 22,
    name: "Cave Disto",
    category: "projects",
    description: "I'm prototyping a laser measuring device running on a Raspberry Pi Pico for my brother to take caving. The purpose is to fuse gyroscope and compass data with IR laser TOF measurements to map out previously undiscovered caves.",
    image: "/cavedisto.png",
    items: [
      "Waterproof and ruggedized for wet, damp, dark conditions",
      "Redundant gyroscopes, laser sensor, and battery management system",
      "LCD screen with a simple, intuitive button interface",
      "Standalone low-power design for extended underground use",
    ],
    tags: ["HARDWARE", "MICROCONTROLLER"],
    links: [{ github: "https://github.com/switchhoff/CaveDisto", label: "GitHub" }],
  },
  24: {
    path: 24,
    name: "Craft",
    category: "interests",
    description: "I enjoy a chill evening creating useful little items out of fabric — putting logos onto beanies, making pouches for camping items, or crocheting a glasses case.",
    items: ["Sewing", "Embroidery", "Crochet"],
    links: [],
  },
  26: {
    path: 26,
    name: "Photography",
    category: "interests",
    description: "",
    image: "/instagram.png",
    imageLink: "https://www.instagram.com/p/BkkMocYHvOt/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    items: [{ label: "@alexhofmannphotography", href: "https://www.instagram.com/alexhofmannphotography/" }],
  },
  28: {
    path: 28,
    name: "Movies",
    category: "interests",
    description: "Favourite Films",
    items: ["Ocean's Eleven", "Lord of the Rings", "Pirates of the Caribbean"],
    links: [],
  },
  30: {
    path: 30,
    name: "Multiboard",
    category: "projects",
    description: "135+ Multiboard grids 3D printed and installed across the workshop — wall-mounting tools, art, monitors, and keeping cables under control.",
    links: [{ external: "https://multibuild.io/", label: "multibuild.io" }],
  },
  32: {
    path: 32,
    name: "Shout a Round",
    category: "projects",
    description: "Simple app that tracks whose round it is to buy drinks in your different group of friends.",
    tags: ["SOFTWARE", "DRINKS"],
    links: [],
  },
  34: {
    path: 34,
    name: "",
    category: "projects",
    description: "Tech blog space where I write about what I'm working on, interesting things I come across, the latest developments in tech. At this stage private for keeping on track of things personally - but might publicise/route through LinkedIn if people ever want to follow what I do.",
    links: []
  },
  36: {
    path: 36,
    name: "MiniMize",
    category: "projects",
    description: "Phone Optimizer",
    links: [{ github: "https://github.com/switchhoff/MiniMise", label: "GitHub" }],
  },
  38: {
    path: 38,
    name: "LastYear",
    category: "projects",
    description: "Calendar Project",
    tags: ["SOFTWARE", "RELATIONSHIP"],
    links: [{ github: "https://github.com/switchhoff/LastYear", label: "GitHub" }],
  },
  40: {
    path: 40,
    name: "Habitat",
    category: "projects",
    description: "A habit tracker that rewards consistency by growing virtual plants and trees — build streaks, unlock new species, and watch your garden flourish.",
    wip: true,
    tags: ["SOFTWARE", "PERSONAL"],
    links: [{ github: "https://github.com/switchhoff/Habitat", label: "GitHub" }],
  },
  42: {
    path: 42,
    name: "World Map",
    category: "projects",
    description: "A custom world travel map built as a woodworking project — continents cut, stained, and assembled by hand on a backing board, tracking every country visited.",
    items: ["Germany", "India", "Singapore", "South Africa", "Thailand"],
    tags: ["WOODWORKING", "TRAVEL"],
    links: [],
  },
  44: {
    path: 44,
    name: "3D Printing",
    category: "projects",
    tags: ["3D PRINTING", "DESIGN"],
    content: [
      { type: 'text', text: "CAD and 3D printing useful objects around the house — from a necklace shelf and iPad case to medication boxes, a soldering stand, and infinitely more." },
      { type: 'link', url: "https://www.printables.com/@AlexHofmann_3702877", label: "Printables", icon: "printables" }
    ],
  },
  46: {
    path: 46,
    name: "SixClicks",
    category: "projects",
    wip: true,
    tags: ["VISUALIZATION", "NETWORK", "CHROME"],
    content: [
      { type: 'text', text: "I made this basic LinkedIn scraper Chrome extension to build out a node map of my professional connections." },
      { type: 'link', url: "https://github.com/switchhoff/SixClicks", label: "GitHub", icon: "github" }
    ]
  },
  48: {
    path: 48,
    name: "Portfolio Website",
    category: "projects",
    tags: ["SOFTWARE", "PORTFOLIO"],
    content: [
      { type: 'text', text: "Inspired by the point-and-click adventure games I grew up playing — every object in the workshop is a clickable hotspot telling a piece of my story." },
      { type: 'gif', src: "/transistorswitch.gif" },
      { type: 'link', url: "https://github.com/switchhoff/Portfolio", label: "GitHub", icon: "github" }
    ]
  },
  50: {
    path: 50,
    name: "Future Work",
    category: "experience",
    description: "TBD...",
    links: [],
  },
  52: {
    path: 52,
    name: "Tashi",
    category: "generic",
    description: "Tashi",
    links: [],
  },
  54: {
    path: 54,
    name: "Fig",
    category: "generic",
    description: "Fig",
    links: [],
  },
  56: {
    path: 56,
    name: "Beans",
    category: "generic",
    description: "Beans",
    links: [],
  },
  58: {
    path: 58,
    name: "Humanitarian Innovation Hackathon PowerPots",
    category: "experience",
    date: "2023",
    company: "Humanitarian Innovation Hackathon",
    role: "Ron Johnston Medal Winner",
    description: "Sand filter solution for water filtration in Vanuatu through community education and innovative product prototyping.",
    tags: ["HACKATHON"],
    links: [],
  },
  60: {
    path: 60,
    name: "Robot Building Competition",
    category: "experience",
    date: "2021 & 2022",
    company: "Monash Engineering",
    role: "Robot Building Competition Winner",
    description: "Completed challenges requiring robots to line-follow specific colour segments at speed — precision engineering under competitive conditions.",
    tags: ["HACKATHON"],
    links: [],
  },
  62: {
    path: 62,
    name: "HardHack",
    category: "experience",
    date: "2022",
    company: "Monash Engineering",
    role: "HardHack Winner",
    description: "Designed, built, and tested small unmanned aquatic vehicle with underwater sonar topology mapping.",
    tags: ["HACKATHON"],
    links: [],
  },
  64: {
    path: 64,
    name: "Chief Engineer",
    category: "experience",
    date: "2025 — NOW",
    company: "Fortifyedge",
    role: "Chief Engineer",
    description: "I work on architecturing and implementing robust software solutions implementing tactical AI models for edge deployment supporting human machine interface teaming for frontline workers and defense applications. Leading a team of interns, I deploy full-stack dashboards linked to my wearable apps to translate complex signals into actionable insights for end-users. I work directly with end-users including military, police and firefighter operators to derive requirements, implement features and create useful data insights.",
    tags: ["EDGE COMPUTING", "WEARABLES", "FDE"],
    links: [],
  },
  66: {
    path: 66,
    name: "Electronics & Software Engineer",
    category: "experience",
    date: "2022 — 2024",
    company: "DefendTex",
    role: "Electronics & Software Engineer",
    description: "I developed the autonomy subsystem for an unmanned ground vehicle - computer vision GStreamer pipelines and ArduPilot integration. I also worked across the mechanical frame and electrical subsystems of the vehicle.",
    tags: ["AUTONOMY", "COMPUTER VISION ", "UGV"],
    links: [],
  },
  68: {
    path: 68,
    name: "Software Systems Engineer",
    category: "experience",
    date: "2024 — 2025",
    company: "Tonbo Systems",
    role: "Software Systems Engineer",
    description: "I led the work on delivering network-connected future soldier system kits. Hardware integration, software architecture, and translating operational requirements into engineering specifications within a start-up environment. I worked on Augmented Reality headset integration with tactical military thermal sensors and ATAK plugin development.",
    tags: ["ATAK", "SYSTEMS", "AR"],
    links: [],
  },
  70: {
    path: 70,
    name: "Monash University",
    category: "education",
    description: "",
    entries: [
      { date: "2024", title: "Master of Electrical Engineering" },
      { date: "2020–2023", title: "Bachelor of Robotics and Mechatronics Engineering" },
    ],
    subtext: "Specialization: Artificial Intelligence\nMinor: Software Engineering",
    items: [
      "Dean's Honour List 2020–2023",
      "2024 Master of Engineering Academic Medal Winner",
    ],
    tags: ["UNDERGRADUATE", "POSTGRADUATE"],
    links: [],
  },
  72: {
    path: 72,
    name: "High Powered Rocketry",
    category: "education",
    date: "2022-2023",
    company: "Monash High Powered Rocketry",
    role: "Flight Systems Member",
    description: "Conducted research on non-combustible rocket deployment systems. Composite manufacturing of rocket body components.",
    tags: ["ROCKETRY", "MANUFACTURING"],
    links: [],
  },
  74: {
    path: 74,
    name: "Monash Uncrewed Aerial Systems",
    category: "education",
    date: "2021-2022",
    company: "Monash Uncrewed Aerial Systems",
    role: "Aerostructures Training Officer",
    description: "Sub-team manager responsible for composite manufacturing. Lead role in design and manufacture of destructive testing system.",
    tags: ["DRONES", "STUDENT TEAMS"],
    links: [],
  },
  76: {
    path: 76,
    name: "Alex Hofmann",
    category: "about",
    content: [
      { type: 'text', text: "Melbourne VIC | Age 24. Engineering problem solver with passion for building things. Defence tech background across cutting-edge R&D to forward deployments. Love a challenge." },
      { type: 'link', url: "tel:+61403326837", label: "+61 403 326 837", icon: "phone", fontSize: "12px" },
      { type: 'link', url: "mailto:alexanderhofmann@outlook.com.au", label: "alexanderhofmann@outlook.com.au", icon: "mail", fontSize: "12px" },
      { type: 'link', url: "https://www.linkedin.com/in/hofmannalexb", icon: "linkedin" },
      { type: 'link', url: "https://github.com/switchhoff", icon: "github" }
    ],
  },
  78: {
    path: 78,
    name: "Melbourne Weather",
    category: "projects",
    description: "This simple project takes live Melbourne weather via the free Open Meteo API and embeds it into this website.",
    links: [],
  },
  82: {
    path: 82,
    name: "Board Games",
    category: "interests",
    description: "Favourites",
    items: [
      { label: "Dune Imperium", href: "https://boardgamegeek.com/boardgame/316554/dune-imperium", image: "https://cf.geekdo-images.com/PhjygpWSo-0labGrPBMyyg__itemrep@2x/img/Jo0nBF30UyHL5WSuh1xWppwt1cY=/fit-in/492x600/filters:strip_icc()/pic5666597.jpg" },
      { label: "Wingspan", href: "https://boardgamegeek.com/boardgame/266192/wingspan", image: "https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__itemrep@2x/img/veohwKEtFpERbDq7xGMggHqLKX8=/fit-in/492x600/filters:strip_icc()/pic4458123.jpg" },
      { label: "Ark Nova", href: "https://boardgamegeek.com/boardgame/342942/ark-nova", image: "https://cf.geekdo-images.com/SoU8p28Sk1s8MSvoM4N8pQ__itemrep@2x/img/Pr8zSaMINlALYjR0agud0_EFESs=/fit-in/492x600/filters:strip_icc()/pic6293412.jpg" },
    ],
    subtext: "I'm pretty competitive and enjoy playing any number of board games with friends and foes, often in the evening and into the early hours of the morning.",
    links: [],
  },
  84: {
    path: 84,
    name: "LoverLamp",
    category: "projects",
    description: "Smart Lamp",
    wip: true,
    links: [],
  },
  86: {
    path: 86,
    name: "BinThereStoreThat",
    category: "projects",
    description: "I've created a method for labelling, organising and finding items at home using QR code stickers and a tracking interface. I log the contents of large storage boxes across the garage, shed and workshop — then find any item by searching the database, or identify a box's contents without needing to unstack and open it.",
    image: "/binthere.png",
    tags: ["SOFTWARE", "STORAGE"],
    links: [{ github: "https://github.com/switchhoff/BinThereStoreThat", label: "GitHub" }],
  },
  88: {
    path: 88,
    name: "Teaching Associate",
    category: "experience",
    role: "Teaching Associate",
    company: "Monash University",
    date: "2025",
    description: "I've taught students the fundamentals of AI development, and how to apply the concepts of cutting-edge robotic control to achieve their project outcomes. This included covering fundamentals of SLAM, path planning and object avoidance, as well as training custom AI models. ",
    items: ["ECE4179 Neural Networks", "ECE4078 Intelligent Robotics"],
    tags: ["TEACHING", "AI", "ROBOTICS"],
    links: [],
  },
  90: {
    path: 90,
    name: "Claude",
    category: "generic",
    description: "Coded with Claude",
    links: [],
  },
  92: {
    path: 92,
    name: "Gemini",
    category: "generic",
    description: "Coded with Gemini",
    links: [],
  },
  94: {
    path: 94,
    name: "Video Games",
    category: "interests",
    description: "Favourites",
    items: [
      { label: "Terraria", href: "https://terraria.wiki.gg/", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrVNzn3aErkS59Ym_qhqbZYFd8laElFfxviQ&s" },
      { label: "Civilization V", href: "https://civilization.fandom.com/wiki/Civilization_V", image: "https://images.ctfassets.net/wn7ipiv9ue5v/2ROTJ11e217xt6VmC5F0tq/3f83f5639df2cb3567d69ec49a655c8c/2KGMKT_CIV5_COMPLETE_AG_FOB_NO_RATING_1.jpg" },
      { label: "Fall Guys", href: "https://www.fallguys.com/en-US", image: "https://i.redd.it/oetdev0d40pd1.png" },
    ],
    links: [],
  },
  96: {
    path: 96,
    name: "Ron Johnston Medal Winner",
    category: "experience",
    date: "2023",
    company: "Humanitarian Innovation Hackathon",
    role: "Ron Johnston Medal Winner",
    description: "Bamboo roof cooling design for developing housing in Fiji. Intensive program solving real-world humanitarian issues through engineering innovation.",
    tags: ["HACKATHON"],
    links: [],
  },
  98: {
    path: 98,
    name: "Hiking",
    category: "interests",
    description: "",
    items: [
      "Overland Track",
      { label: "Table Mountain", href: "https://www.strava.com/activities/13270686802" },
      { label: "Mt Kosciuszko", href: "https://www.strava.com/activities/16636317218" }
    ],
    links: [],
  },
  100: {
    path: 100,
    name: "Soccer",
    category: "interests",
    description: "",
    items: [
      "Keysborough District FC",
      "Monash University SC",
      "Adelaide City FC"
    ],
    links: [],
  },
  102: {
    path: 102,
    name: "Running",
    category: "interests",
    description: "",
    items: [
      { label: "Elephant Strava Art", href: "https://www.strava.com/activities/3486637449/flyover", sub: false },
      { label: "Turtle Strava Art", href: "https://www.strava.com/activities/5795277420", sub: false }
    ],
    links: [],
  }
};

export function getPathData(path: number): PathObject | null {
  return PATH_DATA[path] || null;
}
