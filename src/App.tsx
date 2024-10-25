import { BrowserRouter } from 'react-router-dom';
import { ProcessProvider } from './contexts/ProcessContext';
import { SelectionProvider } from '@/contexts/SelectionContext';
import RouterList from '@/routes';
import { TabDataProvider } from './contexts/TabDataContext';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProcessProvider>
        <TabDataProvider>
          <SelectionProvider>
            <RouterList />
          </SelectionProvider>
        </TabDataProvider>
      </ProcessProvider>
    </BrowserRouter>
  );
}

export default App;
