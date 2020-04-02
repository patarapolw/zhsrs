import fs from 'fs'

import yaml from 'js-yaml'
import sqlite from 'sqlite'

async function main () {
  const db = await sqlite.open('assets/zh.db')
  const ambi: Record<string, Record<string, any>> = yaml.safeLoad(fs.readFileSync('extra/hsk-ambiguous.yaml', 'utf8'))
  const existing = Object.entries(ambi).reduce((prev, [_, d]) => ({ ...prev, ...d }), {} as any)

  const r0 = await db.all(/*sql*/`
    SELECT simplified, traditional, pinyin, english
    FROM vocab
  `)

  const allVocabs = Object.entries<any[]>(r0.reduce((prev, r) => {
    const { simplified, traditional, pinyin, english } = r
    prev[simplified] = prev[simplified] || []
    prev[simplified].push({ traditional, pinyin, english })
    return prev
  }, {} as any))
    .filter(([k, vs]) => vs.length > 1 && !Object.keys(existing).includes(k))
    .reduce((prev, [k, r]) => ({
      ...prev,
      [k]: {
        traditional: joinIfNotDistinct(r.map((el) => el.traditional)),
        pinyin: joinIfNotDistinct(r.map((el) => el.pinyin.toLocaleLowerCase())),
        english: joinIfNotDistinct(r.map((el) => el.english))
      }
    }), {} as any)

  fs.writeFileSync('assets/normalize.yaml', yaml.safeDump({ ...existing, ...allVocabs }, {
    skipInvalid: true
  }))

  await db.close()
}

function joinIfNotDistinct<T> (arr: T[]) {
  const r = arr.filter((a) => a).filter((a, i, r0) => r0.indexOf(a) === i)

  if (r.length <= 1) {
    return r[0]
  }

  return r
}

main()
