import { NextResponse } from 'next/server'
import { categories, articles } from '@/lib/data'

export async function GET() {
  const categoriesWithCount = categories.map((c) => ({
    ...c,
    count: articles.filter((a) => a.category === c.name).length,
  }))

  return NextResponse.json({ categories: categoriesWithCount })
}
