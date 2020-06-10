/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {useState, useLayoutEffect, useEffect} from 'preact';
import {ContextNode} from './context-node';
import {AmpContextProvider, useAmpContext} from './amp-context';
import {useMeasureSize} from './measure-size';

/**
 */
export class PreactBaseElement extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    const {Component} = Ctor;
    ContextNode.get(this.element).set(BaseElementComponent, {Component});
  }
}

/**
 * PreactBaseElement delegates most of its functions to this component.
 * The ContextNode will automatically render this tree.
 */
function BaseElementComponent({contextNode, Component, children}) {
  const element = contextNode.element;
  const Name = element.tagName.toLowerCase();

  const [container, setContainer] = useState(null);
  const rerender = useRerender();

  // Mount effect: initialize shadow root and set the mutation callbacks.
  useLayoutEffect(() => {
    setContainer(
      Component.shadow ?
      element.attachShadow({mode: 'open'}) :
      // TODO: these rules are slightly more complex.
      element);
    const mo = new MutationObserver(rerender);
    mo.observe(comp_problem_node, {attributes: true});
    return () => {
      mo.disconnect();
    };
  }, [Component]);

  // Collect props from DOM, including children.
  // See the current `PreactBaseElement`.
  const props = collectProps();

  return (
    <AmpContextProviderWithDisplayNone contextNode={contextNode}>
      <Name>
        {Component && container ?
          // The actual DOM is portalled from the datached tree.
          createPortal(
            <Component {...props} />
            container
          ) : null
        }
        {/* Render "unclaimed" children as unrenderable. */}
        <AmpContextProvider renderable={false}>
          {children}
        </AmpContextProvider>
      </Name>
    </AmpContextProviderWithDisplayNone>
  );
}

function AmpContextProviderWithDisplayNone({contextNode, children}) {
  // Renderable: ensure that `display:none` elements are automatically
  // set as non-renderable.
  // TBD: this approach is not very clean. The `AmpContextProviderWithDisplayNone`
  // can only be used explicitly and in few places.
  const {renderable} = useAmpContext();
  const [renderableState, setRenderableState] = useState(false);
  const measureSize = useMeasureSize();
  useEffect(() => {
    if (renderable) {
      // Only measure when the element is context's renderable is true. No point
      // in wasting time measuring when we already know the answer.
      measureSize(contextNode.element).then((size) => {
        setRenderableState(size.width > 0 && size.height > 0);
      });
    } else {
      setRenderableState(false);
    }
  }, [renderable]);
  return (
    <AmpContextProvider renderable={renderableState}>
      {children}
    </AmpContextProvider>
  );
}
