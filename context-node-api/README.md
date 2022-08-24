# Context Node API

For the background, see [Context Node design doc](https://docs.google.com/document/d/1oRj1X-1zg70y9pgOZjkJHTUOD7hgoiYQO45glYxro8s/edit#heading=h.cfaznbg6sgev).

In Bento a Web Component's implementation is done via React/Preact. However,
it's still necessary to "adopt" this implementation component to the Web
Component's API and environment. In other words, the component must be adopted
to DOM. A Web Component needs to be able to inherit, recompute and broadcast
state of the parent nodes to the children. E.g. one component's behavior may
depend on which component is its parent.

This document considers two alternatives to the Context Node API:
 - Subscriber API: a special API inspired by React, but optimized for operating
   within the DOM.
 - Detached-DOM React API: actually uses React API.


## Common features

Before talking what's different between these two APIs, it'd help to understand
what's similar.


### Context node discovery

Both API rely on the [Context Node Discovery](https://github.com/ampproject/amphtml/pull/28665). This is a special data structrue (`ContextNode`) and mechanism by
which a DOM node can self-discover where it is in the `ContextNode` hierarchy:
i.e. who it's parent and children are, and can notify its subtree of any changes.

This API ensures that no matter which node is intialized earlier or later, and
how DOM tree has been mutated, the `ContextNode` hierarchy can quickly recover
and rebuild itself.

The population of `ContextNode`s is ~2 orders of maginitude smaller than the
full DOM tree and specifics of the API ensure that it's significantly faster
to operate on the `ContextNode` API comparing to DOM API, especially in the
area of broadcast.


### API Principals

Both APIs are designed to:
 1. Solve for AMP's binary structure: `v0.js` + a binary for each extension.
 2. Be as reenterable as possible.
 3. Reduce and make explicit dependencies between different components.


## APIs

* [Subscriber API](./subscriber/).
* [Detached-DOM React API](./detached-dom-react/).
