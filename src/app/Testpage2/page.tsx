// // app/test/page.tsx
// import CounterWithRef from '@/lib/CounterWithRef';
// import CounterWithState from '@/lib/CounterWithState';

// export default function TestPage() {
//   return (
//     <div className="p-6 space-y-6">
//       <CounterWithState />
//       <CounterWithRef />
//     </div>
//   );
// }

import React, { useCallback,useMemo, useState } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);

  // useMemo: chỉ tính lại khi count thay đổi
  const doubledCount = useMemo(() => {
    console.log('Calculating doubled count...');
    return count * 2;
  }, [count]); // Chỉ tính lại khi count thay đổi

  // useCallback: chỉ tạo lại hàm khi count thay đổi
  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // Không có dependency, hàm không thay đổi (trừ khi component unmount)

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
