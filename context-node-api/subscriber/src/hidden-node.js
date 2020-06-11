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
import {RenderableProp} from './standard-props';

export class HiddenNodeService {

  constructor(ampdoc) {
    this.mo_ = new MutationObserver((records) => {
      records.forEach(({target}) => {
        // TBD: property setters collision.
        ContextNode.get(target).set(RenderableProp, !target.hidden);
      });
    });
    this.mo_.observe(contextNode.node, {
      subtree: true,
      attributes: true,
      attributesFilter: 'hidden',
    });
  }

  dispose() {
    this.mo_.disconnect();
  }
}
