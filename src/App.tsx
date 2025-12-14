import { BrowserRouter } from 'react-router-dom';
import { ProcessProvider } from '@/contexts/ProcessContext';
import { WorkerProvider } from '@/contexts/WorkerContext';
import { TabDataProvider } from '@/contexts/TabDataContext';
import RouterList from '@/routes';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProcessProvider>
        <WorkerProvider>
          <TabDataProvider>
            <RouterList />
          </TabDataProvider>
        </WorkerProvider>
      </ProcessProvider>
    </BrowserRouter>
  );
}

export default App;
