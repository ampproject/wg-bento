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

import {ContextNode} from './context-node';
import {LoadedStateProp} from './standard-props';

export class LoadingIndicatorService {

  constructor(ampdoc) {
    this.ampdoc = ampdoc;

    // TBD: really don't like the externalized state. Maybe we can add
    // `ContextNode.useState()`, but that's also extra API.
    this.tracked_ = new Map();

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
    contextNode.subscribe(
      LoadedStateProp,
      (loadedState) => {
        if (loadedState === false) {
          const element = contextNode.element;
          this.tracked_.set(contextNode, new LoadingIndicator(contextNode));
          this.io_.observe(element);
          return () => {
            // Cleanup.
            if (this.tracked_.get(contextNode)) {
              this.tracked_.get(contextNode).destroy();
            }
            this.tracked_.remove(contextNode);
            this.io_.unobserve(element);
          };
        }
      }
    );
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} records
   * @private
   */
  handleIntersections_(records) {
    records.forEach(({target, isIntersecting}) => {
      const contextNode = ContextNode.get(target);
      const li = this.tracked_.get(contextNode);
      if (li) {
        li.toggle(isIntersecting);
      }
    });
  }
}

class LoadingIndicator {

  constructor(contextNode) {
    this.indicator_ = document.createElement('div');
    this.indicator_.classList.add('i-amphtml-loading-indicator');
    this.indicator_.classList.add('i-amphtml-hidden');
    contextNode.element.appendChild(this.indicator_);
  }

  toggle(on) {
    this.indicator_.classList.toggle('i-amphtml-hidden', !on);
  }

  destroy() {
    this.indicator_.remove();
  }
}
