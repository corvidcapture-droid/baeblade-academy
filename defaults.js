/*
  BAEBLADE ACADEMY — STARTING DATA

  This is only used the very first time the site opens (or after
  "Restore default questions" in Admin → Questions).
  After that, edit everything in the Admin panel — no code needed.

  Each answer's "fx" says how many points it adds to each stat:
    atk = Attack   def = Defense   sta = Stamina   bal = Balance
*/
window.BAEBLADE_DEFAULTS = {
  eventName: "Baeblade Academy",
  tagline: "Blader Assessment Day",

  roster: [
    { name: "Mig",    exp: "Expert" },
    { name: "Cuthy",  exp: "Beginner" },
    { name: "Josh",   exp: "Beginner" },
    { name: "Lerena", exp: "Beginner" },
    { name: "Barney", exp: "Beginner" },
    { name: "Katie",  exp: "Beginner" },
    { name: "Mitch",  exp: "Beginner" },
    { name: "Tony",   exp: "Expert" },
    { name: "Jeff",   exp: "Expert" },
    { name: "Paul",   exp: "Expert" },
    { name: "Storm",  exp: "Expert" },
    { name: "Jonny",  exp: "Expert" },
    { name: "Nkone",  exp: "Intermediate" }
  ],

  questions: [
    { text: "Alden has a completely free Saturday. What's the plan?", options: [
      { text: "Go-karting, then paintball. Full speed all day.", fx: { atk: 3, bal: 1 } },
      { text: "Doors locked, snacks stocked, nobody gets in.", fx: { def: 3 } },
      { text: "A long hike from sunrise to sunset.", fx: { sta: 3, def: 1 } },
      { text: "Bit of everything: brunch, a match, then a braai.", fx: { bal: 3, sta: 1 } } ] },

    { text: "A rival trash-talks you before a match. You…", options: [
      { text: "Launch first and launch hard.", fx: { atk: 3 } },
      { text: "Smile. Let them wear themselves out on my wall.", fx: { def: 3, sta: 1 } },
      { text: "Say nothing. I'll still be spinning when they stop.", fx: { sta: 3 } },
      { text: "Laugh it off and adapt to whatever they do.", fx: { bal: 3, def: 1 } } ] },

    { text: "Pick your weapon for a zombie movie.", options: [
      { text: "Cricket bat. Straight in.", fx: { atk: 3, bal: 1 } },
      { text: "Riot shield.", fx: { def: 3 } },
      { text: "Running shoes. I'll outlast everyone.", fx: { sta: 3 } },
      { text: "Whatever's nearby. I improvise.", fx: { bal: 3 } } ] },

    { text: "Group project. What's your job?", options: [
      { text: "I pitch the big, bold idea.", fx: { atk: 3 } },
      { text: "I catch everyone's mistakes.", fx: { def: 3 } },
      { text: "I'm the one still working at 2am.", fx: { sta: 3, def: 1 } },
      { text: "I keep everyone talking to each other.", fx: { bal: 3 } } ] },

    { text: "Load-shedding hits in the middle of game night.", options: [
      { text: "Torch on. Game continues. I'm winning.", fx: { atk: 2, sta: 1 } },
      { text: "Already got the inverter. You're welcome.", fx: { def: 3 } },
      { text: "Candles out. We play until the power's back.", fx: { sta: 3 } },
      { text: "Switch to cards and keep the vibe going.", fx: { bal: 3 } } ] },

    { text: "Dream car?", options: [
      { text: "Track-day hypercar.", fx: { atk: 3 } },
      { text: "Armoured Land Cruiser.", fx: { def: 3, sta: 1 } },
      { text: "A hybrid that never needs a fill-up.", fx: { sta: 3 } },
      { text: "Hot hatch: quick, practical, fun.", fx: { bal: 3, atk: 1 } } ] },

    { text: "Last 30 seconds of a close match.", options: [
      { text: "All in. Big finish.", fx: { atk: 3 } },
      { text: "Hold the line. Give them nothing.", fx: { def: 3 } },
      { text: "Stay calm. They'll tire before I do.", fx: { sta: 3 } },
      { text: "Read the moment, then commit.", fx: { bal: 3 } } ] },

    { text: "Pick an animal.", options: [
      { text: "Shark", fx: { atk: 3 } },
      { text: "Tortoise", fx: { def: 3, sta: 1 } },
      { text: "Albatross. Flies for days.", fx: { sta: 3 } },
      { text: "Leopard", fx: { bal: 2, atk: 1 } } ] },

    { text: "How do you eat a burger?", options: [
      { text: "Three bites. Gone.", fx: { atk: 3 } },
      { text: "Knife and fork, napkin ready.", fx: { def: 3 } },
      { text: "Slowly. Savour every bite.", fx: { sta: 3 } },
      { text: "Half now, half later with the chips.", fx: { bal: 3 } } ] },

    { text: "Your friends would describe you as…", options: [
      { text: "Intense", fx: { atk: 3 } },
      { text: "Reliable", fx: { def: 3 } },
      { text: "Unstoppable", fx: { sta: 2, atk: 1 } },
      { text: "Easy-going", fx: { bal: 3 } } ] },

    { text: "What's your launch style?", options: [
      { text: "Full power, every time.", fx: { atk: 3 } },
      { text: "Steady and dead centre.", fx: { def: 2, bal: 1 } },
      { text: "Smooth and controlled.", fx: { sta: 3 } },
      { text: "Depends on who I'm facing.", fx: { bal: 3 } } ] },

    { text: "Alden's birthday cake should be…", options: [
      { text: "Chilli chocolate. Bold.", fx: { atk: 3 } },
      { text: "A six-layer fortress.", fx: { def: 3 } },
      { text: "Big enough to last the whole weekend.", fx: { sta: 3 } },
      { text: "Half chocolate, half vanilla.", fx: { bal: 3 } } ] }
  ],

  /* CHARACTER QUESTIONS — asked after the profile quiz.
     "look" is the phrase each answer adds to that Blader's character description
     (the text you paste into Artlist with their photo). Edit in Admin → Profile quiz. */
  charQuiz: [
    { text: "Pick your Blader colours.", options: [
      { text: "Crimson red and black", look: "crimson red and black colour scheme" },
      { text: "Electric blue and silver", look: "electric blue and silver colour scheme" },
      { text: "Toxic green and charcoal", look: "toxic green and charcoal colour scheme" },
      { text: "Royal purple and gold", look: "royal purple and gold colour scheme" },
      { text: "Solar orange and white", look: "solar orange and white colour scheme" },
      { text: "Ice white and teal", look: "ice white and teal colour scheme" } ] },
    { text: "What do you battle in?", options: [
      { text: "Armoured street jacket", look: "armoured streetwear jacket with tech panels" },
      { text: "Ninja gear", look: "sleek ninja-inspired battle gear with a face wrap around the neck" },
      { text: "Racing suit", look: "fitted motor-racing suit with sponsor-style patches" },
      { text: "Futuristic tech armour", look: "futuristic light tech armour with glowing seams" },
      { text: "Samurai-inspired", look: "modern samurai-inspired outfit with shoulder guards" },
      { text: "Hoodie and cargo pants", look: "oversized hoodie and cargo pants, casual but battle-ready" } ] },
    { text: "Your signature accessory?", options: [
      { text: "Fingerless gloves", look: "fingerless battle gloves" },
      { text: "Visor goggles", look: "tinted visor goggles pushed up on the forehead" },
      { text: "Long scarf", look: "a long scarf trailing in the wind" },
      { text: "Headphones", look: "chunky headphones around the neck" },
      { text: "Cape", look: "a short dramatic cape" },
      { text: "Arm bracers", look: "metal arm bracers" } ] },
    { text: "When you launch, the arena fills with…", options: [
      { text: "Lightning", look: "crackling lightning aura" },
      { text: "Fire", look: "blazing fire aura" },
      { text: "A tornado", look: "swirling wind tornado aura" },
      { text: "Shadow smoke", look: "dark shadow smoke aura" },
      { text: "Crystal shards", look: "floating crystal shard aura" },
      { text: "Ocean waves", look: "crashing water wave aura" } ] },
    { text: "Your spirit beast?", options: [
      { text: "Dragon", look: "a translucent dragon spirit rising behind them" },
      { text: "Phoenix", look: "a translucent phoenix spirit rising behind them" },
      { text: "Wolf", look: "a translucent wolf spirit rising behind them" },
      { text: "Pegasus", look: "a translucent pegasus spirit rising behind them" },
      { text: "Tiger", look: "a translucent tiger spirit rising behind them" },
      { text: "Shark", look: "a translucent shark spirit rising behind them" },
      { text: "Raven", look: "a translucent raven spirit rising behind them" } ] },
    { text: "Strike a pose.", options: [
      { text: "Mid-launch, ripcord flying", look: "pose: mid-launch, pulling the launcher ripcord" },
      { text: "Holding my Bey up to the camera", look: "pose: holding their spinning top up towards the viewer" },
      { text: "Arms crossed, unbothered", look: "pose: arms crossed, confident smirk" },
      { text: "Crouched and ready", look: "pose: low crouch, launcher aimed, intense focus" },
      { text: "Pointing at my rival", look: "pose: pointing straight at the viewer as a challenge" } ] }
  ],

  /* LIVE TEAM QUIZ — played at the party on the TV.
     "correct" is the number of the right answer: 0 = first, 1 = second, 2 = third, 3 = fourth.
     The Alden questions are guesses: set the right answers in Admin → Team quiz. */
  teamQuiz: [
    { text: "How old is Alden turning?", options: ["8", "9", "10", "11"], correct: 2, seconds: 20, checkMe: true },
    { text: "What is Alden's favourite food?", options: ["Pizza", "Burgers", "Sushi", "Pasta"], correct: 0, seconds: 20, checkMe: true },
    { text: "Which Beyblade type is Alden?", options: ["Attack", "Defense", "Stamina", "Balance"], correct: 0, seconds: 20, checkMe: true },
    { text: "What are the four Beyblade types?", options: ["Attack, Defense, Stamina, Balance", "Fire, Water, Earth, Air", "Speed, Power, Spin, Luck", "Strike, Guard, Endure, Dodge"], correct: 0, seconds: 20 },
    { text: "Which country do Beyblades come from?", options: ["USA", "Japan", "South Korea", "Germany"], correct: 1, seconds: 15 },
    { text: "Which toy company created Beyblade?", options: ["Hasbro", "Bandai", "Takara Tomy", "Mattel"], correct: 2, seconds: 15 },
    { text: "What keeps a spinning top standing upright?", options: ["Magnetism", "Angular momentum", "Air pressure", "Static electricity"], correct: 1, seconds: 20 },
    { text: "Which planet is called the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Mercury"], correct: 2, seconds: 15 }
  ]
};
