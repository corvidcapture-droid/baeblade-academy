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
  contentVersion: 3,

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

  /* PROFILE QUIZ — about the Blader themselves.
     fx   = stat points (atk Attack, def Defense, sta Stamina, bal Balance)
     arch = archetype the answer leans towards (see archetypes below)
     look = phrase added to their character-art description */
  questions: [
    { text: "Your everyday style is…", role: "style", options: [
      { text: "Streetwear: sneakers, hoodies, caps", fx: { atk: 2, bal: 1 }, arch: "rebel", look: "streetwear: oversized hoodie or bomber jacket, baggy cargos, chunky sneakers and a cap" },
      { text: "Sharp and put-together", fx: { def: 2, bal: 1 }, arch: "strategist", look: "sharp smart-casual: a fitted tailored jacket, crisp collar, slim trousers and clean lines" },
      { text: "Sporty, always ready to move", fx: { sta: 2, atk: 1 }, arch: "hero", look: "sporty athleisure: zip-up track jacket, joggers, running shoes and a sweatband" },
      { text: "Vintage and thrifted, one of a kind", fx: { bal: 3 }, arch: "free", look: "vintage thrift: patched denim jacket over a faded band tee, covered in pins and badges" },
      { text: "All black everything", fx: { def: 2, sta: 1 }, arch: "wolf", look: "all-black minimalist: layered black pieces, black boots, one small accent colour" },
      { text: "Loud colours and prints", fx: { atk: 2, bal: 1 }, arch: "star", look: "loud maximalist: bold clashing prints, bright colours and statement jewellery" },
      { text: "Preppy: collars, knits, loafers", fx: { def: 2, bal: 1 }, arch: "hero", look: "preppy: varsity jacket or cable-knit sweater over a collared shirt, chinos and loafers" } ] },

    { text: "Pick the walk-out music for your first battle.", options: [
      { text: "Heavy rock or metal", fx: { atk: 3 }, arch: "rebel", look: "rock-and-roll edge with studs and a torn sleeve" },
      { text: "Amapiano or hip-hop", fx: { bal: 2, atk: 1 }, arch: "star", look: "chains and swagger, hip-hop energy" },
      { text: "Pounding techno or EDM", fx: { sta: 2, atk: 1 }, arch: "free", look: "neon rave light trails" },
      { text: "Epic movie score", fx: { def: 2, bal: 1 }, arch: "hero", look: "heroic cinematic lighting" },
      { text: "Something nobody else has heard of", fx: { sta: 2, def: 1 }, arch: "wolf", look: "mysterious indie-kid details" },
      { text: "80s synthwave", fx: { bal: 2, sta: 1 }, arch: "strategist", look: "retro 80s synthwave glow" } ] },

    { text: "Your perfect free day?", options: [
      { text: "Something with an adrenaline rush", fx: { atk: 3 }, arch: "hero", look: "windswept, mid-action energy" },
      { text: "A long gaming session", fx: { def: 2, sta: 1 }, arch: "strategist", look: "gamer touches: a headset mic and controller-button motifs" },
      { text: "Outside: hike, surf or ride", fx: { sta: 3 }, arch: "free", look: "outdoor adventurer touches, rugged and sun-kissed" },
      { text: "Making something: art, music, food", fx: { bal: 3 }, arch: "free", look: "creative maker details, paint flecks on the sleeves" },
      { text: "Out with a big crowd", fx: { atk: 1, bal: 2 }, arch: "star", look: "crowd-pleaser charisma, a fan-favourite look" },
      { text: "Completely off the grid", fx: { def: 3 }, arch: "wolf", look: "lone-traveller look with a weathered hooded layer" } ] },

    { text: "Which world would you rather live in?", options: [
      { text: "Neon cyberpunk city", fx: { atk: 2, bal: 1 }, arch: "rebel", look: "neon cyberpunk city skyline in the background" },
      { text: "Ancient mountain temple", fx: { def: 2, sta: 1 }, arch: "strategist", look: "misty ancient mountain temple in the background" },
      { text: "Deep-space station", fx: { sta: 2, bal: 1 }, arch: "wolf", look: "starfield and space station in the background" },
      { text: "Wild jungle", fx: { atk: 1, sta: 2 }, arch: "free", look: "wild glowing jungle in the background" },
      { text: "Stadium under floodlights", fx: { atk: 2, bal: 1 }, arch: "star", look: "packed floodlit stadium in the background" },
      { text: "Floating sky kingdom", fx: { bal: 2, def: 1 }, arch: "hero", look: "floating sky islands in the background" } ] },

    { text: "Your friends would call you…", options: [
      { text: "Intense", fx: { atk: 3 }, arch: "rebel", look: "an intense, fiery stare" },
      { text: "The reliable one", fx: { def: 3 }, arch: "hero", look: "a calm, steady expression" },
      { text: "Unstoppable", fx: { sta: 2, atk: 1 }, arch: "hero", look: "a determined grin" },
      { text: "The funny one", fx: { bal: 3 }, arch: "star", look: "a cheeky, playful smile" },
      { text: "The mastermind", fx: { def: 1, bal: 2 }, arch: "strategist", look: "a knowing half-smile" },
      { text: "Mysterious", fx: { sta: 2, def: 1 }, arch: "wolf", look: "a cool, unreadable expression" } ] },

    { text: "Pick a superpower.", options: [
      { text: "Super speed", fx: { atk: 2, sta: 1 }, arch: "hero", look: "speed lines streaking around them" },
      { text: "Force field", fx: { def: 3 }, arch: "strategist", look: "a faint hexagonal energy shield" },
      { text: "Never get tired", fx: { sta: 3 }, arch: "wolf", look: "a steady, endless glow in their eyes" },
      { text: "Shapeshifting", fx: { bal: 3 }, arch: "free", look: "subtle shifting patterns across their clothes" },
      { text: "Control lightning", fx: { atk: 3 }, arch: "rebel", look: "sparks dancing on their fingertips" },
      { text: "Make everyone love you", fx: { bal: 2, atk: 1 }, arch: "star", look: "a spotlight glow" } ] },

    { text: "A rival trash-talks you before a match. You…", options: [
      { text: "Launch first and launch hard", fx: { atk: 3 }, arch: "rebel", look: "an aggressive forward lean" },
      { text: "Smile and let them wear themselves out", fx: { def: 3, sta: 1 }, arch: "strategist", look: "relaxed, unbothered body language" },
      { text: "Say nothing. Still spinning when they stop", fx: { sta: 3 }, arch: "wolf", look: "silent, focused body language" },
      { text: "Trash-talk back, louder", fx: { atk: 2, bal: 1 }, arch: "star", look: "a showboating, crowd-facing stance" } ] },

    { text: "Your animal energy?", options: [
      { text: "Shark", fx: { atk: 3 }, arch: "rebel", look: "shark-tooth motif on their gear" },
      { text: "Tortoise", fx: { def: 3 }, arch: "strategist", look: "hexagonal shell-plate motif on their gear" },
      { text: "Eagle", fx: { sta: 2, atk: 1 }, arch: "hero", look: "wing motif on their gear" },
      { text: "Fox", fx: { bal: 3 }, arch: "free", look: "fox-tail tassel on their gear" },
      { text: "Wolf", fx: { sta: 2, def: 1 }, arch: "wolf", look: "wolf-fang motif on their gear" },
      { text: "Peacock", fx: { bal: 2, atk: 1 }, arch: "star", look: "iridescent feather-pattern trim" } ] },

    { text: "Pre-battle fuel?", options: [
      { text: "Something extra spicy", fx: { atk: 3 }, arch: "rebel" },
      { text: "Biltong", fx: { def: 2, sta: 1 }, arch: "hero" },
      { text: "Energy drink", fx: { sta: 2, atk: 1 }, arch: "star" },
      { text: "A sweet treat", fx: { bal: 3 }, arch: "free" },
      { text: "Nothing. Focus", fx: { sta: 2, def: 1 }, arch: "wolf" } ] },

    { text: "In a group, you're the one who…", options: [
      { text: "Pitches the big, bold idea", fx: { atk: 3 }, arch: "rebel" },
      { text: "Spots the problems early", fx: { def: 3 }, arch: "strategist" },
      { text: "Keeps going after everyone quits", fx: { sta: 3 }, arch: "hero" },
      { text: "Keeps everyone laughing", fx: { bal: 3 }, arch: "star" },
      { text: "Quietly does it their own way", fx: { sta: 2, bal: 1 }, arch: "wolf" } ] },

    { text: "Last 30 seconds of a close match.", options: [
      { text: "All in. Big finish", fx: { atk: 3 }, arch: "hero" },
      { text: "Hold the line. Give them nothing", fx: { def: 3 }, arch: "strategist" },
      { text: "Stay calm. They'll tire first", fx: { sta: 3 }, arch: "wolf" },
      { text: "Read the moment, then improvise", fx: { bal: 3 }, arch: "free" } ] },

    { text: "What's your launch style?", options: [
      { text: "Full power, every time", fx: { atk: 3 }, arch: "rebel" },
      { text: "Steady and dead centre", fx: { def: 2, bal: 1 }, arch: "strategist" },
      { text: "Smooth and controlled", fx: { sta: 3 }, arch: "wolf" },
      { text: "With a flourish. It's a show", fx: { bal: 2, atk: 1 }, arch: "star" } ] }
  ],

  /* ARCHETYPES — the profile quiz tallies "arch" picks; the top one is shown on the Blader card
     and its look is added to the art description. */
  archetypes: {
    rebel:      { name: "The Rebel",      blurb: "Breaks the rules and the opponent's Bey.", look: "rebel attitude, a little scuffed and defiant" },
    strategist: { name: "The Strategist", blurb: "Three moves ahead before the launch.", look: "composed strategist, sharp eyes, precise posture" },
    hero:       { name: "The Hero",       blurb: "Never quits. Always shows up for the team.", look: "classic shonen hero energy, heroic and bright" },
    star:       { name: "The Showstopper", blurb: "Plays to the crowd and wins it.", look: "showstopper flair and celebrity confidence" },
    wolf:       { name: "The Lone Wolf",  blurb: "Quiet, focused and impossible to read.", look: "lone-wolf cool, partly in shadow" },
    free:       { name: "The Free Spirit", blurb: "Unpredictable, creative, never the same twice.", look: "free-spirited, playful and unpredictable vibe" }
  },

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
     Edit or add your own in Admin → Team quiz. */
  teamQuiz: [
    { text: "What are the four Beyblade types?", options: ["Attack, Defense, Stamina, Balance", "Fire, Water, Earth, Air", "Speed, Power, Spin, Luck", "Strike, Guard, Endure, Dodge"], correct: 0, seconds: 20 },
    { text: "Which country do Beyblades come from?", options: ["USA", "Japan", "South Korea", "Germany"], correct: 1, seconds: 15 },
    { text: "Which toy company created Beyblade?", options: ["Hasbro", "Bandai", "Takara Tomy", "Mattel"], correct: 2, seconds: 15 },
    { text: "What keeps a spinning top standing upright?", options: ["Magnetism", "Angular momentum", "Air pressure", "Static electricity"], correct: 1, seconds: 20 },
    { text: "Which Blader type wins by outlasting everyone?", options: ["Attack", "Defense", "Stamina", "Balance"], correct: 2, seconds: 15 },
    { text: "Which planet is called the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Mercury"], correct: 2, seconds: 15 },
    { text: "What do you shout before a launch?", options: ["Go go go!", "Let it rip!", "Spin to win!", "Battle on!"], correct: 1, seconds: 15 },
    { text: "Which animal is the fastest on land?", options: ["Lion", "Cheetah", "Springbok", "Horse"], correct: 1, seconds: 15 }
  ]
};
