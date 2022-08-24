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

import {ContextProp} from './context-prop';

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

  }

  /**
   * Sets a prop's "input" value.
   * @param {!ContextProp<T>} prop
   * @param {T|undefined} input
   * @template T
   */
  set(prop, input) {}

  /**
   * Sets a prop's calculator.
   * @param {!ContextProp<T>} prop
   * @param {!ContextPropCalc<T>} calc
   * @template T
   */
  provide(prop, calc) {}

  /**
   * Set up a subscriber.
   * @param {!ContextProp<T>} prop
   * @param {function(T):(?UnsubscribeDef|undefined)} handler The handler that
   * can optionally return a cleanup function.
   * @return {!UnsubscribeDef}
   * @template T
   */
  subscribe(prop, handler) {}

  /**
   * Remove the subscriber.
   * @param {!ContextProp<T>} prop
   * @param {function(T):(?UnsubscribeDef|undefined)} handler The handler that
   * can optionally return a cleanup function.
   * @template T
   */
  unsubscribe(prop, handler) {}
}
