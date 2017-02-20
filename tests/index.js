const test = require('tape')
const createSelector  = require('../index.js')

test('example test', t => {
  t.plan(3)
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

  const totalSelector = createSelector(
    subtotalSelector,
    taxSelector,
    (subtotal, tax) => ({ total: subtotal + tax })
  )

  const exampleState = {
    shop: {
      taxPercent: 8,
      items: [
        { name: 'apple', value: 1.20 },
        { name: 'orange', value: 0.95 },
      ]
    }
  }
  t.equal(subtotalSelector(exampleState), 2.15)
  t.equal(taxSelector(exampleState), 0.172)
  t.deepEqual(totalSelector(exampleState), { total: 2.322 })
})

test('basic selector', t => {
    t.plan(2)
    const selector = createSelector(
        state => state.a,
        a => a
    )
    t.equal(selector({ a: 1 }), 1)
    t.equal(selector({ a: 2 }), 2)
})

test('basic selector multiple keys', t => {
    t.plan(2)
    const selector = createSelector(
        state => state.a,
        state => state.b,
        (a, b) => a + b
    )
    const state1 = { a: 1, b: 2 }
    t.equal(selector(state1), 3)
    const state2 = { a: 3, b: 2 }
    t.equal(selector(state2), 5)
})

test('basic selector invalid input selector', t => {
    t.plan(1)

    const state1 = { a: 1, b: 2 }
    const selector = createSelector(
        state => state.a,
        'not a function',
        (a, b) => a + b
    )

    t.throws(() => selector(state1), 'input-selectors to be functions')

})

test('first argument can be an array', t => {
  t.plan(3)
  const selector = createSelector(
    [ state => state.a, state => state.b ],
    (a, b) => {
      return a + b
    }
  )
  t.equal(selector({ a: 1, b: 2 }), 3)
  t.equal(selector({ a: 1, b: 2 }), 3)
  t.equal(selector({ a: 3, b: 2 }), 5)
})

test('can accept props', t => {
  t.plan(1)
  const selector = createSelector(
    state => state.a,
    state => state.b,
    (state, props) => console.log(state, props) || props.c,
    (a, b, c) => {
      return a + b + c
    }
  )
  t.equal(selector({ a: 1, b: 2 }, { c: 100 }), 103)
})

test('correctly works out state/props combined', t => {
  t.plan(1)
  const selector = createSelector(
    state => state.a,
    (state, props) => state.b[props.getKey],
    (a, b, c) => {
      return a + b
    }
  )
  t.equal(selector({ a: 1, b: {a: 9, b: 22} }, {getKey:  'b'}), 23)
})


  test('recomputes result after exception', t => {
    t.plan(3)
    let called = 0
    const selector = createSelector(
      state => state.a,
      () => {
        called++
        throw Error('test error')
      }
    )
    t.throws(() => selector({ a: 1 }), 'test error')
    t.throws(() => selector({ a: 1 }), 'test error')
    t.equal(called, 2)
  })

// should I implement this?
test.skip('memoizes previous result before exception', t => {
  t.plan(4)
  let called = 0
  const selector = createSelector(
    state => state.a,
    a => {
      called++
      if (a > 1) throw Error('test error')
      return a
    }
  )
  const state1 = { a: 1 }
  const state2 = { a: 2 }
  t.equal(selector(state1), 1)
  t.throws(() => selector(state2), 'test error')
  t.equal(selector(state1), 1)
  t.equal(called, 2)
})

  test('chained selector', t => {
    t.plan(3)
    const selector1 = createSelector(
      state => state.sub,
      sub => sub
    )
    const selector2 = createSelector(
      selector1,
      sub => sub.value
    )
    const state1 = { sub: {  value: 1 } }
    t.equal(selector2(state1), 1)
    t.equal(selector2(state1), 1)
    const state2 = { sub: {  value: 2 } }
    t.equal(selector2(state2), 2)
  })

  test('chained selector with props', t => {
    t.plan(3)
    const selector1 = createSelector(
      state => state.sub,
      (state, props) => props.x,
      (sub, x) => ({ sub, x })
    )
    const selector2 = createSelector(
      selector1,
      (state, props) => props.y,
      (param, y) => param.sub.value + param.x + y
    )
    const state1 = { sub: {  value: 1 } }
    t.equal(selector2(state1, { x: 100, y: 200 }), 301)
    t.equal(selector2(state1, { x: 100, y: 200 }), 301)
    const state2 = { sub: {  value: 2 } }
    t.equal(selector2(state2, { x: 100, y: 201 }), 303)
  })

  // should we accept variadic args? 
  // or error
  test.skip('chained selector with variadic args', t => {
    t.plan(3)
    const selector1 = createSelector(
      state => state.sub,
      (state, props, another) => props.x + another,
      (sub, x) => ({ sub, x })
    )
    const selector2 = createSelector(
      selector1,
      (state, props) => props.y,
      (param, y) => param.sub.value + param.x + y
    )
    const state1 = { sub: {  value: 1 } }
    t.equal(selector2(state1, { x: 100, y: 200 }, 100), 401)
    t.equal(selector2(state1, { x: 100, y: 200 }, 100), 401)
    const state2 = { sub: {  value: 2 } }
    t.equal(selector2(state2, { x: 100, y: 201 }, 200), 503)
  })
