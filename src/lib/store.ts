import { get, writable, type Writable } from "svelte/store"

export type Item = {
  TransactionDate: number,
  Amount: number,
  Title: string,
  Groups: string[]
}

export type Grouping = {
  Label: string
  Rules: string[]
  Items: Item[]
  Total: number
}

export const BudgetItems = <Writable<Item[]>>writable(localStorage.getItem('budgetItems') ? JSON.parse(localStorage.getItem('budgetItems') || '[]') : [])

export const Groupings = <Writable<Record<string, Grouping>>>writable(localStorage.getItem('groupings') ? JSON.parse(localStorage.getItem('groupings') || '{}') : {})

export const Dates = <Writable<{ FirstDate: number, LastDate: number }>>writable({})
export const Filter = <Writable<{ FirstDate: number, LastDate: number }>>writable({FirstDate: 0, LastDate: Date.now()})

Groupings.subscribe(groupings => {
  localStorage.setItem('groupings', JSON.stringify(Object.keys(groupings).reduce((acc: Record<string, Grouping>, key) => {
    acc[key] = {
      ...groupings[key],
      Items: [],
      Total: 0
    }
    return acc
  }, {})))
})

BudgetItems.subscribe(items => {
  let { FirstDate, LastDate }: { FirstDate: number, LastDate: number } = { FirstDate: Date.now(), LastDate: 0 }
  localStorage.setItem('budgetItems', JSON.stringify(items.map(item => ({
    ...item,
    Groups: []
  }))))
  // get dates
  items.forEach((item) => {
    if (item.TransactionDate > LastDate) LastDate = item.TransactionDate
    if (item.TransactionDate < FirstDate) FirstDate = item.TransactionDate
  })
  Dates.set({ FirstDate, LastDate })
})

export const ComputeHistory = () => {

  const groups = get(Groupings)
  const items = get(BudgetItems)

  Object.keys(groups).forEach((key: string) => {
    groups[key].Total = 0
    groups[key].Items = []
  })

  const filter = get(Filter)

  items.forEach(item => {
    item.Groups = []
    Object.keys(groups).forEach((key: string) => {
      groups[key].Rules.forEach(expr => {
        if (new RegExp(expr, 'ig').test(item.Title)) {
          if (item.TransactionDate > filter.FirstDate && item.TransactionDate < filter.LastDate) {
            groups[key].Total = groups[key].Total - item.Amount
            groups[key].Items.push(item)
            item.Groups.push(key)
          }
        }
      })
    })
  })

  Groupings.set(groups)
  BudgetItems.set(items)
  console.log('done')
}

Groupings.subscribe((groupings: Record<string, Grouping>) => {
  // ComputeHistory()
}) 