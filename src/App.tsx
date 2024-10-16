import { BrowserRouter } from 'react-router-dom';
import { ProcessProvider } from './contexts/ProcessContext';
import { SelectionProvider } from '@/contexts/SelectionContext';
import RouterList from '@/routes';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProcessProvider>
        <SelectionProvider>
          <RouterList />
        </SelectionProvider>
      </ProcessProvider>
    </BrowserRouter>
  );
}

export default App;
