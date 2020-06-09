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

async function test(func) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  container.setAttribute('data-test', func.name);

  console.log('test: ', func.name);
  const totalStartTime = performance.now();
  console.profile(func.name);
  let time = 0;
  performance.mark('test:' + func.name);
  for (let i = 0; i < 100; i++) {
    let options = {container};
    if (func.setup) {
      options = {...options, ...func.setup(container)};
    }

    const startTime = performance.now();
    await func(options);
    const endTime = performance.now();
    await new Promise(resolve => setTimeout(resolve));
    time += endTime - startTime;
  }
  performance.measure('test:' + func.name + '-end', 'test:' + func.name);
  console.profileEnd(func.name);
  const totalTime = performance.now() - totalStartTime;
  console.log('done ', func.name, ':', time, totalTime);
  container.remove();
}

function createDom(container) {
  const elements = [];
  for (let i = 0; i < 1000; i++) {
    const content = document.createElement('div');
    content.textContent = 'a';
    container.appendChild(content);
    elements.push(content);
  }
  return elements;
}

function sum(rects) {
  return rects.reduce((acc, v) => acc + v.height, 0);
}

async function measureViaBcr({container}) {
  const elements = createDom(container);

  const total = sum(elements.map(e => e.getBoundingClientRect()));

  if (total != 18000) {
    throw new Error('sanity check: ' + total);
  }

  container.textContent = '';
}

async function measureViaInOb({container, measure}) {
  const elements = createDom(container);

  const rects = await Promise.all(elements.map(measure));
  const total = sum(rects);

  if (total != 18000) {
    throw new Error('sanity check: ' + total);
  }

  container.textContent = '';
}

measureViaInOb.setup = function() {
  const pendingMap = new Map();
  const io = new IntersectionObserver((records) => {
    for (let i = records.length - 1; i >= 0; i--) {
      const {target, boundingClientRect} = records[i];
      const pending = pendingMap.get(target);
      if (pending) {
        pendingMap.delete(target);
        pending.resolve(boundingClientRect);
      }
    }
  });
  return {
    measure(element) {
      let pending = pendingMap.get(element);
      if (!pending) {
        let resolve;
        const promise = new Promise(callback => {
          resolve = callback;
        });
        pending = {promise, resolve};
        pendingMap.set(element, pending);
        io.observe(element);
      }
      return pending.promise;
    },
  };
};
