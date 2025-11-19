import { BrowserRouter } from 'react-router-dom';
import { ProcessProvider } from './contexts/ProcessContext';
import RouterList from '@/routes';
import { TabDataProvider } from './contexts/TabDataContext';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProcessProvider>
        <TabDataProvider>
          <RouterList />
        </TabDataProvider>
      </ProcessProvider>
    </BrowserRouter>
  );
}

export default App;
