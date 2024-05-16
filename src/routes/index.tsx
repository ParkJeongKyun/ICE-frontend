import HomePage from 'pages';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

const RouterList = () => {
  return useRoutes([
    {
      // element: <MainLayout />,
      // element: <></>,
      children: [
        // 홈
        {
          path: '/',
          element: <HomePage />,
        },
      ],
    },
    // Not Found Page
    // {
    //   path: '*',
    //   element: <Navigate to="/page-not-found" />,
    // },
  ]);
};

export default RouterList;
