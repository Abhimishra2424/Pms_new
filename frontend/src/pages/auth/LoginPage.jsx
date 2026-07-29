import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Link, Alert, InputAdornment, IconButton, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { loginStart, clearError } from '../../redux/slices/authSlice';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  rememberMe: yup.boolean(),
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginStart({ email: data.email, password: data.password }));
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <motion.div variants={itemVariants}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Welcome back
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account to continue
          </Typography>
        </motion.div>
      </Box>

      {error && (
        <motion.div variants={itemVariants}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        </motion.div>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <motion.div variants={itemVariants}>
          <TextField
            label="Email"
            fullWidth
            size="medium"
            sx={{ mb: 2 }}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            size="medium"
            sx={{ mb: 1 }}
{...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 0.5 }}>
            <FormControlLabel
              control={<Checkbox size="small" {...register('rememberMe')} />}
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary" fontWeight={500} underline="hover">
              Forgot password?
            </Link>
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </motion.div>
      </Box>

      <motion.div variants={itemVariants}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" variant="body2" fontWeight={700} underline="hover">
              Register
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </motion.div>
  );
}
