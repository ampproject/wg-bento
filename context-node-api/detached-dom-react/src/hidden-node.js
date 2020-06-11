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

import {AmpContextProvider} from './amp-context';

export function HiddenNodeComponent({contextNode, children}) {

  // Mount/dismount.
  useEffect(() => {
    const mo = new MutationObserver((records) => {
      records.forEach(({target}) => {
        ContextNode.get(target).set(
          WithHidden,
          {hidden: target.hidden}
        );
      });
    });
    mo.observe(contextNode.node, {
      subtree: true,
      attributes: true,
      attributesFilter: 'hidden',
    });
    return function cleanup() {
      mo.disconnect();
    };
  }, []);

  return children;
}

// The separate component is only needed as a namespace to avoid collisions
// between two setters.
function WithHidden({hidden, children}) {
  return (
    <AmpContextProvider.Provider renderable={!hidden}>
      {children}
    </AmpContextProvider.Provider>
  );
}
