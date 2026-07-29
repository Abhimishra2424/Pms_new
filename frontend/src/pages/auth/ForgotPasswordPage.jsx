import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Link, Alert, CircularProgress, InputAdornment } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Mail, ArrowBack, Send, MarkEmailRead } from '@mui/icons-material';
import * as authApi from '../../api/authApi';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to send reset email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <MarkEmailRead sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Check your email
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, maxWidth: 320, mx: 'auto' }}>
              We've sent a password reset link to your email. Please check your inbox and follow the instructions.
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 3 }}>
              Didn't receive it? Check your spam folder or try again.
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<ArrowBack />}
              sx={{ py: 1.3 }}
            >
              Back to Sign In
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <motion.div variants={itemVariants}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Forgot password?
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="body2" color="text.secondary">
            No worries, we'll send you a reset link
          </Typography>
        </motion.div>
      </Box>

      {error && (
        <motion.div variants={itemVariants}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? undefined : <Send />}
            sx={{ py: 1.3, mb: 2 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Link'}
          </Button>
        </motion.div>
      </Box>

      <motion.div variants={itemVariants}>
        <Box sx={{ textAlign: 'center' }}>
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            fontWeight={600}
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <ArrowBack fontSize="small" />
            Back to Sign In
          </Link>
        </Box>
      </motion.div>
    </motion.div>
  );
}
