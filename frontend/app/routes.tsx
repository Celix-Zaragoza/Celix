import { createBrowserRouter } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateProfileStep1 } from './pages/CreateProfileStep1';
import { CreateProfileStep2 } from './pages/CreateProfileStep2';
import { FeedPage } from './pages/FeedPage';
import { FeedSiguiendoPage } from './pages/FeedSiguiendoPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SearchUsersPage } from './pages/SearchUsersPage';
import { FollowersPage } from './pages/FollowersPage';
import { FollowingPage } from './pages/FollowingPage';
import { CreatePublicationPage } from './pages/CreatePublicationPage';
import { MessagesPage } from './pages/MessagesPage';
import { EventsPage } from './pages/EventsPage';
import { AdminPublicationsPage } from './pages/admin/AdminPublicationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'create-profile-1',
        element: <CreateProfileStep1 />,
      },
      {
        path: 'create-profile-2',
        element: <CreateProfileStep2 />,
      },
    ],
  },
  {
    path: '/app',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <FeedPage />,
      },
      {
        path: 'feed',
        element: <FeedPage />,
      },
      {
        path: 'feed-siguiendo',
        element: <FeedSiguiendoPage />,
      },
      {
        path: 'profile',
        element: <MyProfilePage />,
      },
      {
        path: 'profile/edit',
        element: <EditProfilePage />,
      },
      {
        path: 'profile/:userId',
        element: <UserProfilePage />,
      },
      {
        path: 'search',
        element: <SearchUsersPage />,
      },
      {
        path: 'followers',
        element: <FollowersPage />,
      },
      {
        path: 'following',
        element: <FollowingPage />,
      },
      {
        path: 'create-post',
        element: <CreatePublicationPage />,
      },
      {
        path: 'messages',
        element: <MessagesPage />,
      },
      {
        path: 'messages/:conversationId',
        element: <MessagesPage />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminPublicationsPage />,
      },
      {
        path: 'publications',
        element: <AdminPublicationsPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'events',
        element: <AdminEventsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
