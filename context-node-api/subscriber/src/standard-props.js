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

import {contextProp} from './context-prop';
import {measureSizeFactory} from './measure-size';

/** @const {!ContextProp<string>} */
export const BaseUriProp = contextProp(
  'BaseUri',
  {
    rootFactory: (rootNode) => rootNode.baseURI,
    recursive: true,
  }
);

/** @type {!ContextProp<string>} */
export const RootVisibilityProp = contextProp(
  'RootVisibility',
  {
    recursive: true,
  }
);

/** @type {!ContextProp<function(element):Rect} */
export const MeasureSizeProp = contextProp(
  'MeasureSize',
  {
    recursive: true,
    rootFactory: measureSizeFactory,
  }
);

/** @const {!ContextProp<boolean>} */
export const RenderableProp = contextProp(
  'Renderable',
  {
    defaultValue: true,
    recursive: true,
    deps: [MeasureSizeProp],
    compute: (contextNode, thisValue, parentValue, measureSize) => {
      const renderable = thisValue && parentValue;
      if (renderable) {
        return measureSize(contextNode.element)
          .then(({width, height}) => width > 0 && height > 0);
      }
      return false;
    },
  }
);

/** @const {!ContextProp<boolean>} */
export const PlayableProp = contextProp('Playable', {
  rootDefault: true,
  recursive: true,
  deps: [RenderableProp],
  compute: (contextNode, thisValue, parentValue, renderable) =>
    thisValue && parentValue && renderable,
});

/** @const {!ContextProp<boolean>} */
export const LoadedStateProp = contextProp('LoadedState');
