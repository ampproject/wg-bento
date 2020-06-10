# Detached-DOM React API

See [the problem definition](../).

The Detached-DOM React API also relies on the [Context Node Discovery](https://github.com/ampproject/amphtml/pull/28665). Unlike the Subscriber API,
however, it uses React API to propagate the state in the DOM tree.

The Detached-DOM React API layers a complete React component tree on top the DOM
document. Let's call it "document app". Since we can't allow overwrite of the
live DOM tree, the document app is rendered on a detached DOM root.

All the implementation React/Preact components are just components in the tree
of the single document app. However, they are portaled into the actual DOM
using the `createPortal` API.


## Analysis

1. The expanded usage of React/Preact APIs is very attractive.
2. While the actual React APIs are used, their usage is somewhat special. It's
   unlikely that such as special-need component can be used outside. For instance,
   each such component receives a predefined signature that includes `contextNode`
   prop.

