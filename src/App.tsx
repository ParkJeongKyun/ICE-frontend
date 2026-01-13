import { BrowserRouter } from 'react-router-dom';
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ProcessProvider } from '@/contexts/ProcessContext';
import { WorkerProvider } from '@/contexts/WorkerContext';
import { TabDataProvider } from '@/contexts/TabDataContext';
import { RefProvider } from '@/contexts/RefContext';
import RouterList from '@/routes';
import { MessageProvider } from './contexts/MessageContext';

export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
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
    </I18nextProvider>
  );
}

export default App;
