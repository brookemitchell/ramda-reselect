const R = require('ramda')

module.exports = (...fns) => {
    const preFns = fns.slice(0, -1)
    const lastFn = R.memoize(fns[fns.length - 1])
    return R.pipe(
        R.of
        , R.ap(preFns)
        , R.apply(lastFn)
    )
}
