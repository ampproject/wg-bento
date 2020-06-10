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

import {createContext, useContext, useMemo} from 'preact';

export const AmpContext = createContext({renderable: true, playable: true});

export function useAmpContext() {
  return useContext(AmpContext);
}

export function AmpContextProvider({
  renderable: renderableProp = true,
  playable: playableProp = true,
}) {
  const parentState = useContext(AmpContext);
  const renderable = renderableProp && parentState.renderable;
  const playable = renderable && playableProp && parentState.playable;
  const value = useMemo(() => ({renderable, playable}), [renderable, playable]);
  return (
    <RenderableContext.Provider value={value}>
      {children}
    </RenderableContext.Provider>
  );
}
