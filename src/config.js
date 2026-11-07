// Single place to edit business details & content shown on the site.
export const site = {
  name: 'Promise Gold & Diamonds',
  short: 'Promise',
  url: 'https://promisegd.com',
  phone: '+971 56 616 6962',
  phoneRaw: '+971566166962',
  whatsapp: '971566166962',
  address: 'Shop No. 39, Karama Center, Dubai, United Arab Emirates',
  mapQuery: 'Promise Gold and Diamonds, Karama Center, Dubai',
  facebook: 'https://www.facebook.com/p/Promise-Gold-and-Diamonds-61550310024926/',
  instagram: 'https://www.instagram.com/promise.gd/',
  // Optional: put today's 24K rate (AED per gram) here and rebuild, e.g. '' or '480'.
  // Visitors can also type their own rate in the calculator.
  goldRate24K: '',
};

const up = 'https://promisegd.com/wp-content/uploads/2026/04/';
// Local copies live in /public/img (run scripts/fetch-images.sh to download them).
// If a local file is missing the page falls back to the live URL, then to built-in artwork.
export const images = {
  craft: { src: '/img/craft.jpg', remote: up + 'pexels-photo-6263058-6263058-1024x683.jpg' },
  diamond: { src: '/img/diamond.jpg', remote: up + 'pexels-photo-9544361-9544361-1024x1024.jpg' },
  goldsmith: {
    src: '/img/goldsmith.jpg',
    remote:
      up +
      'gd54cc0d1c1880ad9204e81e84cca8d08f537da290ac6db757812d8c7ffec63edf07af8c839b2eb85cc27b81416ab3887_1280-829073-1024x614.jpg',
  },
};

export const services = [
  { t: 'Gold Jewellery', d: 'Chains, bangles, rings and necklaces — traditional and modern, in 22K and 24K.', i: 'chain' },
  { t: 'Diamond Jewellery', d: 'Rings, earrings and pendants set with certified diamonds.', i: 'gem' },
  { t: 'Bridal Collections', d: 'Wedding jewellery sets made for the day you will remember for life.', i: 'heart' },
  { t: 'Custom Designs', d: 'Bring an idea or a sketch — we shape it into a piece that is only yours.', i: 'pen' },
  { t: 'Laser Engraving', d: 'Names, dates and messages etched with precision on gold, pendants and bars.', i: 'laser' },
  { t: 'Customized Rings', d: 'Size, stone, finish and engraving chosen by you, crafted by us.', i: 'ring' },
  { t: 'Gold Reworks', d: 'Give old gold a new life — remodel, resize and refresh treasured pieces.', i: 'rework' },
  { t: 'Devotional Jewellers', d: 'Sacred symbols and devotional pieces crafted with care and respect.', i: 'lotus' },
];

export const values = [
  ['Purity', 'Certified gold and diamonds, with full transparency.'],
  ['Trust', 'Lasting relationships built on honesty and fair pricing.'],
  ['Craftsmanship', 'Attention to fine artistry and every last detail.'],
  ['Elegance', 'Tradition blended with modern sophistication.'],
  ['Commitment', 'Your satisfaction, at every single step.'],
  ['Excellence', 'Premium jewellery with world-class service.'],
];
