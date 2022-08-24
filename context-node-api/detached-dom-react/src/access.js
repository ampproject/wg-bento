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

import {useContext, useEffect, useCallback, useMemo} from 'preact';
import {ContextNode} from './context-node';
import {AmpContextProvider} from './amp-context';

// TBD: by default `AccessContext` just always returns `false`.
const AccessContext = createContext(() => false);

export const AccessService {

  onNewAccessElement(contextNode) {
    const contextNode = ContextNode.get(element);
    const expr = contextNode.element.getAttribute('amp-access-expr');
    contextNode.set(WithAccess, {expr});
  }
}

export function AccessProvider({accessData, children}) {
  const checkAccess = useCallback(
    (expr) => expr.test(accessData),
    [accessData]
  );
  return (
    <AccessContext.Provider value={checkAccess}>
      {children}
    </AccessContext.Provider>
  );
}

export function WithAccess({expr, children}) {
  const compiledExpr = useMemo(() => getAccessExpr(expr), [expr]);
  const checkAccess = useContext(AccessContext);
  const hasAccess = checkAccess(compiledExpr);
  // TBD: How can we correctly process `return null` here? It should be
  // translated to `display: none` + `renderable=false`. Ideally, `WithAccess`
  // would be an exportable component and `return null` is the only caveat
  // here.
  return hasAccess ? children : null;
}


// Install.
AMP.extension('amp-access', '0.1', () => {
  AMP.registerServiceForDoc('accessContexts', function(ampdoc) {
    const root = ContextNode.get(ampdoc.rootNode);
    root.set(AccessProvider);
  });
});
