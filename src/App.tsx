import { SelectionProvider } from 'contexts/SelectionContext';
import { BrowserRouter } from 'react-router-dom';
import RouterList from 'routes';

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <SelectionProvider>
        <RouterList />
      </SelectionProvider>
    </BrowserRouter>
  );
}

export default App;
