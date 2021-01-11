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

import {createElement, cloneElement, render, useEffect} from 'preact';

/**
 * Only API stub is defined here. See the https://github.com/ampproject/amphtml/pull/28665
 * for the complete implementation.
 */
export class ContextNode {
  /**
   * See #28665.
   * @param {!Node} node
   * @return {!ContextNode}
   */
  static get(node) {}

  /**
   * See #28665.
   * @return {!Node}
   */
  get node() {}

  /**
   * See #28665.
   */
  discover() {}

  /** */
  constructor() {
    // See #28665 for hierarchy state.
    this.children_ = [];

    /** @private {?DocumentFragment} */
    this.detachedDom_ = null;

    /** @private {!Array<!PreactDef.VNode>} */
    this.subcomponents_ = [];

    /** @private {?Function} */
    this.onChanged_ = null;
  }

  /**
   * This Node is a new root: typically a document node.
   * This callback is called only once per root.
   */
  onNewRoot() {
    // This Node is a new root. Render it into a detached inert DOM instance.
    // The detachedDom_ will contain the complete document app.
    // This only happens once per each root.
    this.detachedDom_ = document.createElement('template').content;
    render(<ContextNodeComponent contextNode={this} />, this.detachedDom_);
  }

  /**
   * @param {!Function} component
   * @param {!JsonObject} props
   */
  set(component, props = {}) {
    // TODO: find and update the previous value if exists.
    this.subcomponents_.push(createElement(component, props));
    if (this.onChanged_) {
      this.onChanged_();
    }
  }

  /**
   * @param {!Function} component
   */
  remove(component) {
    // TODO: find and remove the component.
    if (this.onChanged_) {
      this.onChanged_();
    }
  }
}

function ContextNodeComponent({contextNode}) {
  const rerender = useRerender();

  // Mount/unmount: follow the private changes to the ContextNode.
  useEffect(() => {
    contextNode.onChanged_ = rerender;
    return () => {
      contextNode.onChanged_ = null;
    };
  }, []);

  // The last component corrsponding to the context node itself. It outputs
  // the direct children as well.
  const component = (
    <c>
      {contextNode.children_.map((child) => (
        <ContextNodeComponent contextNode={child} />
      ))}
    </c>
  );

  // The component is nested inside all of the provided sub-components.
  let nested = component;
  for (let i = this.subcomponents_.length - 1; i >= 0; i--) {
    const subcomponent = this.subcomponents_[i];
    // Only necessary to replace the children.
    nested = (cloneElement(subcomponent, {}, nested));
  }
  return nested;
}
