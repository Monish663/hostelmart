/* ─── Colour Palette ─────────────────────────────────────── */
export const P = {
  coral:'#E8503A', teal:'#0E9F72', amber:'#D4820A', purple:'#6B5CE7',
  pink:'#D4537E',  blue:'#2563EB', green:'#1E8A48', orange:'#E86D1F',
  bg:'#FFF8F0',    dark:'#1C1C2E', gray:'#6B7280',  lgray:'#F3F4F6',
}

/* ─── Product Categories ─────────────────────────────────── */
export const CAT = {
  'Beverages':   { color:'#2563EB', emoji:'🥤' },
  'Snacks':      { color:'#D4820A', emoji:'🍪' },
  'Dairy':       { color:'#0E9F72', emoji:'🥛' },
  'Fruits':      { color:'#E8503A', emoji:'🍎' },
  'Vegetables':  { color:'#1E8A48', emoji:'🥦' },
  'Bakery':      { color:'#D4537E', emoji:'🍞' },
  'Essentials':  { color:'#6B5CE7', emoji:'🧴' },
  'Instant Food':{ color:'#E86D1F', emoji:'🍜' },
}

/* ─── Owner Credentials (change these!) ──────────────────── */
export const OWNER_ID  = 'admin'
export const OWNER_PWD = 'cseisbest007'

/* ─── Unique ID generator ─────────────────────────────────── */
export const uid = () => '' + Date.now() + Math.random().toString(36).slice(2, 7)

/* ─── Default seed products ───────────────────────────────── */
export const INIT_PRODUCTS = [
  { id:'p1',  name:'Mineral Water',   cat:'Beverages',   price:20,  stock:50, unit:'bottle', emoji:'💧' },
  { id:'p2',  name:'Lays Chips',      cat:'Snacks',      price:20,  stock:30, unit:'pack',   emoji:'🥔' },
  { id:'p3',  name:'Full Cream Milk', cat:'Dairy',       price:25,  stock:20, unit:'500ml',  emoji:'🥛' },
  { id:'p4',  name:'Banana',          cat:'Fruits',      price:30,  stock:15, unit:'dozen',  emoji:'🍌' },
  { id:'p5',  name:'Maggi Noodles',   cat:'Instant Food',price:14,  stock:40, unit:'pack',   emoji:'🍜' },
  { id:'p6',  name:'Brown Bread',     cat:'Bakery',      price:40,  stock:10, unit:'loaf',   emoji:'🍞' },
  { id:'p7',  name:'Bathing Soap',    cat:'Essentials',  price:35,  stock:25, unit:'bar',    emoji:'🧼' },
  { id:'p8',  name:'Tomato',          cat:'Vegetables',  price:20,  stock:5,  unit:'kg',     emoji:'🍅' },
  { id:'p9',  name:'Oreo Biscuits',   cat:'Snacks',      price:30,  stock:20, unit:'pack',   emoji:'🍪' },
  { id:'p10', name:'Tea Powder',      cat:'Beverages',   price:150, stock:8,  unit:'250g',   emoji:'🍵' },
  { id:'p11', name:'Cucumber',        cat:'Vegetables',  price:25,  stock:12, unit:'piece',  emoji:'🥒' },
  { id:'p12', name:'Butter',          cat:'Dairy',       price:55,  stock:15, unit:'100g',   emoji:'🧈' },
  { id:'p13', name:'Shampoo',         cat:'Essentials',  price:120, stock:10, unit:'bottle', emoji:'🧴' },
  { id:'p14', name:'Apple',           cat:'Fruits',      price:80,  stock:8,  unit:'kg',     emoji:'🍎' },
]
