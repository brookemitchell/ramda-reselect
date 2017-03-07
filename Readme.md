Ramda - Reselect
================

Implementation of the reselect library using ramda.

## Purpose ##
- Example of how to recreate your own selector abstraction using ramda.
- A small implementation of createSelector for lazy folks like me :cat:.

## How-to ##
You can create the same createSelector function as used by [reselect](https://github.com/reactjs/reselect) with Ramda like so, nice and easy, no library needed :sweat_smile: :
``` javascript
const createSelector = (...fns) => 
  R.pipe(
    R.of
    , R.ap(fns.slice(0, -1))
    , R.apply(R.memoize(fns[fns.length - 1])))
```
Right now that can't handle props, but tbh I never use props in my stateful components. Perhaps you do, so a full version of createSelector that matches reselect's api and passes their tests is provided as an npm package. 

But why not write a 'createSelector' to suit your use case. :dizzy:

## Example ##
``` javascript
import createSelector from 'ramda-reselect'

const shopItemsSelector = state => state.shop.items
const taxPercentSelector = state => state.shop.taxPercent

const subtotalSelector = createSelector(
  shopItemsSelector,
  items => items.reduce((acc, item) => acc + item.value, 0)
)

const taxSelector = createSelector(
  subtotalSelector,
  taxPercentSelector,
  (subtotal, taxPercent) => subtotal * (taxPercent / 100)
)

export const totalSelector = createSelector(
  subtotalSelector,
  taxSelector,
  (subtotal, tax) => ({ total: subtotal + tax })
)

let exampleState = {
  shop: {
    taxPercent: 8,
    items: [
      { name: 'apple', value: 1.20 },
      { name: 'orange', value: 0.95 },
    ]
  }
}

console.log(subtotalSelector(exampleState)) // 2.15
console.log(taxSelector(exampleState))      // 0.172
console.log(totalSelector(exampleState))    // { total: 2.322 }

```
