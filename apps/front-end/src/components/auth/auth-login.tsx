'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
} from '@mui/material';
import Link from 'next/link';
import { CustomTextField } from './custom-text-field';
import { getCsrfToken, getSession, signIn, useSession } from 'next-auth/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';

// import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

type FormValues = { email: string; password: string };

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const { register, handleSubmit } = useForm<FormValues>();

  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  const { get } = useSearchParams();
  const errors = get('error');

  if (errors && !loginError) {
    if (errors.includes('401')) {
      setLoginError('Invalid username or password.');
    } else {
      setLoginError(errors as string);
    }
  }

  const onSubmit: SubmitHandler<FormValues> = async (d) => {
    await signIn('credentials', {
      username: d.email,
      password: d.password,
      redirect: true,
      callbackUrl: '/dashboard',
    });
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Typography fontWeight="700" mb={1} color={'red'}>
        {loginError}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="username"
              mb="5px"
            >
              Email Address
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              type="email"
              inputProps={{ ...register('email') }}
            />
          </Box>
          <Box mt="25px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Password
            </Typography>
            <CustomTextField
              type="password"
              variant="outlined"
              fullWidth
              inputProps={{ ...register('password') }}
            />
          </Box>
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              {/* <FormControlLabel
            control={<Checkbox defaultChecked />}
            label="Remember this Device"
          /> */}
            </FormGroup>
            <Typography
              component={Link}
              href="/"
              fontWeight="500"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
              }}
            >
              Forgot Password ?
            </Typography>
          </Stack>
        </Stack>
        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
          >
            Sign In
          </Button>
        </Box>
      </form>
      {subtitle}
    </>
  );
};

export default AuthLogin;
