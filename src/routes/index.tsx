import MainLayout from '@/layouts';
import HomePage from '@/pages';
import About from '@/pages/About';
import LinkNote from '@/pages/LinkNote';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

const RouterList = () => {
  return useRoutes([
    {
      element: <MainLayout />,
      children: [
        // 홈
        {
          path: '/',
          element: <HomePage />,
        },
      ],
    },
    {
      path: '/About',
      element: <About />,
    },
    {
      path: '/LinkNote',
      element: <LinkNote />,
    },
    // Not Found Page
    {
      path: '*',
      element: <Navigate to="/" />,
    },
  ]);
};

export default RouterList;
