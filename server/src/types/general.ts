import { z, ZodType } from 'zod';

// NOTE: wrapper to allow us to pass generic schemas
export type ZodSchemaGenericWrapper<T> = ZodType<T>;

export const MealGeneratorLandingSchema = z.object({
  numberOfMeals: z.string().min(1, { message: 'Please specify the number of meals' }),
  diet: z.string().optional(),
});

export type TMealGeneratorLandingSchema = z.infer<typeof MealGeneratorLandingSchema>;

// sign-up and login
export const signUpSchema = z

  .object({
    name: z.string().min(1, 'Please enter your name'),
    email: z.string().min(1, 'Please enter your email').email(),
    password: z.string().min(10, 'Password must be at least 10 characters'),
    confirmPassword: z.string(),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type TSignUpSchema = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email').email(),
  password: z.string().min(1, 'Please enter your password'),
});

export type TLoginSchema = z.infer<typeof loginSchema>;

// user settings

// HACK: this the way to convert Prisma ENUMs to ts enums (see https://github.com/prisma/prisma/discussions/9215)
export const Role: {
  USER: 'BASIC';
  ADMIN: 'ADMIN';
} = {
  USER: 'BASIC',
  ADMIN: 'ADMIN',
};

export type TRole = (typeof Role)[keyof typeof Role];

// Diet - Prisma type and zod schema for validation
export const DietForUserProfile: {
  ANYTHING: 'ANYTHING';
  VEGETARIAN: 'VEGETARIAN';
  VEGAN: 'VEGAN';
  KETOGENIC: 'KETOGENIC';
  PALEO: 'PALEO';
  PESCETARIAN: 'PESCETARIAN';
} = {
  ANYTHING: 'ANYTHING',
  VEGETARIAN: 'VEGETARIAN',
  VEGAN: 'VEGAN',
  KETOGENIC: 'KETOGENIC',
  PALEO: 'PALEO',
  PESCETARIAN: 'PESCETARIAN',
};

export type TDietForUserProfile = (typeof DietForUserProfile)[keyof typeof DietForUserProfile];

export enum Diet {
  ANYTHING = 'ANYTHING',
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  KETOGENIC = 'KETOGENIC',
  PALEO = 'PALEO',
  PESCETARIAN = 'PESCETARIAN',
}
export const DietSchema = z.object({
  diet: z.nativeEnum(Diet),
});
export type TDietSchema = z.infer<typeof DietSchema>;

// Sex - Prisma type and zod schema for validation
export const SexForUserProfile: {
  MALE: 'MALE';
  FEMALE: 'FEMALE';
} = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
};

export type TSexForUserProfile = (typeof SexForUserProfile)[keyof typeof SexForUserProfile];

export enum Sex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}
export const SexSchema = z.object({
  sex: z.nativeEnum(Sex),
});
export type TSexSchema = z.infer<typeof SexSchema>;

// Activity level - Prisma type and zod schema for validation
export const ActivityLevelForUserProfile: {
  SEDENTARY: 'SEDENTARY';
  LIGHT: 'LIGHT';
  MODERATE: 'MODERATE';
  VERYACTIVE: 'VERYACTIVE';
} = {
  SEDENTARY: 'SEDENTARY',
  LIGHT: 'LIGHT',
  MODERATE: 'MODERATE',
  VERYACTIVE: 'VERYACTIVE',
};

export type TActivityLevelForUserProfile =
  (typeof ActivityLevelForUserProfile)[keyof typeof ActivityLevelForUserProfile];

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHT = 'LIGHT',
  MODERATE = 'MODERATE',
  VERYACTIVE = 'VERYACTIVE',
}
export const ActivitySchema = z.object({
  activity: z.nativeEnum(ActivityLevel),
});
export type TActivitySchema = z.infer<typeof ActivitySchema>;

// Goal - Prisma type and zod schema for validation
export const GoalForUserProfile: {
  LOSEWEIGHT: 'LOSEWEIGHT';
  MAINTAIN: 'MAINTAIN';
  GAINWEIGHT: 'GAINWEIGHT';
} = {
  LOSEWEIGHT: 'LOSEWEIGHT',
  MAINTAIN: 'MAINTAIN',
  GAINWEIGHT: 'GAINWEIGHT',
};

