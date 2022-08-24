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

/**
 * Factory to provide the MeasureSize.
 *
 * Installed in the `root-props.js`.
 *
 * @param {!ContextNode} contextNode
 */
export function measureSizeFactory(contextNode) {
  const scheduled = typeof WeakMap == 'function' ? new WeakMap() : new Map();
  const io = new IntersectionObserver((records) => {
    for (let i = records.length - 1; i >= 0; i--) {
      const {target, boundingClientRect: {width, height}} = records[i];
      const deferred = scheduled.get(target);
      if (deferred) {
        deferred.resolve({width, height});
        scheduled.delete(target);
        io.unobserve(target);
      }
    }
  });

  // TBD: where/how to disconnect?

  const value = (node) => {
    let deferred = this.scheduled_.get(node);
    if (!deferred) {
      deferred = new Deferred();
      this.scheduled_.set(node, deferred);
      this.io_.observe(node);
    }
    return deferred.promise;
  };

  return value;
}
