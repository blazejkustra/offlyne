import { useEffect, useState } from 'react';
import './App.css';
import React from 'react';

const useTest = (id: number) => () => {
  console.log(`id = `, id);

  const [state, setState] = useState(id);
  useEffect(() => {
    setState(id);
  }, [id]);

  return [state, setState] as const;
};

const off = {
  global: {
    lists: (id: number) => ({
      useState: useTest(id),
    }),
  },
};

function App() {
  const [test, setTest] = useState(5);
  const [count, setCount] = off.global.lists(test).useState();

  return (
    <div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setTest((count) => count + 1)}>test is {test}</button>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      </div>
    </div>
  );
}

export default App;
