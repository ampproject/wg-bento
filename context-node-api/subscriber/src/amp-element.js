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

import {createContext, useContext} from 'preact';
import {PreactBaseElement} from './base-element';
import {contextProp} from './context-prop';

// A custom Preact context. It has to be reexported as a prop. See
// `AmpElement.useContexts` below.
const CustomContext = createContext();

function ComponentImpl() {
  const customContext = useContext(CustomContext);
}


class AmpElement extends PreactBaseElement {}

AmpElement.Component = ComponentImpl;

// The CustomContext has to be exported as a context property to be propagated
// via the DOM tree.
const CustomContextProp = contextProp(
  'amp-extension:customContext',
  CustomContext,
  {recursive: true}
);

AmpElement.useContexts = [CustomContextProp];
