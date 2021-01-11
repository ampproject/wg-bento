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

import {useContext, useState, useLayoutEffect, useEffect} from 'preact';

// TBD: It's very hard to give a good default value to this context.
// Ideally we'd be able to automatically configured the provider for the root.
const MeasureSizeContext = createContext(
  (element) => Promise.resolve(element.getBoundingClientRect()
);

export useMeasureSize() {
  return useContext(MeasureSizeContext);
}

/**
 * The implementation of the MeasureSizeContext.
 *
 * Installed in the `root-contexts.js`.
 *
 * TBD: this is a race condition: before this provider is registered, the
 * non-optimal default will be used. Ideally, we'd just block the related
 * functions until this provider is installed.
 */
export function MeasureSizeProvider({children}) {
  const scheduledRef = useRef(null);
  const ioRef = useRef(null);

  // Cleanup InOb on unmount.
  useEffect(() => {
    return () => {
      const io = ioRef.current;
      if (io) {
        io.disconnect();
      }
    };
  }, []);

  const measureSize = useCallback((element) => {
    const scheduled =
      scheduledRef.current ??
      (scheduledRef.current = typeof WeakMap == 'function' ? new WeakMap() : new Map());
    const io =
      ioRef ??
      (ioRef.current = new IntersectionObserver((records) => {
        const {target, boundingClientRect: {width, height}} = records[i];
        const deferred = scheduled.get(target);
        if (deferred) {
          deferred.resolve({width, height});
          scheduled.delete(target);
          io.unobserve(target);
        }
      }));
    let deferred = scheduled.get(node);
    if (!deferred) {
      deferred = new Deferred();
      scheduled.set(node, deferred);
      io.observe(node);
    }
    return deferred.promise;
  }, []);

  return (
    <MeasureSizeContext.Provider value={measureSize}>
      {children}
    </MeasureSizeContext.Provider>
  );
}
