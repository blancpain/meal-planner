import { createApi } from '@reduxjs/toolkit/query/react';
import { MealRecipe, ShowCaseRecipe } from 'mangify-shared-types';
import {
  NonSensitiveUser,
  Sex,
  ActivityLevel,
  Diet,
  FullUserForClient,
  Goal,
  TActivitySchema,
  TAgeSchema,
  TCaloriesSchema,
  TCarbsSchema,
  TCuisinesSchema,
  TDietSchema,
  TFatsSchema,
  TGoalSchema,
  THeightSchema,
  TIntolerancesSchema,
  TLoginSchema,
  TMealGeneratorLandingSchema,
  TNumberOfMealsSchema,
  TProteinSchema,
  TSexSchema,
  TSignUpSchema,
  TWeightSchema,
  TSingleDayMealDate,
  TMultiMealDate,
  TOneMealRegenerationSchema,
} from '@/types';
import { baseQueryWithReauth } from '@/lib';

export const mangifyApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Meals'],
  endpoints: (build) => ({
    generateShowcaseMeals: build.mutation<ShowCaseRecipe[], TMealGeneratorLandingSchema>({
      query: ({ numberOfMeals, diet }) => ({
        url: `/meal-generator-showcase/?numberOfMeals=${numberOfMeals}&diet=${diet?.toLowerCase()}`,
        method: 'GET',
      }),
    }),
    getMeals: build.query<MealRecipe[], void>({
      query: () => ({
        url: `/meals`,
        method: 'GET',
      }),
      providesTags: ['Meals'],
    }),
    generateSingleDayMealPlan: build.mutation<MealRecipe[], TSingleDayMealDate>({
      query: (date) => ({
        url: `/meals/single-day`,
        method: 'POST',
        body: date,
      }),
      invalidatesTags: ['Meals'],
    }),
    generateMultiDayMealPlan: build.mutation<MealRecipe[], TMultiMealDate>({
      query: (dates) => ({
        url: `/meals/multi-day`,
        method: 'POST',
        body: dates,
      }),
      invalidatesTags: ['Meals'],
    }),
    regenerateOneMeal: build.mutation<MealRecipe[], TOneMealRegenerationSchema>({
      query: (data) => ({
        url: `/meals/one-meal`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Meals'],
    }),
    registerUser: build.mutation<NonSensitiveUser, TSignUpSchema>({
      query: ({ ...user }) => ({
        url: '/users',
        method: 'POST',
        body: user,
      }),
    }),
    verifyEmail: build.mutation<void, string>({
      query: (key) => ({
        url: '/users/verify-email',
        method: 'POST',
        body: { key },
      }),
    }),
    reVerifyEmail: build.mutation<void, string>({
      query: (email) => ({
        url: '/users/reverify-email',
        method: 'POST',
        body: { email },
      }),
    }),
    login: build.mutation<FullUserForClient, TLoginSchema>({
      query: ({ ...user }) => ({
        url: '/session/login',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['Meals'],
    }),
    googleLogin: build.mutation<FullUserForClient, string>({
      query: (idToken) => ({
        url: '/users/google-signin',
        method: 'POST',
        body: { idToken },
      }),
      invalidatesTags: ['Meals'],
    }),
    facebookLogin: build.mutation<FullUserForClient, string>({
      query: (idToken) => ({
        url: '/users/facebook-signin',
        method: 'POST',
        body: { idToken },
      }),
      invalidatesTags: ['Meals'],
    }),
    authCheck: build.mutation<FullUserForClient, void>({
      query: () => ({
        url: `/session/auth-check`,
        method: 'GET',
      }),
    }),
    logout: build.mutation<void, void>({
      query: () => '/session/logout',
      invalidatesTags: ['Meals'],
    }),
    setSex: build.mutation<Sex, TSexSchema>({
      query: (userSex) => ({
        url: '/user/sex',
        method: 'POST',
        body: userSex,
      }),
    }),
    setAge: build.mutation<number, TAgeSchema>({
      query: (userAge) => ({
        url: '/user/age',
        method: 'POST',
        body: userAge,
      }),
    }),
    setWeight: build.mutation<number, TWeightSchema>({
      query: (userWeight) => ({
        url: '/user/weight',
        method: 'POST',
        body: userWeight,
      }),
    }),
    setHeight: build.mutation<number, THeightSchema>({
      query: (userHeight) => ({
        url: '/user/height',
        method: 'POST',
        body: userHeight,
      }),
    }),
    setGoal: build.mutation<Goal, TGoalSchema>({
      query: (userGoal) => ({
        url: '/user/goal',
        method: 'POST',
        body: userGoal,
      }),
    }),
    setActivityLevel: build.mutation<ActivityLevel, TActivitySchema>({
      query: (userActivityLevel) => ({
        url: '/user/activity-level',
        method: 'POST',
        body: userActivityLevel,
      }),
    }),
    setIntolerances: build.mutation<string[], TIntolerancesSchema>({
      query: (userIntolerances) => ({
        url: '/user/intolerances',
        method: 'POST',
        body: userIntolerances,
      }),
    }),
    setCuisines: build.mutation<string[], TCuisinesSchema>({
      query: (userCuisines) => ({
        url: '/user/cuisines',
        method: 'POST',
        body: userCuisines,
      }),
    }),
    setDiet: build.mutation<Diet, TDietSchema>({
      query: (userDiet) => ({
        url: '/user/diet',
        method: 'POST',
        body: userDiet,
      }),
    }),
    setNumberOfMeals: build.mutation<number, TNumberOfMealsSchema>({
      query: (userNumberOfMeals) => ({
        url: '/user/number-of-meals',
        method: 'POST',
        body: userNumberOfMeals,
      }),
    }),
    setCalories: build.mutation<number, TCaloriesSchema>({
      query: (userCalories) => ({
        url: '/user/calories',
        method: 'POST',
        body: userCalories,
      }),
    }),
    setProtein: build.mutation<number, TProteinSchema>({
      query: (userProtein) => ({
        url: '/user/protein',
        method: 'POST',
        body: userProtein,
      }),
    }),
    setCarbs: build.mutation<number, TCarbsSchema>({
      query: (userCarbs) => ({
        url: '/user/carbs',
        method: 'POST',
        body: userCarbs,
      }),
    }),
    setFats: build.mutation<number, TFatsSchema>({
      query: (userFats) => ({
        url: '/user/fats',
        method: 'POST',
        body: userFats,
      }),
    }),
  }),
});

export const {
  useGenerateShowcaseMealsMutation,
  useRegisterUserMutation,
  useLoginMutation,
  useLogoutMutation,
  useAuthCheckMutation,
  useSetAgeMutation,
  useSetSexMutation,
  useSetDietMutation,
  useSetGoalMutation,
  useSetHeightMutation,
  useSetWeightMutation,
  useSetCuisinesMutation,
  useSetIntolerancesMutation,
  useSetActivityLevelMutation,
  useSetNumberOfMealsMutation,
  useSetFatsMutation,
  useSetCarbsMutation,
  useSetProteinMutation,
  useSetCaloriesMutation,
  useGenerateSingleDayMealPlanMutation,
  useGenerateMultiDayMealPlanMutation,
  useRegenerateOneMealMutation,
  useGetMealsQuery,
  useGoogleLoginMutation,
  useFacebookLoginMutation,
  useVerifyEmailMutation,
  useReVerifyEmailMutation,
} = mangifyApi;
