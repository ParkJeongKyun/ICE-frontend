import { SelectionProvider } from 'contexts/SelectionContext';
import { BrowserRouter } from 'react-router-dom';
import RouterList from 'routes';

function App() {
  return (
    <BrowserRouter>
      <SelectionProvider>
        <RouterList />
      </SelectionProvider>
    </BrowserRouter>
  );
}

export default App;
