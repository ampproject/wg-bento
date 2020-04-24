# Parent search algorithms

Tests for different ways to navigate DOM trees while searching for a parent.

1. Direct navigation using `node.parentNode` chain.
2. Querying DOM using `node.closest()`.
3. Sending and handling events.

We are interested in composed navigation. I.e. the search should go across the
boundaries of shadow roots.

The composed `parentNode` navigation algorithm looks like this:

```
let n = node;
while (n) {
  if (isNodeFound(n)) {
    return n;
  }
  if (n.assignedSlot) {
    n = n.assignedSlot;
  } else if (n.nodeType == /* SHADOW_ROOT */ 11) {
    n = n.host;
  } else {
    n = n.parentNode;
  }
}
return null;

```

See [navigate.js](./navigate.js) for all types of navigations. Note, that
it doesn't look possible to construct the composed search using `closest()`.

For all browsers tested, these are the findings:

1. As mentioned above, `closest()` is not applicable where shadow boundaries are present.
2. Except in Firefox, `parentNode` search was faster than other methods: 10% faster than
 querying, and ~10x faster than event propagation.
3. A rough timing estimate is 6ms per 10K searches.
4. The DOM trees have not been sufficiently randomized in the first round of tests
 to have confidence in these numbers.
