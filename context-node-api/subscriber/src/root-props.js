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
import {contextCalc} from './context-prop';
import {
  BaseUriProp,
  RootVisibilityProp,
  RenderableProp,
  MeasureSizeProp,
} from './standard-props';
import {MeasureSizeService} from './measure-size';

/** @param {!AmpDoc} ampdoc */
export function installRootProps(ampdoc) {
  const root = ContextNode.get(ampdoc.getRootNode());

  // Document visibility.
  root.set(RootVisibilityProp, ampdoc.getVisibilityState());
  ampdoc.onVisibilityChanged(() =>
    root.set(RootVisibilityProp, ampdoc.getVisibilityState()));

  // Automaticlaly recalculate `Renderable` whenever root visibility changes.
  contextRoot.provide(
    RenderableProp,
    contextCalc({
      deps: [RootVisibilityProp],
      compute(contextNode, renderable, rootVisibility) {
        return renderable && rootVisibility == 'visible';
      },
    }));

  // Base URI.
  root.set(BaseUriProp, ampdoc.getUrl());
}


// Install all root contexts in a decentralized way: each extension can install
// its own set.
AMP.extension(() => {
  AMP.registerServiceForDoc(installRootProps);
});
