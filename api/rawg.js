export default async function handler(req, res) {
  const key = process.env.RAWG_KEY
  if (!key) return res.status(500).json({ error: 'RAWG_KEY missing' })
  const { q, id } = req.query
  const url = id
    ? `https://api.rawg.io/api/games/${encodeURIComponent(id)}?key=${key}`
    : `https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(q || '')}&page_size=8`
  const r = await fetch(url)
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  res.status(r.status).json(await r.json())
}
