import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { useAuth } from '@/hooks';

// public routes
import {
  PublicRoot,
  Landing,
  LearnRoute,
  SignUpRoute,
  LoginRoute,
  AboutRoute,
  VerificationRoute,
} from '@/routes/public';

// protected routes
import {
  DashboardLayout,
  MealPlannerRoute,
  MealSettingsRoute,
  DietPreferencesRoute,
  UserSettingsRoute,
  NutritionProfileRoute,
  ShoppingListRoute,
} from '@/routes/protected';

export function AppRoutes() {
  const { user, isLoading, isUninitialized } = useAuth();

  if (isLoading || isUninitialized) {
    return <> </>;
  }

  const protectedRoutes = createBrowserRouter([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          element: <MealPlannerRoute />,
          index: true,
        },
        {
          element: <ShoppingListRoute />,
          path: 'shopping-list',
        },
        {
          element: <MealSettingsRoute />,
          path: 'meal-settings',
        },
        {
          element: <DietPreferencesRoute />,
          path: 'diet-preferences',
        },
        {
          element: <UserSettingsRoute />,
          path: 'user-settings',
        },
        {
          element: <NutritionProfileRoute />,
          path: 'nutrition-profile',
        },
        // catch all route
        {
          element: <Navigate to="/" />,
          path: '*',
        },
      ],
    },
  ]);

  const publicRoutes = createBrowserRouter([
    {
      path: '/',
      element: <PublicRoot />,
      children: [
        {
          element: <Landing />,
          index: true,
        },
        {
          element: <LoginRoute />,
          path: 'login',
        },
        {
          element: <SignUpRoute />,
          path: 'sign-up',
        },
        {
          element: <AboutRoute />,
          path: 'about',
        },
        {
          element: <LearnRoute />,
          path: 'learn',
        },
        // catch all route
        {
          element: <Navigate to="/" />,
          path: '*',
        },
      ],
    },
    {
      path: '/verify-email',
      element: <VerificationRoute />,
    },
  ]);

  const routesToRender = user.name ? protectedRoutes : publicRoutes;

  return <RouterProvider router={routesToRender} />;
}
