import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import RouterList from 'routes';

function App() {
  //테마
  const theme = {
    token: {
      // 메인 테마 설정
      colorPrimary: 'rgb(0, 166, 237)',
    },
  };
  // ==========================

  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter>
        <RouterList />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