export type TGoalForUserProfile = (typeof GoalForUserProfile)[keyof typeof GoalForUserProfile];

export enum Goal {
  LOSEWEIGHT = 'LOSEWEIGHT',
  MAINTAIN = 'MAINTAIN',
  GAINWEIGHT = 'GAINWEIGHT',
}
export const GoalSchema = z.object({
  goal: z.nativeEnum(Goal),
});
export type TGoalSchema = z.infer<typeof GoalSchema>;

export const AgeSchema = z.object({
  age: z.number().optional(),
});
export type TAgeSchema = z.infer<typeof AgeSchema>;

export const WeightSchema = z.object({
  weight: z.number(),
});
export type TWeightSchema = z.infer<typeof WeightSchema>;

export const HeightSchema = z.object({
  height: z.number(),
});
export type THeightSchema = z.infer<typeof HeightSchema>;

export const NumberOfMealsSchema = z.object({
  numberOfMeals: z.number(),
});
export type TNumberOfMealsSchema = z.infer<typeof NumberOfMealsSchema>;

export const CuisinesSchema = z.object({
  cuisines: z.string().array(),
});
export type TCuisinesSchema = z.infer<typeof CuisinesSchema>;

export const IntolerancesSchema = z.object({
  intolerances: z.string().array(),
});
export type TIntolerancesSchema = z.infer<typeof IntolerancesSchema>;

export const CaloriesSchema = z.object({
  calories: z.number(),
});
export type TCaloriesSchema = z.infer<typeof CaloriesSchema>;

export const ProteinSchema = z.object({
  protein: z.number(),
});
export type TProteinSchema = z.infer<typeof ProteinSchema>;

export const FatsSchema = z.object({
  fats: z.number(),
});
export type TFatsSchema = z.infer<typeof FatsSchema>;

export const CarbsSchema = z.object({
  carbs: z.number(),
});
export type TCarbsSchema = z.infer<typeof CarbsSchema>;

// date types for meal generation

// NOTE: we use strings here and pass a luxon ISO string to the server to avoid issues with timezones and z.coerce
export const SingleDayMealDateSchema = z.object({
  date: z.string(),
});
export type TSingleDayMealDate = z.infer<typeof SingleDayMealDateSchema>;

export const MultiMealDateSchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
});
export type TMultiMealDate = z.infer<typeof MultiMealDateSchema>;

// schema and type for one meal regeneration

export const OneMealRegenerationSchema = z.object({
  date: z.string(),
  uniqueIdentifier: z.string(),
  mealType: z.string(),
});
export type TOneMealRegenerationSchema = z.infer<typeof OneMealRegenerationSchema>;

export type NonSensitiveUser = {
  name: string;
  email: string;
  id: string;
  role: TRole;
  verificationToken: string;
};

export type UserForAuth = {
  name: string;
  email: string;
  id: string;
  role: TRole;
  disabled: boolean;
  verified: boolean;
};

export type FullUserForAuth = {
  user: UserForAuth;
  profile: UserProfileForClient;
};

export type UserForClient = {
  name: string | null;
  email: string | null;
};

export type UserProfileForClient = {
  diet: TDietForUserProfile | null;
  sex: TSexForUserProfile | null;
  activity_level: TActivityLevelForUserProfile | null;
  goal: TGoalForUserProfile | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  intolerances: string[] | null;
  favorite_cuisines: string[] | null;
  meals_per_day: number | null;
};

type RequiredNonNullableObject<T extends object> = {
  [P in keyof Required<T>]: NonNullable<T[P]>;
};

type NonNullableUserProfile = RequiredNonNullableObject<UserProfileForClient>;

export type NonNullableUserProfileForClient = Pick<
  NonNullableUserProfile,
  'activity_level' | 'age' | 'goal' | 'weight' | 'height' | 'sex'
>;

export type UserMeal = {
  recipe_external_id: number | null;
  active: boolean;
};

export type UserMeals = {
  meals: UserMeal[];
};

export type FullUserForClient = {
  user: UserForClient;
  profile: UserProfileForClient;
};
