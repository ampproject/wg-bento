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

function test(func) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  container.setAttribute('data-test', func.name);
  const {totalJSHeapSize: start_totalJSHeapSize, usedJSHeapSize: start_usedJSHeapSize} =
    performance.memory;
  console.log('test: ', func.name);
  console.log({start_totalJSHeapSize, start_usedJSHeapSize});
  const totalStartTime = performance.now();
  console.profile(func.name);
  let time = 0;
  performance.mark('test:' + func.name);
  for (let i = 0; i < 50000; i++) {
    let options = {container};
    if (func.setup) {
      options = {...options, ...func.setup(container)};
    }

    const startTime = performance.now();
    func(options);
    const endTime = performance.now();
    time += endTime - startTime;
  }
  performance.measure('test:' + func.name + '-end', 'test:' + func.name);
  console.profileEnd(func.name);
  const totalTime = performance.now() - totalStartTime;
  const {totalJSHeapSize: end_totalJSHeapSize, usedJSHeapSize: end_usedJSHeapSize} =
    performance.memory;
  console.log('done ', func.name, ':', time, totalTime
      // --, performance.memory
      , {
        // totalJSHeapSize: end_totalJSHeapSize - start_totalJSHeapSize,
        usedJSHeapSize: (end_usedJSHeapSize - start_usedJSHeapSize)/1000,
      });
  container.remove();
}

function createContent() {
  const content = document.createElement('div');
  content.className = 'content';
  const child = document.createElement('span');
  child.textContent = 'a';
  content.appendChild(child);
  return content;
}

function lightDom({container}) {
  const element = document.createElement('div');
  element.className = 'element';

  const subroot = document.createElement('div');
  subroot.className = 'subroot';
  subroot.appendChild(createContent());
  element.appendChild(subroot);

  container.appendChild(element);
  if (!subroot.querySelector('span')) {
    throw new Error('sanity check');
  }
}

function shadowDom({container}) {
  const element = document.createElement('div');
  element.className = 'element';

  const subroot = element.attachShadow({mode: 'open'});
  subroot.appendChild(createContent());

  container.appendChild(element);
  if (!subroot.querySelector('span')) {
    throw new Error('sanity check');
  }
}
