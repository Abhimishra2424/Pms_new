import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, Link, Alert, InputAdornment, IconButton,
  CircularProgress, Checkbox, FormControlLabel, Select, MenuItem, Stepper, Step, StepLabel,
  FormControl, InputLabel, FormHelperText,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Visibility, VisibilityOff, Person, Mail, Lock, Phone, Business, Badge,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { registerStart, registerSuccess, registerFailure } from '../../redux/slices/authSlice';
import * as authApi from '../../api/authApi';

const schema = yup.object({
  firstName: yup.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be at most 50 characters').required('First name is required'),
  lastName: yup.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be at most 50 characters').required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').matches(/[a-z]/, 'Password must contain at least one lowercase letter').matches(/[A-Z]/, 'Password must contain at least one uppercase letter').matches(/[0-9]/, 'Password must contain at least one number').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
  companyName: yup.string().required('Company name is required'),
  phone: yup.string().nullable(),
  role: yup.string().required('Role is required'),
  acceptTerms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

const steps = ['Account Details', 'Personal Info', 'Review'];

const roles = [
  { value: 'developer', label: 'Developer' },
  { value: 'qa', label: 'QA' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'team_lead', label: 'Team Lead' },
];

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

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, trigger, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
      companyName: '', phone: '', role: '', acceptTerms: false,
    },
  });

  const watchedValues = watch();

  const isStepValid = async (step) => {
    let fields = [];
    if (step === 0) fields = ['email', 'password', 'confirmPassword'];
    else if (step === 1) fields = ['firstName', 'lastName', 'companyName', 'phone', 'role'];
    else if (step === 2) fields = ['acceptTerms'];
    const result = await trigger(fields);
    return result;
  };

  const handleNext = async () => {
    const valid = await isStepValid(activeStep);
    if (valid) setActiveStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data) => {
    dispatch(registerStart());
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
        phone: data.phone || undefined,
        role: data.role,
      };
      const response = await authApi.register(payload);
      dispatch(registerSuccess());
      toast.success('Account created successfully! Please check your email to verify.');
      navigate('/login', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      dispatch(registerFailure(message));
      toast.error(message);
    }
  };

  useEffect(() => {
    if (error) {
      setActiveStep(0);
    }
  }, [error]);

  const passwordValue = watch('password') || '';
  const strengthChecks = [
    { label: 'Lowercase', pass: /[a-z]/.test(passwordValue) },
    { label: 'Uppercase', pass: /[A-Z]/.test(passwordValue) },
    { label: 'Number', pass: /[0-9]/.test(passwordValue) },
    { label: '8+ characters', pass: passwordValue.length >= 8 },
  ];
  const strength = strengthChecks.filter((c) => c.pass).length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <motion.div variants={itemVariants}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Create account
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Typography variant="body2" color="text.secondary">
            Join your team on the platform
          </Typography>
        </motion.div>
      </Box>

      <motion.div variants={itemVariants}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </motion.div>

      {error && (
        <motion.div variants={itemVariants}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        </motion.div>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {activeStep === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <TextField
              label="Email"
              fullWidth size="medium" sx={{ mb: 2 }}
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Mail fontSize="small" color="action" /></InputAdornment>,
                },
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth size="medium" sx={{ mb: 1 }}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="new-password"
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
            {passwordValue.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                  {[1, 2, 3, 4].map((level) => (
                    <Box
                      key={level}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: level <= strength
                          ? ['error.main', 'error.main', 'warning.main', 'success.main'][strength - 1] || 'success.main'
                          : 'divider',
                        transition: 'background-color 0.3s',
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {strengthChecks.map((check) => (
                    <Box
                      key={check.label}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.3,
                        px: 0.6,
                        py: 0.15,
                        borderRadius: 1,
                        bgcolor: check.pass ? 'success.main' : 'action.hover',
                        color: check.pass ? 'common.white' : 'text.disabled',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                    >
                      {check.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth size="medium" sx={{ mb: 1 }}
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
        )}

        {activeStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name" fullWidth size="medium" sx={{ mb: 2 }}
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                autoComplete="given-name"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Person fontSize="small" color="action" /></InputAdornment>,
                },
              }}
              />
              <TextField
                label="Last Name" fullWidth size="medium" sx={{ mb: 2 }}
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                autoComplete="family-name"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Badge fontSize="small" color="action" /></InputAdornment>,
                },
              }}
              />
            </Box>
            <TextField
              label="Company Name"
              fullWidth size="medium" sx={{ mb: 2 }}
              {...register('companyName')}
              error={!!errors.companyName}
              helperText={errors.companyName?.message}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Business fontSize="small" color="action" /></InputAdornment>,
                },
              }}
            />
            <TextField
              label="Phone (optional)"
              fullWidth size="medium" sx={{ mb: 2 }}
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              autoComplete="tel"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Phone fontSize="small" color="action" /></InputAdornment>,
                },
              }}
            />
            <FormControl fullWidth size="medium" sx={{ mb: 2 }} error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Role">
                    {roles.map((r) => (
                      <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.role && <FormHelperText>{errors.role?.message}</FormHelperText>}
            </FormControl>
          </motion.div>
        )}

        {activeStep === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2, mb: 2 }}>
              {[
                { label: 'First Name', value: watchedValues.firstName },
                { label: 'Last Name', value: watchedValues.lastName },
                { label: 'Email', value: watchedValues.email },
                { label: 'Company', value: watchedValues.companyName },
                { label: 'Phone', value: watchedValues.phone || '—' },
                { label: 'Role', value: roles.find((r) => r.value === watchedValues.role)?.label || '—' },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
            <FormControlLabel
              control={<Checkbox {...register('acceptTerms')} />}
              label={
                <Typography variant="body2">
                  I accept the{' '}
                  <Link component={RouterLink} to="/terms" variant="body2" underline="hover">Terms & Conditions</Link>
                </Typography>
              }
              sx={{ mb: 1 }}
            />
            {errors.acceptTerms && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
                {errors.acceptTerms.message}
              </Typography>
            )}
          </motion.div>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
          {activeStep > 0 && (
            <Button variant="outlined" fullWidth onClick={handleBack} size="large" sx={{ py: 1.3 }}>
              Back
            </Button>
          )}
          {activeStep < 2 ? (
            <Button variant="contained" fullWidth onClick={handleNext} size="large" sx={{ py: 1.3 }}>
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.3 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" variant="body2" fontWeight={700} underline="hover">
            Sign in
          </Link>
        </Typography>
      </Box>
    </motion.div>
  );
}
