import { BrowserRouter } from 'react-router-dom';
import { ProcessProvider } from '@/contexts/ProcessContext';
import { WorkerProvider } from '@/contexts/WorkerContext';
import { TabDataProvider } from '@/contexts/TabDataContext';
import { RefProvider } from '@/contexts/RefContext';
import RouterList from '@/routes';
import { MessageProvider } from './contexts/MessageContext';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <MessageProvider>
        <ProcessProvider>
          <WorkerProvider>
            <TabDataProvider>
              <RefProvider>
                <RouterList />
              </RefProvider>
            </TabDataProvider>
          </WorkerProvider>
        </ProcessProvider>
      </MessageProvider>
    </BrowserRouter>
  );
}

export default App;
