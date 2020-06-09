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

function microTask(callback) {
  return Promise.resolve().then(callback);
}

function macroTask(callback) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(callback());
    });
  });
}

function rafTask(callback) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve(callback());
    });
  });
}

function idleTask(callback) {
  return new Promise((resolve) => {
    requestIdleCallback((deadline) => {
      resolve(callback(deadline));
    });
  });
}


function taskTests() {

  const results = [];
  const promises = [];
  const startTime = performance.now();

  function result(name, value) {
    results.push({name, value, time: performance.now() - startTime});
  }

  function micro(name) {
    name = 'micro:' + name;
    promises.push(microTask(() => {
      result(name);
    }));
  }

  function macro(name) {
    name = 'macro:' + name;
    promises.push(macroTask(() => {
      result(name);
      return micro(name);
    }));
  }

  function raf(name) {
    name = 'raf:' + name;
    promises.push(rafTask(() => {
      result(name);
      return micro(name);
    }));
  }

  function idle(name) {
    name = 'idle:' + name;
    promises.push(idleTask((deadline) => {
      result(name, deadline.timeRemaining());
      return micro(name);
    }));
  }

  micro('one');
  micro('two');
  micro('three');

  macro('one');
  macro('two');
  macro('three');

  raf('one');
  raf('two');
  raf('three');

  idle('one');
  idle('two');
  idle('three');

  return Promise.all(promises).then(() => results);
}

