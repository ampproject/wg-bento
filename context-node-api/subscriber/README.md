# Subscriber API

See [the problem definition](../).

The Subscriber API hosts each React/Preact implementation component in its own
root within the parent Web Component (i.e. AMP element). In other words, the
document contains many Preact mini-apps - one per each AMP element.

The Subscriber API relies on the [Context Node Discovery](https://github.com/ampproject/amphtml/pull/28665) and works as following:
 1. Diffenent AMP modules define context properties. These are represented by
    the `ContextProp` interface and are shared globally-named properties.
 2. The rules of how a `ContextProp` is computed and propagated are defined in
    the `ContextCalc` interface.
 2. The `ContextNode` automatically computes and propagates the properties
    through the hierarchy.

The easiest way to think of this API is as a CSS engine. A `ContextProp`, just
as a CSS property can be declared anywhere in a tree and it's automatically
propagated to the subtree and computed as defined.

The API style itself is subscription-style API to ensure its reenterability.


## Analysis
