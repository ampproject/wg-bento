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

import {createPortal} from 'preact';

export class LoadingIndicatorService {

  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    this.io_ = new IntersectionObserver(this.handleIntersections_.bind(this));
  }

  disponse() {
    this.io_.disconnect();
  }

  /**
   * TBD: Not sure how to provide this API yet, but let's assume that it exists
   * and ContextNode can notify us when a completely new node has appeared that
   * satisfies some criteria.
   *
   * @param {!ContextNode} contextNode
   */
  onNewContextNode(contextNode) {
    this.io_.observe(contextNode.element);
    // TBD: but when should we stop observing this node? How do we know it's
    // already been loaded?
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} records
   * @private
   */
  handleIntersections_(records) {
    records.forEach(({target, isIntersecting}) => {
      const contextNode = ContextNode.get(target);
      if (isIntersecting) {
        contextNode.set(WithLoadingIndicator, {on: true});
      } else {
        contextNode.set(WithLoadingIndicator, {on: false});
      }
    });
  }
}

/**
 * A component that portals the `LoadingIndicator` inside the web component.
 */
function WithLoadingIndicator({contextNode, on, children}) {
  return (
    <Fragment>
      {children}
      {createPortal(
        <LoadingIndicator on={on} />,
        contextNode.element
      )}
    </Fragment>
  );
}
