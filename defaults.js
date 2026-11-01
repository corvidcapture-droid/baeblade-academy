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
  contentVersion: 4,

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

  /* CHARACTER QUESTIONS — asked after the profile quiz. These are about the real person,
     so each character looks like them, not like a costume.
     slot: "outfit" (what they wear), "person" (features and personal touches), "scene" (aura and pose)
     look: phrase added to the art description. Typed questions use {answer} in "look". */
  charQuiz: [
    { text: "Which colours do you actually love wearing?", slot: "outfit", options: [
      { text: "Black and white", look: "black and white colour palette" },
      { text: "Earthy: olive, tan, brown", look: "earthy olive, tan and brown palette" },
      { text: "Blues and denim", look: "blues and denim palette" },
      { text: "Reds and burgundy", look: "red and burgundy palette" },
      { text: "Pastels", look: "soft pastel palette" },
      { text: "Neon and brights", look: "neon and bright colour palette" },
      { text: "Purples and pinks", look: "purple and pink palette" },
      { text: "Greys and navy", look: "grey and navy palette" } ] },

    { text: "Describe your favourite outfit in a few words.", slot: "outfit", type: "text", placeholder: "e.g. oversized Chiefs jersey, ripped jeans, white Air Forces", look: "their favourite real-life outfit, recreated faithfully: {answer}" },

    { text: "What's on your feet most days?", slot: "outfit", options: [
      { text: "Chunky sneakers", look: "chunky sneakers" },
      { text: "Clean white sneakers", look: "clean white sneakers" },
      { text: "Boots", look: "boots" },
      { text: "Slides or sandals", look: "slides" },
      { text: "Skate shoes", look: "skate shoes" },
      { text: "Smart shoes", look: "smart leather shoes" },
      { text: "Barefoot if I can", look: "barefoot" } ] },

    { text: "Do you wear glasses?", slot: "person", options: [
      { text: "Yes, all the time", look: "wearing their everyday glasses" },
      { text: "Sunglasses are my thing", look: "sunglasses perched on their head" },
      { text: "No", look: "" } ] },

    { text: "Your signature thing, the one people know you for?", slot: "person", options: [
      { text: "A cap or beanie", look: "their signature cap or beanie" },
      { text: "A chain or necklace", look: "their signature chain necklace" },
      { text: "Earrings or piercings", look: "their earrings and piercings" },
      { text: "Rings and bracelets", look: "stacked rings and bracelets" },
      { text: "A watch", look: "a standout wristwatch" },
      { text: "Tattoos", look: "visible tattoos on their arms" },
      { text: "Headphones", look: "headphones around their neck" },
      { text: "Nails always done", look: "bold painted nails" },
      { text: "Nothing, I keep it simple", look: "" } ] },

    { text: "What are you really into?", slot: "person", options: [
      { text: "Music: playing or producing", look: "a nod to their love of music, like a guitar pick or headphones" },
      { text: "Photography and video", look: "a camera slung on a strap" },
      { text: "Gaming", look: "a game controller clipped to their belt" },
      { text: "Sport", look: "sporty sweatband and a team-coloured detail" },
      { text: "Art and design", look: "paint-smudged fingers and a sketchbook tucked away" },
      { text: "Cars and bikes", look: "a racing-style patch and keys on a carabiner" },
      { text: "Food and cooking", look: "a small chef's touch, like a rolled-up bandana" },
      { text: "Outdoors and adventure", look: "a rugged adventure strap and carabiner" },
      { text: "Books and stories", look: "a worn paperback tucked into a pocket" },
      { text: "Tech and building things", look: "a tech gadget on their wrist" } ] },

    { text: "One thing that's very you: a team, a pet, a catchphrase, anything.", slot: "person", type: "text", placeholder: "e.g. my Staffie Bruno, Liverpool fan, always says 'shap'", look: "include a small personal touch that is unmistakably theirs: {answer}" },

    { text: "When you launch, the arena fills with…", slot: "scene", options: [
      { text: "Lightning", look: "crackling lightning aura" },
      { text: "Fire", look: "blazing fire aura" },
      { text: "A tornado", look: "swirling wind tornado aura" },
      { text: "Shadow smoke", look: "dark shadow smoke aura" },
      { text: "Crystal shards", look: "floating crystal shard aura" },
      { text: "Ocean waves", look: "crashing water wave aura" } ] },

    { text: "Strike a pose.", slot: "scene", options: [
      { text: "Mid-launch, ripcord flying", look: "pose: mid-launch, pulling the launcher ripcord" },
      { text: "Holding my Bey up to the camera", look: "pose: holding their spinning top up towards the viewer" },
      { text: "Arms crossed, unbothered", look: "pose: arms crossed, confident" },
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
