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

const PROFILE = false;

async function test(func, scheduler) {
  const testName = func.name + '@' + scheduler.name;
  const container = document.createElement('div');
  document.body.appendChild(container);
  container.setAttribute('data-test', testName);
  console.log('test: ', testName);
  const tasks = genTasks(10000000);
  PROFILE && console.profile(testName);
  // const {stop, report} = rafMonitor();
  const totalStartTime = performance.now();
  let time = 0;
  performance.mark('test:' + testName);
  for (let i = 0; i < 1; i++) {
    let options = {container, tasks};
    if (func.setup) {
      options = {...options, ...func.setup(container)};
    }

    const startTime = performance.now();
    const results = await func(options, scheduler);
    const endTime = performance.now();
    time += endTime - startTime;
    // const total = results.reduce((acc, v) => acc + v, 0);
    // if (total != 10000) {
    //   throw new Error('sanity check: ' + total);
    // }
  }
  // stop();
  performance.measure('test:' + testName + '-end', 'test:' + testName);
  PROFILE && console.profileEnd(testName);
  const totalTime = performance.now() - totalStartTime;
  console.log('done ', testName, ':', time.toFixed(4), totalTime.toFixed(4));
  // report(testName, totalTime);
  container.remove();
}

function rafMonitor() {
  let count = 0;
  let stopped = false;

  const round = () => {
    count++;
    if (!stopped) {
      requestAnimationFrame(round);
    }
  };

  const stop = () => {
    stopped = true;
  };

  const report = (testName, totalTime) => {
    console.log('FPS ', testName, ':', count, count / (totalTime / 1000));
  };

  requestAnimationFrame(round);
  return {stop, report};
}

function genTasks(N) {
  const tasks = [];
  for (let i = 0; i < N; i++) {
    tasks.push(() => i * 2 + 1);
  }
  return tasks;
}

function perTask({tasks}, scheduler) {
  return Promise.all(tasks.map(scheduler));
}

function perArray({tasks}, scheduler) {
  return scheduler(() => tasks.map(task => task()));
}

function idleAuto({tasks}) {
  const values = [];
  let index = 0;
  let chunkCount = 0;

  return new Promise((resolve) => {
    const chunk = (deadline) => {
      chunkCount++;
      while (index < tasks.length && deadline.timeRemaining() > 10) {
        // console.log('qqq: deadline.timeRemaining() = ', chunkCount, deadline.timeRemaining());
        const task = tasks[index];
        values[index] = task();
        index++;
      }
      if (index < tasks.length) {
        requestIdleCallback(chunk);
      } else {
        resolve(values);
        // console.log('chunk count: ', chunkCount);
      }
    };
    requestIdleCallback(chunk);
  });
}
