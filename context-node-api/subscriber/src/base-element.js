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
import {AmpContext, useAmpContext} from './amp-context';
import {LoadedStateProp, RenderableProp, PlayableProp} from './standard-props';

/**
 */
export class PreactBaseElement extends AMP.BaseElement {

  /** @override */
  buildCallback() {
    const {useContexts} = Ctor;

    /** @private @const {!Map>} */
    this.contexts_ = new Map();

    const consumeContext = (value, prop) => {
      this.contexts_.set(prop.type, value);
      this.scheduleRender_();
    };

    const contextNode = ContextNode.get(this.element);
    // Expects to be loaded.
    contextNode.set(LoadedStateProp, false);

    // Map `renderable` and `playable` into a single AmpContext.
    contextNode.subscribeAll(
      [RenderableProp, PlayableProp],
      (renderable, playable) => {
        this.contexts_.set(AmpContext, {renderable, playable});
      });

    // Map a custom set of contexts.
    useContexts.forEach((contextProp) => {
      contextNode.subscribe(
        contextProp,
        (value) => consumeContext(value, contextProp)
      );
    });
  }

  rerender_() {
    const {Component} = Ctor;

    // See current PreactBaseElement.
    // ...
    const props = {};

    render(
      <WithContexts contexts={this.contexts_}>
        <Component {...props} />
      </WithContexts>
      this.container,
    );
  }
}

/**
 * Nests all context providers.
 */
function WithContexts({contexts, children}) {
  let tail = children;
  contexts.forEach((value, key) => {
    const Context = key;
    tail = Preact.createElement(Context.Provider, {value}, tail);
  });
  return tail;
}
