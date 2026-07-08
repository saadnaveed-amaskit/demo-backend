/** A catalog SKU used to resolve Focus Sets. Seed data standing in for the real
 * product catalog until a data source is chosen (plan Risk: ORM/DB TBD). */
export interface CatalogSku {
  sku: string
  name: string
  brand: string
  division: string
  department: string
  category: string
  subClass: string
  masterSeason: string
  seasonCode: string
  bigIdea: string
  status: "In_Stock" | "Low_Stock" | "Out_of_stock"
  price: number
  qty: number
  onOrderQty: number
}

/** Attributes exposed to the Focus Builder condition tree (attr key -> label). */
export const FILTERABLE_ATTRIBUTES: { attr: keyof CatalogSku; label: string }[] = [
  { attr: "brand", label: "Brand" },
  { attr: "division", label: "Division" },
  { attr: "department", label: "Department" },
  { attr: "category", label: "Category" },
  { attr: "subClass", label: "Sub Class" },
  { attr: "masterSeason", label: "Master Season" },
  { attr: "seasonCode", label: "Season Code" },
  { attr: "bigIdea", label: "Big Idea" },
  { attr: "status", label: "Status" },
]

export const CATALOG_SKUS: CatalogSku[] = [
  { sku: "TCP-BG-001", name: "Girls Ruffle Tee", brand: "TCP", division: "BIG GIRLS", department: "Tops", category: "Tees", subClass: "Short Sleeve", masterSeason: "Spring", seasonCode: "SP25", bigIdea: "Everyday", status: "In_Stock", price: 12.95, qty: 820, onOrderQty: 200 },
  { sku: "TCP-BG-002", name: "Girls Denim Short", brand: "TCP", division: "BIG GIRLS", department: "Bottoms", category: "Shorts", subClass: "Denim", masterSeason: "Summer", seasonCode: "SU25", bigIdea: "Denim", status: "Low_Stock", price: 19.95, qty: 140, onOrderQty: 0 },
  { sku: "TCP-BOY-010", name: "Boys Graphic Tee", brand: "TCP", division: "BOYS", department: "Tops", category: "Tees", subClass: "Short Sleeve", masterSeason: "Spring", seasonCode: "SP25", bigIdea: "License", status: "In_Stock", price: 11.5, qty: 640, onOrderQty: 150 },
  { sku: "TCP-BOY-011", name: "Boys Cargo Short", brand: "TCP", division: "BOYS", department: "Bottoms", category: "Shorts", subClass: "Woven", masterSeason: "Summer", seasonCode: "SU25", bigIdea: "Everyday", status: "Out_of_stock", price: 21.0, qty: 0, onOrderQty: 300 },
  { sku: "TCP-TG-020", name: "Toddler Girls Dress", brand: "TCP", division: "TODDLER GIRLS", department: "Dresses", category: "Dresses", subClass: "Knit", masterSeason: "Spring", seasonCode: "SP25", bigIdea: "Occasion", status: "In_Stock", price: 16.95, qty: 410, onOrderQty: 100 },
  { sku: "TCP-BB-030", name: "Baby Boys Bodysuit", brand: "TCP", division: "BABY BOYS", department: "Sets", category: "Bodysuits", subClass: "Knit", masterSeason: "Basic", seasonCode: "BASIC", bigIdea: "Everyday", status: "In_Stock", price: 9.95, qty: 1200, onOrderQty: 0 },
  { sku: "GYM-BG-100", name: "Gymboree Floral Legging", brand: "Gymboree", division: "BIG GIRLS", department: "Bottoms", category: "Leggings", subClass: "Knit", masterSeason: "Fall", seasonCode: "FA25", bigIdea: "Everyday", status: "In_Stock", price: 14.5, qty: 300, onOrderQty: 120 },
  { sku: "GYM-BG-101", name: "Gymboree Cardigan", brand: "Gymboree", division: "BIG GIRLS", department: "Tops", category: "Sweaters", subClass: "Cardigan", masterSeason: "Fall", seasonCode: "FA25", bigIdea: "Layering", status: "Low_Stock", price: 24.95, qty: 90, onOrderQty: 60 },
  { sku: "GYM-BOY-110", name: "Gymboree Henley", brand: "Gymboree", division: "BOYS", department: "Tops", category: "Tees", subClass: "Long Sleeve", masterSeason: "Fall", seasonCode: "FA25", bigIdea: "Everyday", status: "In_Stock", price: 15.5, qty: 260, onOrderQty: 0 },
  { sku: "GYM-TG-120", name: "Gymboree Holiday Dress", brand: "Gymboree", division: "TODDLER GIRLS", department: "Dresses", category: "Dresses", subClass: "Woven", masterSeason: "Holiday", seasonCode: "HOL25", bigIdea: "Occasion", status: "In_Stock", price: 29.95, qty: 180, onOrderQty: 40 },
  { sku: "GYM-BB-130", name: "Gymboree Baby Snowsuit", brand: "Gymboree", division: "BABY BOYS", department: "Outerwear", category: "Outerwear", subClass: "Puffer", masterSeason: "Holiday", seasonCode: "HOL25", bigIdea: "Cold Weather", status: "Low_Stock", price: 39.95, qty: 55, onOrderQty: 20 },
  { sku: "GYM-GG-140", name: "Gymboree Girls Skort", brand: "Gymboree", division: "GIRLS", department: "Bottoms", category: "Shorts", subClass: "Knit", masterSeason: "Summer", seasonCode: "SU25", bigIdea: "Active", status: "In_Stock", price: 17.5, qty: 220, onOrderQty: 80 },
]
