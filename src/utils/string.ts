export const joinerWithAnd = (array: any[]) => {
  if (array.length === 0) return ""
  if (array.length === 1) return array[0]
  if (array.length === 2) return `${array[0]} and ${array[1]}`

  const allButLast = array.slice(0, -1)
  const last = array[array.length - 1]
  return `${allButLast.join(", ")}, and ${last}`
}
