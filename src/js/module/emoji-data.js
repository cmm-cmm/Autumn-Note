/**
 * emoji-data.js — Emoji catalogue for EmojiDialog.
 *
 * Kept in its own module and pulled in with a dynamic import so the ~25 KB
 * table (≈6 KB gzip) becomes a separate chunk instead of riding along in the
 * main bundle for every consumer, including those whose toolbar has no emoji
 * button. The UMD/CDN build inlines it again, since script tags cannot fetch
 * chunks.
 */

export const EMOJI_CATS = [
  { id: 'smileys', label: 'Smileys' },
  { id: 'people', label: 'People' },
  { id: 'animals', label: 'Animals' },
  { id: 'food', label: 'Food' },
  { id: 'travel', label: 'Travel' },
  { id: 'objects', label: 'Objects' },
  { id: 'symbols', label: 'Symbols' },
];

// One emoji per line, "<emoji> <search keywords>", grouped by category.
// Stored as text rather than [emoji, keywords, category] triples: the per-entry
// brackets, quotes and repeated category name cost ~0.5 KB gzip in the CDN build.
const RAW = {
  smileys: `
😀 grin smile happy face
😃 happy smile big eyes
😄 grinning smile laugh
😁 beaming smile grin
😆 laughing lol
😅 sweat grin awkward
🤣 rolling laugh rofl
😂 tears laugh cry joy
🙂 slight smile
🙃 upside down smile
😉 wink
😊 blush smile happy
😇 innocent halo angel
🥰 hearts love adore
😍 heart eyes love
🤩 star eyes excited wow
😘 kiss blow love
😋 yum delicious tongue
😛 tongue stuck out
😜 wink tongue crazy
🤪 zany crazy wild
😝 squint tongue
🤑 money mouth
🤗 hugging hug
🤔 thinking hmm
🤨 raised eyebrow
😐 neutral face
😶 no mouth
😏 smirk
😒 unamused
🙄 roll eyes
😬 grimace
😔 pensive sad
😪 sleepy tired
😴 sleeping zzz
🤤 drool
😷 mask sick
🤒 sick thermometer
🤕 hurt bandage
🤢 nausea sick
🤮 vomit sick
🤧 sneeze cold
🥵 hot sweat
🥶 cold freeze
😵 dizzy dead
🤯 mind blown
🤠 cowboy hat
🥳 party celebrate
😎 cool sunglasses
🤓 nerd glasses
🧐 monocle curious
😕 confused
😟 worried
🙁 frown sad
☹️ sad frown
😮 surprised open mouth
😲 astonished
🥺 pleading begging puppy eyes
😢 cry sad tear
😭 sob cry loudly
😱 scream horror fear
😡 angry red pouting
😠 angry mad
🤬 cursing swear
😈 devil evil smile
👿 devil angry evil
💀 skull death
☠️ skull crossbones
💩 poop
🤡 clown
👻 ghost boo
👽 alien ufo
🤖 robot`,
  people: `
👋 wave hello hi hand
🤚 raised back hand
✋ raised hand stop
🖖 vulcan salute spock
👌 ok perfect fine
✌️ peace victory fingers
🤞 fingers crossed luck
🤟 love you gesture
🤘 sign of horns rock
🤙 call me hand
👈 point left
👉 point right
👆 point up
👇 point down
☝️ index pointing up
👍 thumbs up like good
👎 thumbs down dislike bad
✊ raised fist punch
👊 oncoming fist punch
👏 clap applause
🙌 celebrate raise hands
🤝 handshake deal
🙏 pray hope please thanks
💅 nail polish
💪 flexed bicep strong muscle
👀 eyes look see
👁️ eye
👅 tongue
👶 baby
🧒 child
👦 boy
👧 girl
🧑 person adult
👨 man
👩 woman
🧔 beard man
🧓 older person
👴 old man
👵 old woman
❤️ heart love red
🧡 orange heart love
💛 yellow heart love
💚 green heart love
💙 blue heart love
💜 purple heart love
🖤 black heart
🤍 white heart
🤎 brown heart
💔 broken heart
❣️ exclamation heart
💕 two hearts love
💞 revolving hearts
💓 beating heart
💗 growing heart
💖 sparkling heart
💘 heart arrow
💝 heart ribbon
💬 speech bubble comment chat
💭 thought bubble
💯 100 hundred percent perfect
💢 anger symbol mad
💤 zzz sleep`,
  animals: `
🐶 dog puppy
🐱 cat kitten
🐭 mouse
🐹 hamster
🐰 rabbit bunny
🦊 fox
🐻 bear
🐼 panda
🐨 koala
🐯 tiger
🦁 lion
🐮 cow
🐷 pig
🐸 frog
🐵 monkey
🙈 see no evil monkey
🙉 hear no evil monkey
🙊 speak no evil monkey
🐔 chicken hen
🐧 penguin
🐦 bird
🦆 duck
🦅 eagle
🦉 owl
🦇 bat
🐺 wolf
🐴 horse
🦄 unicorn
🐝 bee
🦋 butterfly
🐌 snail
🐞 ladybug
🐢 turtle
🐍 snake
🦎 lizard
🐊 crocodile
🐟 fish
🐠 tropical fish
🦈 shark
🐬 dolphin
🐳 whale
🐙 octopus
🦑 squid
🦀 crab
🌸 cherry blossom flower
🌺 hibiscus flower
🌻 sunflower
🌹 rose flower
🌷 tulip flower
🍀 four leaf clover luck
🌿 herb leaf green
🌱 seedling sprout
🌲 evergreen tree pine
🌳 deciduous tree
🌴 palm tree
🍄 mushroom
🌾 sheaf wheat
🐾 paw prints animal`,
  food: `
🍎 apple red
🍊 orange tangerine
🍋 lemon yellow
🍇 grapes
🍓 strawberry
🫐 blueberry
🍒 cherry
🍑 peach
🥭 mango
🍍 pineapple
🥥 coconut
🥝 kiwi
🍅 tomato
🥑 avocado
🍆 eggplant aubergine
🥕 carrot
🌽 corn
🥦 broccoli
🥬 leafy green
🧄 garlic
🥜 peanut nut
🍞 bread loaf
🥐 croissant
🧀 cheese
🍳 egg fry cooking
🥚 egg
🥞 pancake
🧇 waffle
🥓 bacon
🥩 meat steak
🍗 chicken leg
🌭 hotdog
🍔 burger hamburger
🍟 fries french
🍕 pizza
🌮 taco
🌯 burrito wrap
🍜 noodles ramen
🍝 spaghetti pasta
🍣 sushi
🍱 bento box
🍦 ice cream soft serve
🍩 donut
🍪 cookie
🎂 birthday cake
🍰 cake slice
🧁 cupcake
🍫 chocolate
🍬 candy
🍭 lollipop
☕ coffee hot
🍵 tea hot
🧋 bubble tea boba
🥤 cup straw drink
🍷 wine red
🍸 cocktail martini
🍺 beer mug
🍻 clinking beer mugs
🥂 champagne toast celebrate
🧃 juice box
🧊 ice cube`,
  travel: `
🚀 rocket space
🛸 ufo flying saucer
✈️ airplane plane fly
🚁 helicopter
🚂 train locomotive
🚄 bullet train fast
🚇 subway metro
🚌 bus
🚑 ambulance
🚒 fire truck
🚓 police car
🚕 taxi cab
🚗 car automobile red
🚙 suv car
🚚 truck delivery
🚜 tractor farm
🏎️ racing car fast
🏍️ motorcycle
🚲 bicycle bike
🛴 scooter kick
⛵ sailboat boat
🚢 ship cruise
🏠 house home
🏢 office building
🏥 hospital
🏦 bank
🏪 store shop convenience
🏫 school
🏰 castle european
🏯 japanese castle
🗼 tokyo tower
🗽 statue liberty new york
⛪ church
🕌 mosque
⛩️ shinto shrine
⛲ fountain
⛺ tent camping
🌁 fog foggy bridge
🌃 night city stars
🏙️ cityscape city buildings
🌅 sunrise morning
🌈 rainbow colorful
⛰️ mountain
🏔️ snow mountain
🗻 mount fuji
🏕️ camping tent
🗺️ world map
🧭 compass navigation
🌍 earth europe africa globe
🌎 earth americas globe
🌏 earth asia globe
🌐 globe internet web`,
  objects: `
💎 diamond gem jewel
💍 ring engagement
👑 crown royal king queen
🎩 top hat magic
💼 briefcase work business
👜 handbag purse
🎒 backpack bag school
👓 glasses eyewear
🕶️ sunglasses cool
💡 light bulb idea
🔦 flashlight torch
🕯️ candle light
🔋 battery charge
💻 laptop computer
🖥️ desktop monitor computer
📱 phone mobile cell
⌨️ keyboard type
🖱️ mouse computer click
📺 television tv
📷 camera photo
📹 video camera
🎥 movie camera film
☎️ telephone phone
⏰ alarm clock wake
⌚ watch time
🔑 key
🗝️ old key
🔒 lock closed
🔓 unlock open
🔨 hammer tool
🔧 wrench tool
🔩 bolt nut
⚙️ gear setting
🧲 magnet attract
📚 books stack library
📖 book open read
📝 memo write note
✏️ pencil write edit
📌 pushpin tack
📎 paperclip attach
📊 bar chart graph
📈 chart up growth trend
📉 chart down loss decline
📅 calendar date
📦 package box
📫 mailbox closed
📧 email envelope
🎁 gift present
🎀 ribbon bow
🎉 party celebrate confetti
🎊 confetti celebrate
🔮 crystal ball magic fortune
🪄 magic wand
🎯 target bullseye dart
🎲 dice game board
🎮 video game controller
🎭 theater masks drama
🎨 art palette paint
🎬 clapper film movie
🎤 microphone sing karaoke
🎧 headphones music listen
🎵 music note
🎶 music notes
🎸 guitar electric
🎹 piano keyboard music
🥁 drum percussion
🎷 saxophone jazz
🎺 trumpet
🎻 violin
⚽ soccer ball football
🏀 basketball
🏈 american football
⚾ baseball
🎾 tennis
🏐 volleyball
🏆 trophy winner award
🥇 gold medal first
🏅 sports medal`,
  symbols: `
✅ check green done success
❌ cross x no cancel
⭕ circle red
⛔ no entry stop
🚫 prohibited no banned
⚠️ warning caution danger
❗ exclamation red important
❓ question mark
‼️ double exclamation
💯 100 hundred percent perfect
🔴 red circle dot
🟠 orange circle
🟡 yellow circle
🟢 green circle
🔵 blue circle
🟣 purple circle
⚫ black circle
⚪ white circle
🟤 brown circle
🔺 red triangle up
🔻 red triangle down
🔷 blue diamond large
🔶 orange diamond large
🔹 blue diamond small
🔸 orange diamond small
⭐ star yellow
🌟 glowing star shine
✨ sparkles shine
💫 dizzy star spin
⚡ lightning bolt energy power
🔥 fire hot flame
💥 explosion boom
❄️ snowflake cold ice winter
🌊 wave water ocean sea
💨 wind blow dash
🌀 cyclone tornado spiral
♻️ recycle loop green
✔️ check tick done
➕ plus add
➖ minus subtract
➗ divide division
✖️ multiply times cross
▶️ play button right
⏸️ pause
⏹️ stop square
⏩ fast forward
⏪ rewind fast backward
🔔 bell notification
🔕 bell slash mute
🔊 speaker volume high
🔇 mute silent no sound
📢 loudspeaker announcement
📣 megaphone cheer
🏳️ white flag
🏴 black flag
🚩 red flag
🏁 checkered flag finish race
🆕 new badge
🆓 free badge
🆒 cool badge
🔝 top arrow
🔙 back arrow
ℹ️ information info
📍 pin location map
🔗 link chain
©️ copyright
®️ registered trademark
™️ trademark
#️⃣ hash number
0️⃣ zero number
1️⃣ one number
2️⃣ two number
3️⃣ three number
4️⃣ four number
5️⃣ five number`,
};

/** @type {Array<[string, string, string]>} [emoji_char, search_keywords, category] */
export const EMOJI_LIST = Object.entries(RAW).flatMap(([cat, text]) => text.trim().split('\n').map((line) => {
  const at = line.indexOf(' ');
  return [line.slice(0, at), line.slice(at + 1), cat];
}));
