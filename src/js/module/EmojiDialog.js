/**
 * EmojiDialog.js - Browse and insert Unicode emoji / symbols (UTF-8 / utf8mb4)
 * Click an emoji to insert it directly at the caret — no extra "Insert" step.
 */

import { createElement, on } from '../core/dom.js';
import { withSavedRange } from '../core/range.js';

// ---------------------------------------------------------------------------
// Emoji catalogue
// ---------------------------------------------------------------------------

const EMOJI_CATS = [
  { id: 'smileys', label: 'Smileys'  },
  { id: 'people',  label: 'People'   },
  { id: 'animals', label: 'Animals'  },
  { id: 'food',    label: 'Food'     },
  { id: 'travel',  label: 'Travel'   },
  { id: 'objects', label: 'Objects'  },
  { id: 'symbols', label: 'Symbols'  },
];

// [emoji_char, search_keywords, category]
const EMOJI_LIST = [
  // Smileys & Emotions
  ['😀', 'grin smile happy face',          'smileys'],
  ['😃', 'happy smile big eyes',            'smileys'],
  ['😄', 'grinning smile laugh',            'smileys'],
  ['😁', 'beaming smile grin',              'smileys'],
  ['😆', 'laughing lol',                   'smileys'],
  ['😅', 'sweat grin awkward',              'smileys'],
  ['🤣', 'rolling laugh rofl',              'smileys'],
  ['😂', 'tears laugh cry joy',             'smileys'],
  ['🙂', 'slight smile',                   'smileys'],
  ['🙃', 'upside down smile',               'smileys'],
  ['😉', 'wink',                           'smileys'],
  ['😊', 'blush smile happy',              'smileys'],
  ['😇', 'innocent halo angel',            'smileys'],
  ['🥰', 'hearts love adore',              'smileys'],
  ['😍', 'heart eyes love',                'smileys'],
  ['🤩', 'star eyes excited wow',          'smileys'],
  ['😘', 'kiss blow love',                 'smileys'],
  ['😋', 'yum delicious tongue',           'smileys'],
  ['😛', 'tongue stuck out',               'smileys'],
  ['😜', 'wink tongue crazy',              'smileys'],
  ['🤪', 'zany crazy wild',                'smileys'],
  ['😝', 'squint tongue',                  'smileys'],
  ['🤑', 'money mouth',                    'smileys'],
  ['🤗', 'hugging hug',                    'smileys'],
  ['🤔', 'thinking hmm',                   'smileys'],
  ['🤨', 'raised eyebrow',                 'smileys'],
  ['😐', 'neutral face',                   'smileys'],
  ['😶', 'no mouth',                       'smileys'],
  ['😏', 'smirk',                          'smileys'],
  ['😒', 'unamused',                       'smileys'],
  ['🙄', 'roll eyes',                      'smileys'],
  ['😬', 'grimace',                        'smileys'],
  ['😔', 'pensive sad',                    'smileys'],
  ['😪', 'sleepy tired',                   'smileys'],
  ['😴', 'sleeping zzz',                   'smileys'],
  ['🤤', 'drool',                          'smileys'],
  ['😷', 'mask sick',                      'smileys'],
  ['🤒', 'sick thermometer',               'smileys'],
  ['🤕', 'hurt bandage',                   'smileys'],
  ['🤢', 'nausea sick',                    'smileys'],
  ['🤮', 'vomit sick',                     'smileys'],
  ['🤧', 'sneeze cold',                    'smileys'],
  ['🥵', 'hot sweat',                      'smileys'],
  ['🥶', 'cold freeze',                    'smileys'],
  ['😵', 'dizzy dead',                     'smileys'],
  ['🤯', 'mind blown',                     'smileys'],
  ['🤠', 'cowboy hat',                     'smileys'],
  ['🥳', 'party celebrate',                'smileys'],
  ['😎', 'cool sunglasses',                'smileys'],
  ['🤓', 'nerd glasses',                   'smileys'],
  ['🧐', 'monocle curious',                'smileys'],
  ['😕', 'confused',                       'smileys'],
  ['😟', 'worried',                        'smileys'],
  ['🙁', 'frown sad',                      'smileys'],
  ['☹️', 'sad frown',                      'smileys'],
  ['😮', 'surprised open mouth',           'smileys'],
  ['😲', 'astonished',                     'smileys'],
  ['🥺', 'pleading begging puppy eyes',    'smileys'],
  ['😢', 'cry sad tear',                   'smileys'],
  ['😭', 'sob cry loudly',                 'smileys'],
  ['😱', 'scream horror fear',             'smileys'],
  ['😡', 'angry red pouting',              'smileys'],
  ['😠', 'angry mad',                      'smileys'],
  ['🤬', 'cursing swear',                  'smileys'],
  ['😈', 'devil evil smile',               'smileys'],
  ['👿', 'devil angry evil',               'smileys'],
  ['💀', 'skull death',                    'smileys'],
  ['☠️', 'skull crossbones',               'smileys'],
  ['💩', 'poop',                           'smileys'],
  ['🤡', 'clown',                          'smileys'],
  ['👻', 'ghost boo',                      'smileys'],
  ['👽', 'alien ufo',                      'smileys'],
  ['🤖', 'robot',                          'smileys'],

  // People & Body
  ['👋', 'wave hello hi hand',             'people'],
  ['🤚', 'raised back hand',               'people'],
  ['✋', 'raised hand stop',               'people'],
  ['🖖', 'vulcan salute spock',            'people'],
  ['👌', 'ok perfect fine',               'people'],
  ['✌️', 'peace victory fingers',          'people'],
  ['🤞', 'fingers crossed luck',           'people'],
  ['🤟', 'love you gesture',               'people'],
  ['🤘', 'sign of horns rock',             'people'],
  ['🤙', 'call me hand',                   'people'],
  ['👈', 'point left',                     'people'],
  ['👉', 'point right',                    'people'],
  ['👆', 'point up',                       'people'],
  ['👇', 'point down',                     'people'],
  ['☝️', 'index pointing up',              'people'],
  ['👍', 'thumbs up like good',            'people'],
  ['👎', 'thumbs down dislike bad',        'people'],
  ['✊', 'raised fist punch',              'people'],
  ['👊', 'oncoming fist punch',            'people'],
  ['👏', 'clap applause',                  'people'],
  ['🙌', 'celebrate raise hands',          'people'],
  ['🤝', 'handshake deal',                 'people'],
  ['🙏', 'pray hope please thanks',        'people'],
  ['💅', 'nail polish',                    'people'],
  ['💪', 'flexed bicep strong muscle',     'people'],
  ['👀', 'eyes look see',                  'people'],
  ['👁️', 'eye',                           'people'],
  ['👅', 'tongue',                         'people'],
  ['👶', 'baby',                           'people'],
  ['🧒', 'child',                          'people'],
  ['👦', 'boy',                            'people'],
  ['👧', 'girl',                           'people'],
  ['🧑', 'person adult',                   'people'],
  ['👨', 'man',                            'people'],
  ['👩', 'woman',                          'people'],
  ['🧔', 'beard man',                      'people'],
  ['🧓', 'older person',                   'people'],
  ['👴', 'old man',                        'people'],
  ['👵', 'old woman',                      'people'],
  ['❤️', 'heart love red',                'people'],
  ['🧡', 'orange heart love',              'people'],
  ['💛', 'yellow heart love',              'people'],
  ['💚', 'green heart love',               'people'],
  ['💙', 'blue heart love',                'people'],
  ['💜', 'purple heart love',              'people'],
  ['🖤', 'black heart',                    'people'],
  ['🤍', 'white heart',                    'people'],
  ['🤎', 'brown heart',                    'people'],
  ['💔', 'broken heart',                   'people'],
  ['❣️', 'exclamation heart',              'people'],
  ['💕', 'two hearts love',                'people'],
  ['💞', 'revolving hearts',               'people'],
  ['💓', 'beating heart',                  'people'],
  ['💗', 'growing heart',                  'people'],
  ['💖', 'sparkling heart',                'people'],
  ['💘', 'heart arrow',                    'people'],
  ['💝', 'heart ribbon',                   'people'],
  ['💬', 'speech bubble comment chat',     'people'],
  ['💭', 'thought bubble',                 'people'],
  ['💯', '100 hundred percent perfect',    'people'],
  ['💢', 'anger symbol mad',               'people'],
  ['💤', 'zzz sleep',                      'people'],

  // Animals & Nature
  ['🐶', 'dog puppy',                      'animals'],
  ['🐱', 'cat kitten',                     'animals'],
  ['🐭', 'mouse',                          'animals'],
  ['🐹', 'hamster',                        'animals'],
  ['🐰', 'rabbit bunny',                   'animals'],
  ['🦊', 'fox',                            'animals'],
  ['🐻', 'bear',                           'animals'],
  ['🐼', 'panda',                          'animals'],
  ['🐨', 'koala',                          'animals'],
  ['🐯', 'tiger',                          'animals'],
  ['🦁', 'lion',                           'animals'],
  ['🐮', 'cow',                            'animals'],
  ['🐷', 'pig',                            'animals'],
  ['🐸', 'frog',                           'animals'],
  ['🐵', 'monkey',                         'animals'],
  ['🙈', 'see no evil monkey',             'animals'],
  ['🙉', 'hear no evil monkey',            'animals'],
  ['🙊', 'speak no evil monkey',           'animals'],
  ['🐔', 'chicken hen',                    'animals'],
  ['🐧', 'penguin',                        'animals'],
  ['🐦', 'bird',                           'animals'],
  ['🦆', 'duck',                           'animals'],
  ['🦅', 'eagle',                          'animals'],
  ['🦉', 'owl',                            'animals'],
  ['🦇', 'bat',                            'animals'],
  ['🐺', 'wolf',                           'animals'],
  ['🐴', 'horse',                          'animals'],
  ['🦄', 'unicorn',                        'animals'],
  ['🐝', 'bee',                            'animals'],
  ['🦋', 'butterfly',                      'animals'],
  ['🐌', 'snail',                          'animals'],
  ['🐞', 'ladybug',                        'animals'],
  ['🐢', 'turtle',                         'animals'],
  ['🐍', 'snake',                          'animals'],
  ['🦎', 'lizard',                         'animals'],
  ['🐊', 'crocodile',                      'animals'],
  ['🐟', 'fish',                           'animals'],
  ['🐠', 'tropical fish',                  'animals'],
  ['🦈', 'shark',                          'animals'],
  ['🐬', 'dolphin',                        'animals'],
  ['🐳', 'whale',                          'animals'],
  ['🐙', 'octopus',                        'animals'],
  ['🦑', 'squid',                          'animals'],
  ['🦀', 'crab',                           'animals'],
  ['🌸', 'cherry blossom flower',          'animals'],
  ['🌺', 'hibiscus flower',                'animals'],
  ['🌻', 'sunflower',                      'animals'],
  ['🌹', 'rose flower',                    'animals'],
  ['🌷', 'tulip flower',                   'animals'],
  ['🍀', 'four leaf clover luck',          'animals'],
  ['🌿', 'herb leaf green',                'animals'],
  ['🌱', 'seedling sprout',                'animals'],
  ['🌲', 'evergreen tree pine',            'animals'],
  ['🌳', 'deciduous tree',                 'animals'],
  ['🌴', 'palm tree',                      'animals'],
  ['🍄', 'mushroom',                       'animals'],
  ['🌾', 'sheaf wheat',                    'animals'],
  ['🐾', 'paw prints animal',              'animals'],

  // Food & Drink
  ['🍎', 'apple red',                      'food'],
  ['🍊', 'orange tangerine',               'food'],
  ['🍋', 'lemon yellow',                   'food'],
  ['🍇', 'grapes',                         'food'],
  ['🍓', 'strawberry',                     'food'],
  ['🫐', 'blueberry',                      'food'],
  ['🍒', 'cherry',                         'food'],
  ['🍑', 'peach',                          'food'],
  ['🥭', 'mango',                          'food'],
  ['🍍', 'pineapple',                      'food'],
  ['🥥', 'coconut',                        'food'],
  ['🥝', 'kiwi',                           'food'],
  ['🍅', 'tomato',                         'food'],
  ['🥑', 'avocado',                        'food'],
  ['🍆', 'eggplant aubergine',             'food'],
  ['🥕', 'carrot',                         'food'],
  ['🌽', 'corn',                           'food'],
  ['🥦', 'broccoli',                       'food'],
  ['🥬', 'leafy green',                    'food'],
  ['🧄', 'garlic',                         'food'],
  ['🥜', 'peanut nut',                     'food'],
  ['🍞', 'bread loaf',                     'food'],
  ['🥐', 'croissant',                      'food'],
  ['🧀', 'cheese',                         'food'],
  ['🍳', 'egg fry cooking',                'food'],
  ['🥚', 'egg',                            'food'],
  ['🥞', 'pancake',                        'food'],
  ['🧇', 'waffle',                         'food'],
  ['🥓', 'bacon',                          'food'],
  ['🥩', 'meat steak',                     'food'],
  ['🍗', 'chicken leg',                    'food'],
  ['🌭', 'hotdog',                         'food'],
  ['🍔', 'burger hamburger',               'food'],
  ['🍟', 'fries french',                   'food'],
  ['🍕', 'pizza',                          'food'],
  ['🌮', 'taco',                           'food'],
  ['🌯', 'burrito wrap',                   'food'],
  ['🍜', 'noodles ramen',                  'food'],
  ['🍝', 'spaghetti pasta',                'food'],
  ['🍣', 'sushi',                          'food'],
  ['🍱', 'bento box',                      'food'],
  ['🍦', 'ice cream soft serve',           'food'],
  ['🍩', 'donut',                          'food'],
  ['🍪', 'cookie',                         'food'],
  ['🎂', 'birthday cake',                  'food'],
  ['🍰', 'cake slice',                     'food'],
  ['🧁', 'cupcake',                        'food'],
  ['🍫', 'chocolate',                      'food'],
  ['🍬', 'candy',                          'food'],
  ['🍭', 'lollipop',                       'food'],
  ['☕', 'coffee hot',                     'food'],
  ['🍵', 'tea hot',                        'food'],
  ['🧋', 'bubble tea boba',                'food'],
  ['🥤', 'cup straw drink',                'food'],
  ['🍷', 'wine red',                       'food'],
  ['🍸', 'cocktail martini',               'food'],
  ['🍺', 'beer mug',                       'food'],
  ['🍻', 'clinking beer mugs',             'food'],
  ['🥂', 'champagne toast celebrate',      'food'],
  ['🧃', 'juice box',                      'food'],
  ['🧊', 'ice cube',                       'food'],

  // Travel & Places
  ['🚀', 'rocket space',                   'travel'],
  ['🛸', 'ufo flying saucer',              'travel'],
  ['✈️', 'airplane plane fly',             'travel'],
  ['🚁', 'helicopter',                     'travel'],
  ['🚂', 'train locomotive',               'travel'],
  ['🚄', 'bullet train fast',              'travel'],
  ['🚇', 'subway metro',                   'travel'],
  ['🚌', 'bus',                            'travel'],
  ['🚑', 'ambulance',                      'travel'],
  ['🚒', 'fire truck',                     'travel'],
  ['🚓', 'police car',                     'travel'],
  ['🚕', 'taxi cab',                       'travel'],
  ['🚗', 'car automobile red',             'travel'],
  ['🚙', 'suv car',                        'travel'],
  ['🚚', 'truck delivery',                 'travel'],
  ['🚜', 'tractor farm',                   'travel'],
  ['🏎️', 'racing car fast',                'travel'],
  ['🏍️', 'motorcycle',                     'travel'],
  ['🚲', 'bicycle bike',                   'travel'],
  ['🛴', 'scooter kick',                   'travel'],
  ['⛵', 'sailboat boat',                  'travel'],
  ['🚢', 'ship cruise',                    'travel'],
  ['🏠', 'house home',                     'travel'],
  ['🏢', 'office building',                'travel'],
  ['🏥', 'hospital',                       'travel'],
  ['🏦', 'bank',                           'travel'],
  ['🏪', 'store shop convenience',         'travel'],
  ['🏫', 'school',                         'travel'],
  ['🏰', 'castle european',                'travel'],
  ['🏯', 'japanese castle',                'travel'],
  ['🗼', 'tokyo tower',                    'travel'],
  ['🗽', 'statue liberty new york',        'travel'],
  ['⛪', 'church',                         'travel'],
  ['🕌', 'mosque',                         'travel'],
  ['⛩️', 'shinto shrine',                  'travel'],
  ['⛲', 'fountain',                       'travel'],
  ['⛺', 'tent camping',                   'travel'],
  ['🌁', 'fog foggy bridge',               'travel'],
  ['🌃', 'night city stars',               'travel'],
  ['🏙️', 'cityscape city buildings',       'travel'],
  ['🌅', 'sunrise morning',                'travel'],
  ['🌈', 'rainbow colorful',               'travel'],
  ['⛰️', 'mountain',                       'travel'],
  ['🏔️', 'snow mountain',                  'travel'],
  ['🗻', 'mount fuji',                     'travel'],
  ['🏕️', 'camping tent',                   'travel'],
  ['🗺️', 'world map',                      'travel'],
  ['🧭', 'compass navigation',             'travel'],
  ['🌍', 'earth europe africa globe',      'travel'],
  ['🌎', 'earth americas globe',           'travel'],
  ['🌏', 'earth asia globe',               'travel'],
  ['🌐', 'globe internet web',             'travel'],

  // Objects
  ['💎', 'diamond gem jewel',              'objects'],
  ['💍', 'ring engagement',                'objects'],
  ['👑', 'crown royal king queen',         'objects'],
  ['🎩', 'top hat magic',                  'objects'],
  ['💼', 'briefcase work business',        'objects'],
  ['👜', 'handbag purse',                  'objects'],
  ['🎒', 'backpack bag school',            'objects'],
  ['👓', 'glasses eyewear',                'objects'],
  ['🕶️', 'sunglasses cool',                'objects'],
  ['💡', 'light bulb idea',                'objects'],
  ['🔦', 'flashlight torch',               'objects'],
  ['🕯️', 'candle light',                   'objects'],
  ['🔋', 'battery charge',                 'objects'],
  ['💻', 'laptop computer',                'objects'],
  ['🖥️', 'desktop monitor computer',       'objects'],
  ['📱', 'phone mobile cell',              'objects'],
  ['⌨️', 'keyboard type',                  'objects'],
  ['🖱️', 'mouse computer click',           'objects'],
  ['📺', 'television tv',                  'objects'],
  ['📷', 'camera photo',                   'objects'],
  ['📹', 'video camera',                   'objects'],
  ['🎥', 'movie camera film',              'objects'],
  ['☎️', 'telephone phone',                'objects'],
  ['⏰', 'alarm clock wake',               'objects'],
  ['⌚', 'watch time',                     'objects'],
  ['🔑', 'key',                            'objects'],
  ['🗝️', 'old key',                        'objects'],
  ['🔒', 'lock closed',                    'objects'],
  ['🔓', 'unlock open',                    'objects'],
  ['🔨', 'hammer tool',                    'objects'],
  ['🔧', 'wrench tool',                    'objects'],
  ['🔩', 'bolt nut',                       'objects'],
  ['⚙️', 'gear setting',                   'objects'],
  ['🧲', 'magnet attract',                 'objects'],
  ['📚', 'books stack library',            'objects'],
  ['📖', 'book open read',                 'objects'],
  ['📝', 'memo write note',                'objects'],
  ['✏️', 'pencil write edit',              'objects'],
  ['📌', 'pushpin tack',                   'objects'],
  ['📎', 'paperclip attach',               'objects'],
  ['📊', 'bar chart graph',                'objects'],
  ['📈', 'chart up growth trend',          'objects'],
  ['📉', 'chart down loss decline',        'objects'],
  ['📅', 'calendar date',                  'objects'],
  ['📦', 'package box',                    'objects'],
  ['📫', 'mailbox closed',                 'objects'],
  ['📧', 'email envelope',                 'objects'],
  ['🎁', 'gift present',                   'objects'],
  ['🎀', 'ribbon bow',                     'objects'],
  ['🎉', 'party celebrate confetti',       'objects'],
  ['🎊', 'confetti celebrate',             'objects'],
  ['🔮', 'crystal ball magic fortune',     'objects'],
  ['🪄', 'magic wand',                     'objects'],
  ['🎯', 'target bullseye dart',           'objects'],
  ['🎲', 'dice game board',                'objects'],
  ['🎮', 'video game controller',          'objects'],
  ['🎭', 'theater masks drama',            'objects'],
  ['🎨', 'art palette paint',              'objects'],
  ['🎬', 'clapper film movie',             'objects'],
  ['🎤', 'microphone sing karaoke',        'objects'],
  ['🎧', 'headphones music listen',        'objects'],
  ['🎵', 'music note',                     'objects'],
  ['🎶', 'music notes',                    'objects'],
  ['🎸', 'guitar electric',                'objects'],
  ['🎹', 'piano keyboard music',           'objects'],
  ['🥁', 'drum percussion',                'objects'],
  ['🎷', 'saxophone jazz',                 'objects'],
  ['🎺', 'trumpet',                        'objects'],
  ['🎻', 'violin',                         'objects'],
  ['⚽', 'soccer ball football',           'objects'],
  ['🏀', 'basketball',                     'objects'],
  ['🏈', 'american football',              'objects'],
  ['⚾', 'baseball',                       'objects'],
  ['🎾', 'tennis',                         'objects'],
  ['🏐', 'volleyball',                     'objects'],
  ['🏆', 'trophy winner award',            'objects'],
  ['🥇', 'gold medal first',               'objects'],
  ['🏅', 'sports medal',                   'objects'],

  // Symbols
  ['✅', 'check green done success',       'symbols'],
  ['❌', 'cross x no cancel',             'symbols'],
  ['⭕', 'circle red',                    'symbols'],
  ['⛔', 'no entry stop',                 'symbols'],
  ['🚫', 'prohibited no banned',          'symbols'],
  ['⚠️', 'warning caution danger',        'symbols'],
  ['❗', 'exclamation red important',      'symbols'],
  ['❓', 'question mark',                 'symbols'],
  ['‼️', 'double exclamation',             'symbols'],
  ['💯', '100 hundred percent perfect',   'symbols'],
  ['🔴', 'red circle dot',                'symbols'],
  ['🟠', 'orange circle',                 'symbols'],
  ['🟡', 'yellow circle',                 'symbols'],
  ['🟢', 'green circle',                  'symbols'],
  ['🔵', 'blue circle',                   'symbols'],
  ['🟣', 'purple circle',                 'symbols'],
  ['⚫', 'black circle',                  'symbols'],
  ['⚪', 'white circle',                  'symbols'],
  ['🟤', 'brown circle',                  'symbols'],
  ['🔺', 'red triangle up',               'symbols'],
  ['🔻', 'red triangle down',             'symbols'],
  ['🔷', 'blue diamond large',            'symbols'],
  ['🔶', 'orange diamond large',          'symbols'],
  ['🔹', 'blue diamond small',            'symbols'],
  ['🔸', 'orange diamond small',          'symbols'],
  ['⭐', 'star yellow',                   'symbols'],
  ['🌟', 'glowing star shine',            'symbols'],
  ['✨', 'sparkles shine',                'symbols'],
  ['💫', 'dizzy star spin',               'symbols'],
  ['⚡', 'lightning bolt energy power',   'symbols'],
  ['🔥', 'fire hot flame',                'symbols'],
  ['💥', 'explosion boom',                'symbols'],
  ['❄️', 'snowflake cold ice winter',     'symbols'],
  ['🌊', 'wave water ocean sea',          'symbols'],
  ['💨', 'wind blow dash',                'symbols'],
  ['🌀', 'cyclone tornado spiral',        'symbols'],
  ['♻️', 'recycle loop green',            'symbols'],
  ['✔️', 'check tick done',               'symbols'],
  ['➕', 'plus add',                      'symbols'],
  ['➖', 'minus subtract',                'symbols'],
  ['➗', 'divide division',               'symbols'],
  ['✖️', 'multiply times cross',          'symbols'],
  ['▶️', 'play button right',             'symbols'],
  ['⏸️', 'pause',                         'symbols'],
  ['⏹️', 'stop square',                   'symbols'],
  ['⏩', 'fast forward',                  'symbols'],
  ['⏪', 'rewind fast backward',          'symbols'],
  ['🔔', 'bell notification',             'symbols'],
  ['🔕', 'bell slash mute',               'symbols'],
  ['🔊', 'speaker volume high',           'symbols'],
  ['🔇', 'mute silent no sound',          'symbols'],
  ['📢', 'loudspeaker announcement',      'symbols'],
  ['📣', 'megaphone cheer',               'symbols'],
  ['🏳️', 'white flag',                    'symbols'],
  ['🏴', 'black flag',                    'symbols'],
  ['🚩', 'red flag',                      'symbols'],
  ['🏁', 'checkered flag finish race',    'symbols'],
  ['🆕', 'new badge',                     'symbols'],
  ['🆓', 'free badge',                    'symbols'],
  ['🆒', 'cool badge',                    'symbols'],
  ['🔝', 'top arrow',                     'symbols'],
  ['🔙', 'back arrow',                    'symbols'],
  ['ℹ️', 'information info',              'symbols'],
  ['📍', 'pin location map',              'symbols'],
  ['🔗', 'link chain',                    'symbols'],
  ['©️',  'copyright',                    'symbols'],
  ['®️',  'registered trademark',         'symbols'],
  ['™️',  'trademark',                    'symbols'],
  ['#️⃣', 'hash number',                  'symbols'],
  ['0️⃣', 'zero number',                  'symbols'],
  ['1️⃣', 'one number',                   'symbols'],
  ['2️⃣', 'two number',                   'symbols'],
  ['3️⃣', 'three number',                 'symbols'],
  ['4️⃣', 'four number',                  'symbols'],
  ['5️⃣', 'five number',                  'symbols'],
];

