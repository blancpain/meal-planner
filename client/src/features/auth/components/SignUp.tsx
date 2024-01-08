import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Anchor,
  Stack,
  Box,
  Title,
  Container,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { signInWithPopup } from 'firebase/auth';
import { signUpSchema, TSignUpSchema } from '@/types';
import { GoogleButton, FacebookButton } from '@/components/Buttons';
import {
  useFacebookLoginMutation,
  useGoogleLoginMutation,
  useRegisterUserMutation,
} from '@/features/api';
import { isFetchBaseQueryError, isErrorWithMessage } from '@/utils';
import { googleProvider, auth, facebookProvider } from '@/firebase';
import { setUser } from '@/stores';
import { useAppDispatch } from '@/hooks';

export function SignUp(props: PaperProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [registerUser] = useRegisterUserMutation();
  const navigate = useNavigate();
  const [genericError, setGenericError] = useState('');
  const [googleLogin] = useGoogleLoginMutation();
  const [facebookLogin] = useFacebookLoginMutation();
  const dispatch = useAppDispatch();

  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const token = await res.user?.getIdToken();
      const user = await googleLogin(token).unwrap();
      dispatch(setUser(user));
      navigate('/', { replace: true });
      reset();
    } catch (error: unknown) {
      setGenericError('Something went wrong at Google. Please try again');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const res = await signInWithPopup(auth, facebookProvider);
      const token = await res.user?.getIdToken();

      const user = await facebookLogin(token).unwrap();
      dispatch(setUser(user));
      navigate('/', { replace: true });
      reset();
    } catch (error: unknown) {
      setGenericError('Something went wrong at Facebook. Please try again');
    }
  };

  const onSubmit: SubmitHandler<TSignUpSchema> = async (data) => {
    setGenericError('');
    try {
      await registerUser(data).unwrap();
      navigate('/login');
      reset();
      notifications.show({
        id: 'register-success',
        icon: <IconCheck size="1rem" />,
        title: 'Registration successful! Please check your inbox for an email from us.',
        color: 'teal',
        message: '',
        autoClose: 5000,
      });
    } catch (error: unknown) {
      /*
      NOTE: Error handling flow:
       * if the error is a fetchBaseQuery error we check the 'errors' property first
       * if it is an object we can assume this is a zodError due to how we set up the backend (i.e. {"errors": {"error1": "msg", "error2": "msg"} ... })
       * we go through all possible form validation errors
       * if the error is not a zodError we check if 'errors' is a string as this is how we set up all other errors in the backend (i.e. {"errors" : "msg"})
       * if the error is not a zodError or one of our custom errors we fall back to a generic error msg
       * finally if we are dealing with a broader generic error (i.e. not a fetchBaseQuery error) we use a type predicate to narrow the error down to an object with a message property

       */
      if (isFetchBaseQueryError(error)) {
        if (
          error.data &&
          typeof error.data === 'object' &&
          'errors' in error.data &&
          error.data.errors &&
          typeof error.data.errors === 'object'
        ) {
          const allErrors = error.data.errors;

          if ('name' in allErrors && typeof allErrors.name === 'string') {
            setError('name', { type: 'custom', message: allErrors.name });
          } else if ('email' in allErrors && typeof allErrors.email === 'string') {
            setError('email', { type: 'custom', message: allErrors.email });
          } else if ('password' in allErrors && typeof allErrors.password === 'string') {
            setError('email', { type: 'custom', message: allErrors.password });
          } else if (
            'confirmPassword' in allErrors &&
            typeof allErrors.confirmPassword === 'string'
          ) {
            setError('email', { type: 'custom', message: allErrors.confirmPassword });
          }
        } else if (
          error.data &&
          typeof error.data === 'object' &&
          'errors' in error.data &&
          typeof error.data.errors === 'string'
        ) {
          setGenericError(error.data.errors);
        } else {
          setGenericError('Something went wrong. Please try again');
        }
      } else if (isErrorWithMessage(error)) {
        setGenericError(error.message);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: '4rem',
        gap: '2rem',
      }}
      component="main"
    >
      <Title align="center">Create your mangify account</Title>
      <Container size="xs" p="xl">
        <Paper
          radius="md"
          p="xl"
          withBorder
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        >
          <Text size="xl" weight={500} align="center" pb={10}>
            Sign in with
          </Text>

          <Group grow mb="md" mt="md">
            <GoogleButton radius="xl" onClick={handleGoogleLogin}>
              Google
            </GoogleButton>
            <FacebookButton radius="xl" onClick={handleFacebookLogin}>
              Facebook
            </FacebookButton>
          </Group>

          <Divider label="Or register with email" labelPosition="center" my="lg" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  <TextInput label="Name" placeholder="Your name" radius="md" {...field} />
                )}
              />
              {errors.name && <Text color="red" size="xs">{`${errors.name.message}`}</Text>}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Email"
                    placeholder="example@google.com"
                    radius="md"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...field}
                  />
                )}
              />
              {errors.email && <Text color="red" size="xs">{`${errors.email.message}`}</Text>}
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    radius="md"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...field}
                  />
                )}
              />
              {errors.password && <Text color="red" size="xs">{`${errors.password.message}`}</Text>}
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <PasswordInput
                    label="Confirm password"
                    placeholder="Confirm your password"
                    radius="md"
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...field}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text color="red" size="xs">{`${errors.confirmPassword.message}`}</Text>
              )}
            </Stack>

            <Group position="apart" mt="xl">
              <Anchor component={NavLink} to="/login" color="dimmed" size="xs">
                Already have an account? Login
              </Anchor>
              <Button type="submit" radius="xl" color="teal" disabled={isSubmitting}>
                Register
              </Button>
            </Group>
          </form>
          {genericError !== '' ? (
            <Text color="red" size="md" mt={10}>{`${genericError}`}</Text>
          ) : (
            ''
          )}
        </Paper>
      </Container>
    </Box>
  );
}
