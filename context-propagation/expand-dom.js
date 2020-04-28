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

function domReady() {
  const doc = document;
  function isReady() {
    return doc.readyState != 'loading' && doc.readyState != 'uninitialized';
  }
  return new Promise((resolve) => {
    if (isReady()) {
      resolve();
    } else {
      const readyListener = () => {
        if (isReady()) {
          resolve();
          doc.removeEventListener('readystatechange', readyListener);
        }
      };
      doc.addEventListener('readystatechange', readyListener);
    }
  });
}

domReady().then(() => {
  expandDom(document);
  setTimeout(() => performance.mark('test:domReady'));
});

function expandDom(root) {
  const sdTemplates = root.querySelectorAll('template[data-shadowroot]');
  Array.from(sdTemplates).forEach(createShadowRoot);
}

function createShadowRoot(template) {
  const host = template.parentElement;
  const shadowRoot = host.attachShadow({mode: 'open'});
  shadowRoot.append(template.content.cloneNode(true));
}
