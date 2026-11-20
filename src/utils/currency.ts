const full = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
const short = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 })

// "Rp 1.234.567"
export const formatIdr = (rupiah: number) => full.format(rupiah)

// "1,2 jt": short enough for a stat card
export const formatIdrShort = (rupiah: number) => short.format(rupiah)
