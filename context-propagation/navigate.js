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
  // Test1:
  const attr = 'data-root';
  const root = document.querySelector(`[${attr}]`);
  const node = l5.shadowRoot.getElementById('sd_l3');

  // Test2:
  // const attr = 'data-root-2';
  // const root = l5.shadowRoot.querySelector(`[${attr}]`);
  // const node = ld5_slot1;

  console.log('func:', func.name);
  console.log('root:', root);
  console.log('node:', node);
  root.FIND_ME = true;
  if (func.setup) {
    func.setup(root);
  }
  console.profile(func.name);
  const startTime = performance.now();
  performance.mark('test:' + func.name);
  for (let i = 0; i < 10000; i++) {
    const result = func(node, attr);
    if (result !== root) {
      throw new Error('not found');
    }
  }
  performance.measure('test:' + func.name + '-end', 'test:' + func.name);
  const endTime = performance.now();
  console.profileEnd(func.name);
  console.log('done ', func.name, ':', endTime - startTime);
  root.FIND_ME = false;
}

function navigateChain(node, attr) {
  let n = node;
  while (n) {
    if (n.FIND_ME) {
      return n;
    }
    if (n.assignedSlot) {
      n = n.assignedSlot;
    } else if (n.nodeType == /* SHADOW */ 11) {
      n = n.host;
    } else {
      n = n.parentNode;
    }
  }
  return null;
}

function navigateQuery(node, attr) {
  // TODO: can we do composite for this at all?
  let n = node;
  while (n) {
    if (n.nodeType == 1) {
      const q = n.closest(`[${attr}]`);
      if (q) {
        return q;
      }
    }
    n = n.getRootNode().host;
  }
  return null;
}

function navigateEvent(node) {
  let found = null;
  const event = new Event('custom:propagate', {
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  event.foundCallback = (root) => {
    found = root;
  };
  node.dispatchEvent(event);
  return found;
}

navigateEvent.setup = function(root) {
  root.addEventListener('custom:propagate', (e) => {
    if (e.foundCallback) {
      e.foundCallback(root);
    }
    e.stopPropagation();
  });
};
