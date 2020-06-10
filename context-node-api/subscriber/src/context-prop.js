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
 * A context property.
 *
 * @interface
 * @template T
 */
export class ContextProp {
  /**
   * A globally unique key. Extensions must use a fully qualified name such
   * as "amp-extension:key" or "amp-extension:version:key".
   * @return {string}
   */
  get key() {}

  /**
   * @return {?Object}
   */
  get type() {}

  /**
   * @return {!ContextCalc<T>}
   */
  get calc() {}
}

/**
 * A context value calculation declaration.
 *
 * @interface
 * @template T
 */
export class ContextCalc {
  /**
   * Default `false`.
   * @return {boolean}
   */
  get recursive() {}

  /**
   * @return {?Array<!ContextProp>}
   */
  get deps() {}

  /**
   * @return {function(!./node.ContextNode, T, ...*):(T|!Promise<T>)}
   */
  get compute() {}

  /**
   * @return {T|undefined}
   */
  get defaultValue() {}

  /**
   * @return {?function(!./node.ContextNode):(T|!Promise<T>)}
   */
  get rootFactory() {}
}

/**
 * @param {string|{key: string, type: (!Object|undefined)}} keyOrSpec
 * @param {{
 *   recursive: (boolean|undefined),
 *   deps: (!Array<!ContextProp>|undefined),
 *   compute: (function(!./node.ContextNode, T, ...*):(T|!Promise<T>)|undefined),
 *   defaultValue: (T|undefined),
 *   rootFactory: (?function(!./node.ContextNode):(T|!Promise<T>)|undefined),
 * }=} opt_calc
 * @return {!ContextProp<T>}
 * @template T
 */
export function contextProp(keyOrSpec, opt_calc) {
  devAssert(
    keyOrSpec && (typeof keyOrSpec == 'string' || typeof keyOrSpec == 'object')
  );
  const spec =
    typeof keyOrSpec == 'string' ? {key: keyOrSpec, type: null} : keyOrSpec;
  return /** @type {!ContextProp<T>} */ ({
    ...spec,
    calc: contextCalc(opt_calc),
  });
}

/**
 * @param {{
 *   recursive: (boolean|undefined),
 *   deps: (!Array<!ContextProp>|undefined),
 *   compute: (function(!./node.ContextNode, T, ...*):(T|!Promise<T>)|undefined),
 *   defaultValue: (T|undefined),
 *   rootFactory: (?function(!./node.ContextNode):(T|!Promise<T>)|undefined),
 * }|undefined} spec
 * @return {!ContextCalc<T>}
 * @template T
 */
export function contextCalc(spec) {
  return /** @type {!ContextCalc<T>} */ ({
    // Default values.
    recursive: false,
    deps: null,
    compute: null,
    defaultValue: undefined,
    rootFactory: null,
    // Overrides.
    ...spec,
  });
}
