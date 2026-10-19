/**
 * icon-data.js — Font Awesome 6 Free Solid catalogue for IconDialog.
 *
 * Split into its own chunk and loaded on first dialog open: the table is dead
 * weight for every consumer whose toolbar has no icon button.
 */

export const ICON_CATEGORIES = [
  { id: 'popular', label: 'Popular' },
  { id: 'interface', label: 'Interface' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'media', label: 'Media' },
  { id: 'communication', label: 'Communication' },
  { id: 'files', label: 'Files' },
  { id: 'people', label: 'People' },
  { id: 'objects', label: 'Objects' },
];

// Slugs per category, whitespace-separated (see emoji-data.js for why text).
const RAW = {
  popular: `
    house star heart check xmark plus minus magnifying-glass gear bell user
    envelope phone calendar clock lock eye eye-slash trash pen bookmark flag
    thumbs-up thumbs-down circle-info triangle-exclamation circle-check
    circle-xmark share download upload tag`,
  interface: `
    bars ellipsis ellipsis-vertical list table-cells table-list grip filter
    sort arrows-rotate rotate rotate-left rotate-right copy floppy-disk print
    link code expand compress cloud lock-open key shield shield-halved sliders
    toggle-on square-check circle-plus circle-minus`,
  navigation: `
    arrow-right arrow-left arrow-up arrow-down chevron-right chevron-left
    chevron-up chevron-down angle-right angle-left angle-up angle-down
    angles-right angles-left location-dot compass map map-pin route
    circle-arrow-right circle-arrow-left arrow-trend-up arrow-trend-down
    right-from-bracket right-to-bracket`,
  media: `
    play pause stop forward backward forward-step backward-step volume-high
    volume-low volume-xmark volume-off music headphones microphone
    microphone-slash film camera camera-rotate video image images photo-film
    podcast radio`,
  communication: `
    comment comments comment-dots message paper-plane reply reply-all at
    hashtag wifi signal rss share-nodes inbox phone-volume mobile mobile-screen
    laptop desktop tower-broadcast`,
  files: `
    file file-lines folder folder-open folder-plus folder-minus file-image
    file-pdf file-code file-zipper file-audio file-video file-arrow-up
    file-arrow-down database box box-open hard-drive server`,
  people: `
    user users user-group user-plus user-minus user-check user-xmark user-tie
    user-shield user-secret person person-running person-walking child
    handshake hand hands-holding people-group`,
  objects: `
    pencil paintbrush eraser scissors wrench screwdriver hammer toolbox
    graduation-cap book book-open glasses microscope flask stethoscope hospital
    building city car truck plane train bicycle bus rocket briefcase
    cart-shopping bag-shopping credit-card money-bill chart-bar chart-line
    chart-pie bolt sun moon snowflake fire droplet leaf tree earth-americas
    globe award trophy gift puzzle-piece`,
};

/** @type {Array<[string, string]>} [slug, category] */
export const ICON_LIST = Object.entries(RAW).flatMap(([cat, text]) => text.trim().split(/\s+/).map((slug) => [slug, cat]));
