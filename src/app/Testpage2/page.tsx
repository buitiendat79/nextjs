'use client';
import React, { useCallback, useMemo, useState } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);

  const doubledCount = useMemo(() => {
    console.log('Calculating doubled count...');
    return count * 2;
  }, [count]);

  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Doubled Count: {doubledCount}</p>
      <ChildComponent onClick={handleClick} />
    </>
  );
}

const ChildComponent = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click me</button>;
});
