# Using React/Preact to implement AMP elements

Discussion: [issues](https://github.com/ampproject/wg-bento/labels/Discussion%3A%20React), [new issue](https://github.com/ampproject/wg-bento/issues/new?labels=Discussion%3A+React).

Prototype: [repo](https://github.com/ampproject/amp-react-prototype), [decision points](https://github.com/ampproject/amp-react-prototype/labels/TBD).

## Concept

The concept of building AMP extensions using React/Preact has been introduced
in the [AMP Contributor Summit 2019 talk](https://www.youtube.com/watch?v=s78VcduTOqE).

With Bento Project, we will need to support the following component modes:
 1. AMP mode: run on an AMP page;
 2. "Bento" mode: run on a regular web page not managed by the AMP framework;
 3. 3P framework mode: allowing a 3P framework to directly use an AMP component.

We are making the AMP document framework more modular and configurable. But we
also need to make components more indepedent, mutable, and distributable.

The AMP elements have the following needs:
 1. We need some internal state about the component (which carousel slide am I on?)
 2. We need external context to tell the component when it needs to perform
    resource-intensive actions.
 3. We need a way to render this in DOM.
 4. We need to react to component mutations and state changes.

Mutability is the key requirement for Bento. Currently, if an AMP element needs
to support an attribute or a child mutation, it has to manually add a listener
or a mutation observer and manually apply changes. Imperative code like this is
difficult to maintain and error-prone. Instead we'd like AMP elements to be
mutable "by design".

To simplify the mutability problem we need the main part of the AMP element's
implementation to be reenterable. What if we just had a "render" method?
 - State changed? Call the render method.
 - Framework says it’s ok to make requests now? Call the render method.
 - Element resized? Call the render method.
 - Element is visible in user’s viewport? Call the render method.

React model fits this picture very well: there's a single "render" method and
rendering side-effects with internal state. This completely isolates the UI and
rendering from the external environment, meaning we can reuse the same code in
each of the 3 modes.

A very simple example could look like this:

```
// A single "render" method.
export function AmpImg(props) {
  // State.
  const loadable = useIsLoadable();

  const attrs = {
    ...props,
    decoding: 'async',
  };

  // Loading control.
  if (!loadable) {
    delete attrs['src'];
    delete attrs['srcSet'];
  }

  // Rendering.
  return (<img {...attrs}>);
}
```

Thus, using React model we get mutability by design - our main goal. However,
in addition, the React components themselves could be usable independently
without the web components part.


## React vs Preact

Such elements would be compatible between React and Preact. But for the AMP
documents framework we can focus on Preact implementation. What we get from
Preact is:
 1. Small footprint; better bundling/DCE.
 2. We write our component logic once:  declarative UI, with the component's
    state, all wrapped up in a render method.
 3. Mutable by design.
 4. "Fully" compatible with React.


## API/Implementation layers

With AMP components implemented in React/Preact, different layers of the AMP
framework would be responsible for different aspects.

AMP Framework will be responsible for:
 - Static layout;
 - Resource scheduling;
 - Actions framework;
 - Viewport/fixed layer;
 - Document scoping;
 - Document embedding;
 - Cross-element and service dependencies;


Bento mode layer will be responsible for:
 - Custom element implementation that wraps a React/Preact component;
 - Component/DOM mapping.
 - Monitoring DOM mutations;
 - Queuing and calling `preact.render()` on mutations.

React/Preact layer will be resposible for:
 - Rendering/re-rendering;
 - Cross-component context;
 - Load/play/pause lifecycle;
 - Exported state/APIs.


## Component/element mapping

A web component in DOM could look like this:

```
<amp-carousel current-slide=1 >
  <button arrow-next>&rarr;</button>
  <div>slide 1</div>
  <div>slide 2</div>
</amp-carousel>
```

Here, the DOM structure is used to provide "properties" to the underlying
component:
 - Most of child elements are the carousel's slides;
 - The `<button arrow-next>` child element customizes the navigation controls
   of the carousel;
 - The `current-slide` attribute instructs the carousel component to switch
   to the slide 1 by default.

A similar structure would be preserved by the React component, but it will
be noteably different:

```
<AmpCarousel
    currentSlide=1
    arrowNext={(<button>&rarr;</button>)} >
  <div>slide 1</div>
  <div>slide 2</div>
</AmpCarousel>
```

Here, the JSX provides structure to build the carousel component instance:
 - All of the children are provided as slides;
 - The customized navigation button is passed as the `arrowNext` property;
 - The default slide is passed as the `currentSlide` numeric property.

Thus we need to address to competing concerns:
 - A React component has to be responsible for its rendering and event handling.
 - A web component's DOM tree should be authorable by the user script and
   function predictably. E.g. the children elements cannot suddenly disappear,
   event listeners should receive events, etc.

In both cases, we want the web component's or the React component's structure
to be natural in that environment. These requirements mostly preclude us from
using DOM element reparenting or clonning - they either break the initial DOM
structure or lose event listeners. The final implementation DOM structure
produced by the React component would be somewhat involved: the slides will be
placed in a scrollable container and laid out using flexbox. In a generic case,
the implementation DOM structure is arbitrarily complex and can change from
release to release.

So, how would we address these concerns? We can use Shadow DOM. The light subtree
will keep the user-authored web component structure. The shadow subtree will be
used to render the React element. The Shadow DOM slots will be used connect
the light and shadow subtrees.

The web component's DOM for the example above will look mostly the same with an
exception of `slot` attributes:

```
<amp-carousel current-slide=1 >
  <button arrow-next slot="arrow-next">&rarr;</button>
  <div slot="slide-0">slide 1</div>
  <div slot="slide-1">slide 2</div>
</amp-carousel>
```

This AMP element will instrument the React component as following:

```
<AmpCarousel
    currentSlide=1
    arrowNext={(
      <slot name="arrow-next"/>
    )} >
  <slot name="slide-0"/>
  <slot name="slide-1"/>
</AmpCarousel>
```

For reference, a hypothetical rendered DOM structure could look like this:

```
<amp-carousel current-slide=1 >
  <button arrow-next slot="arrow-next">&rarr;</button>
  <div slot="slide-0">slide 1</div>
  <div slot="slide-1">slide 2</div>

  #shadow-dom
    <div container>
      <slot name="arrow-next"></slot>
      <div scroller>
        <div slide>
          <slot name="slide-0"></slot>
        </div>
        <div slide>
          <slot name="slide-1"></slot>
        </div>
      </div>
    </div>
</amp-carousel>
```

This approach isolates the web component subtree from the React component. Thus:
 1. A user script can update the light subtree. E.g. it could append a new DOM
    element for a new carousel slide.
 2. The mutation observer will receive a mutation event and will rerender the
    React component with the new set of children slots.
 3. The React component rerenders the new DOM structure in a VDOM and diff-merges
    the resulting DOM subtree inside the shadow subtree.