// ---------------------------------------------------------------------------
// Dialog class
// ---------------------------------------------------------------------------

export class EmojiDialog {
  /**
   * @param {import('../Context.js').Context} context
   */
  constructor(context) {
    this.context = context;
    /** @type {HTMLElement|null} */
    this._dialog = null;
    this._disposers = [];
    this._savedRange = null;
    this._activeCat = 'all';
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  initialize() {
    this._dialog = this._buildDialog();
    document.body.appendChild(this._dialog);
    return this;
  }

  destroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    if (this._dialog && this._dialog.parentNode) {
      this._dialog.parentNode.removeChild(this._dialog);
    }
    this._dialog = null;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  show() {
    withSavedRange((range) => {
      this._savedRange = range;
    });
    this._activeCat = 'all';
    this._searchInput.value = '';
    this._updateCatTabs();
    this._filterEmojis('', 'all');
    this._open();
  }

  // ---------------------------------------------------------------------------
  // Build dialog
  // ---------------------------------------------------------------------------

  _buildDialog() {
    const overlay = createElement('div', {
      class: 'asn-dialog-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Insert emoji',
    });
    const box = createElement('div', { class: 'asn-dialog-box asn-emoji-box' });

    // Title row
    const titleRow = createElement('div', { class: 'asn-icon-title-row' });
    const title = createElement('h3', { class: 'asn-dialog-title' });
    title.textContent = 'Insert Emoji';
    const closeBtn = createElement('button', { type: 'button', class: 'asn-icon-close', 'aria-label': 'Close' });
    closeBtn.innerHTML = '&times;';
    titleRow.append(title, closeBtn);

    // Search
    const searchInput = createElement('input', {
      type: 'search',
      class: 'asn-input asn-icon-search',
      placeholder: 'Search emojis…',
      autocomplete: 'off',
    });
    this._searchInput = searchInput;

    // Category tabs
    const catBar = createElement('div', { class: 'asn-icon-cats' });
    const allTab = createElement('button', { type: 'button', class: 'asn-icon-cat active', 'data-cat': 'all' });
    allTab.textContent = 'All';
    catBar.appendChild(allTab);
    EMOJI_CATS.forEach(({ id, label }) => {
      const tab = createElement('button', { type: 'button', class: 'asn-icon-cat', 'data-cat': id });
      tab.textContent = label;
      catBar.appendChild(tab);
    });
    this._catBar = catBar;

    // Emoji grid — one button per emoji, click = immediate insert
    const grid = createElement('div', { class: 'asn-emoji-grid' });
    EMOJI_LIST.forEach(([char, keywords, cat]) => {
      const cell = createElement('button', {
        type: 'button',
        class: 'asn-emoji-cell',
        'data-char': char,
        'data-keywords': keywords,
        'data-cat': cat,
        title: keywords.split(' ').slice(0, 2).join(' '),
      });
      cell.textContent = char;
      grid.appendChild(cell);
    });
    this._grid = grid;

    // Cancel only — clicking an emoji inserts immediately
    const btnRow = createElement('div', { class: 'asn-dialog-actions' });
    const cancelBtn = createElement('button', { type: 'button', class: 'asn-btn' });
    cancelBtn.textContent = 'Cancel';
    btnRow.appendChild(cancelBtn);

    box.append(titleRow, searchInput, catBar, grid, btnRow);
    overlay.appendChild(box);

    // Events
    const d1 = on(closeBtn,    'click',  () => this._close());
    const d2 = on(cancelBtn,   'click',  () => this._close());
    const d3 = on(overlay,     'click',  (e) => { if (e.target === overlay) this._close(); });
    const d4 = on(searchInput, 'input',  () => this._filterEmojis(searchInput.value, this._activeCat));
    const d5 = on(catBar,      'click',  (e) => {
      const tab = e.target.closest('[data-cat]');
      if (tab) {
        this._activeCat = tab.dataset.cat;
        this._updateCatTabs();
        this._filterEmojis(this._searchInput.value, this._activeCat);
      }
    });
    const d6 = on(grid, 'click', (e) => {
      const cell = e.target.closest('.asn-emoji-cell');
      if (cell) this._onEmojiClick(cell.dataset.char);
    });
    const onKeydown = (e) => { if (e.key === 'Escape') this._close(); };
    document.addEventListener('keydown', onKeydown);
    const d7 = () => document.removeEventListener('keydown', onKeydown);

    this._disposers.push(d1, d2, d3, d4, d5, d6, d7);
    return overlay;
  }

  // ---------------------------------------------------------------------------
  // Filter
  // ---------------------------------------------------------------------------

  _updateCatTabs() {
    this._catBar.querySelectorAll('.asn-icon-cat').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.cat === this._activeCat);
    });
  }

  _filterEmojis(query, cat) {
    const q = (query || '').trim().toLowerCase();
    let count = 0;
    this._grid.querySelectorAll('.asn-emoji-cell').forEach((cell) => {
      const matchCat   = !cat || cat === 'all' || cell.dataset.cat === cat;
      const matchQuery = !q || cell.dataset.keywords.includes(q) || cell.dataset.char === q;
      const visible = matchCat && matchQuery;
      cell.hidden = !visible;
      if (visible) count++;
    });
    let empty = this._grid.querySelector('.asn-icon-empty');
    if (!empty) {
      empty = createElement('div', { class: 'asn-icon-empty' });
      empty.textContent = 'No emojis found';
      this._grid.appendChild(empty);
    }
    empty.hidden = count > 0;
  }

  // ---------------------------------------------------------------------------
  // Insert
  // ---------------------------------------------------------------------------

  _onEmojiClick(char) {
    const savedRange = this._savedRange;
    const editable   = this.context.layoutInfo.editable;

    // 1. Restore selection while dialog is still mounted (same pattern as ImageDialog)
    if (savedRange) savedRange.select();

    const sel = window.getSelection();
    let range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editable);
      range.collapse(false);
    }

    // 2. Insert emoji as a plain text node — no ZWS or execCommand needed.
    //    Text nodes are natively navigable so the caret lands cleanly after.
    range.deleteContents();
    const textNode = document.createTextNode(char);
    range.insertNode(textNode);

    // 3. Place caret immediately after the emoji character
    range.setStartAfter(textNode);
    range.collapse(true);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // 4. Close and restore editor focus
    this._close();
    editable.focus();
    this.context.invoke('editor.afterCommand');
  }

  // ---------------------------------------------------------------------------
  // Open / Close
  // ---------------------------------------------------------------------------

  _open() {
    if (this._dialog) {
      this._dialog.style.display = 'flex';
      setTimeout(() => this._searchInput && this._searchInput.focus(), 50);
    }
  }

  _close() {
    if (this._dialog) this._dialog.style.display = 'none';
    this._savedRange = null;
  }
}
