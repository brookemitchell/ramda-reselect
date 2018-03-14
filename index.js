
const converge = require("ramda/src/converge");
const useWith = require("ramda/src/useWith");
const all = require("ramda/src/all");
const always = require("ramda/src/always");
const any = require("ramda/src/any");
const ap = require("ramda/src/ap");
const call = require("ramda/src/call");
const apply = require("ramda/src/apply");
const memoize = require("ramda/src/memoize");
const of = require("ramda/src/of");
const pipe = require("ramda/src/pipe");
const map = require("ramda/src/map");
const o = require("ramda/src/o");
const init = require("ramda/src/init");
const head = require("ramda/src/head");
const ifElse = require("ramda/src/ifElse");
const complement = require("ramda/src/complement");
const last = require("ramda/src/last");
const isArray = require("ramda-extension/lib/isArray").default;
const isFunction = require("ramda-extension/lib/isFunction").default;

const isInvalid = any(complement(isFunction));
const memoizeLast = o(memoize, last);
const fnsOrArray = ifElse(o(isArray, head), head, init);
const getPreFns = o(map(apply), fnsOrArray);
const alwaysThrowError = always(() => {
  throw new Error("input-selectors bust be functions");
});
const createSelector = converge(
  ifElse(isInvalid, alwaysThrowError, useWith(pipe, [ap, apply])),
  [getPreFns, memoizeLast]
);

module.exports = (...fns) => (state, props) => createSelector(fns)([[state, props]]);
