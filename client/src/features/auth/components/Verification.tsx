import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Button, Center, Flex, Stack, Text, TextInput, Title } from '@mantine/core';
import { useReVerifyEmailMutation, useVerifyEmailMutation } from '@/features/api';

export function Verification() {
  const [searchParams] = useSearchParams();
  const userToken = searchParams.get('key');
  const [verifyEmail, { isSuccess }] = useVerifyEmailMutation();
  const [reVerifyEmail] = useReVerifyEmailMutation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  const handleReVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userEmail) {
      notifications.show({
        id: 'verification-email-empty',
        icon: <IconX size="1rem" />,
        title: 'Please enter your email.',
        color: 'red',
        message: '',
        autoClose: 2000,
      });
      return;
    }
    await reVerifyEmail(userEmail);
    notifications.show({
      id: 're-verification-email-sent',
      icon: <IconCheck size="1rem" />,
      title: 'Email sent.',
      color: 'green',
      message: '',
      autoClose: 4000,
    });
  };

  useEffect(() => {
    const veryfyEmailAsync = async () => {
      if (userToken) {
        await verifyEmail(userToken);
      }
    };
    veryfyEmailAsync();
  }, [verifyEmail, userToken, navigate]);

  if (isSuccess) {
    navigate('/login');
    notifications.show({
      id: 'verification-success',
      icon: <IconCheck size="1rem" />,
      title: 'Verification successful! You can now login.',
      color: 'teal',
      message: '',
      autoClose: 5000,
    });

    return (
      <Center>
        <Title mt={200}>Redirecting...</Title>
      </Center>
    );
  }

  return (
    <Flex direction="column" align="center" p={20} mt={20} gap={20}>
      <Title> Verify your mangify email</Title>
      <Text>
        Not registered? Click{' '}
        <Text component={NavLink} to="/sign-up" underline>
          here
        </Text>{' '}
        to join mangify today! Already verified? Sign in{' '}
        <Text component={NavLink} to="/login" underline>
          here
        </Text>
        .
      </Text>
      <Text>
        Verification email doesn&apos;t work or you can&apos;t find it? Enter your email below and
        we will send over another one!
      </Text>

      <form onSubmit={handleReVerification}>
        <Stack>
          <TextInput
            type="email"
            onChange={({ target }) => {
              setUserEmail(target.value);
            }}
          />
          <Button type="submit" radius="xl" color="teal">
            Resend verification email
          </Button>
        </Stack>
      </form>
    </Flex>
  );
}
