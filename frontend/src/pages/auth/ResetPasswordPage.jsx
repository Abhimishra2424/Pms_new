import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, Alert, InputAdornment, IconButton, CircularProgress, LinearProgress,
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Lock, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as authApi from '../../api/authApi';

const schema = yup.object({
  password: yup.string().min(8, 'Password must be at least 8 characters').matches(/[a-z]/, 'Password must contain at least one lowercase letter').matches(/[A-Z]/, 'Password must contain at least one uppercase letter').matches(/[0-9]/, 'Password must contain at least one number').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
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

function PasswordStrength({ password }) {
  const checks = useMemo(() => [
    { label: 'Lowercase', pass: /[a-z]/.test(password) },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: '8+ chars', pass: password.length >= 8 },
  ], [password]);

  const strength = checks.filter((c) => c.pass).length;
  const percent = (strength / 4) * 100;
  const color = ['error', 'error', 'warning', 'success', 'success'][strength];

  if (!password) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <LinearProgress
        variant="determinate"
        value={percent}
        color={color}
        sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {checks.map((check) => (
          <Box
            key={check.label}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.6, py: 0.15,
              borderRadius: 1, bgcolor: check.pass ? 'success.main' : 'action.hover',
              color: check.pass ? 'common.white' : 'text.disabled',
              fontSize: '0.65rem', fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            {check.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({ token, password: data.password });
      setSuccess(true);
      toast.success('Password has been reset successfully!');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to reset password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Box sx={{ textAlign: 'center', py: 2, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: ['primary.main', 'secondary.main', 'success.main', 'warning.main', 'error.main'][i % 5],
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `confettiFall ${1 + Math.random() * 2}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  opacity: 0,
                  '@keyframes confettiFall': {
                    '0%': { transform: 'translateY(-20px) rotate(0deg) scale(0)', opacity: 1 },
                    '100%': { transform: `translateY(${100 + Math.random() * 100}px) rotate(${360 + Math.random() * 720}deg) scale(1)`, opacity: 0 },
                  },
                }}
              />
            ))}
          </Box>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          >
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Password reset successful!
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been updated successfully.
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              fullWidth
              size="large"
              sx={{ py: 1.3 }}
            >
              Go to Login
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
          <Lock sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Reset password
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="body2" color="text.secondary">
            Enter your new password below
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
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth size="medium" sx={{ mb: 1 }}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="new-password"
            autoFocus
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <PasswordStrength password={passwordValue} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth size="medium" sx={{ mb: 2 }}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            autoComplete="new-password"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Lock fontSize="small" color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
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
            sx={{ py: 1.3 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Reset Password'}
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
}
