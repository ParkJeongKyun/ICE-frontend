import HexViewer from 'components/common/HexViewer';
import { useState } from 'react';

const HomePage: React.FC = () => {
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);

  return (
    <div className="App">
      <h1>Hex Viewer</h1>
      {arrayBuffer && <HexViewer arrayBuffer={arrayBuffer} />}
    </div>
  );
};

export default HomePage;
