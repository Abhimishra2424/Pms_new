import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Alert, CircularProgress, Button, Link, InputAdornment } from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ErrorOutlined, MailOutlined, ArrowBack } from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as authApi from '../../api/authApi';

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

export default function EmailVerificationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyEmail(token);
      setSuccess(true);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Verification failed. The link may be invalid or expired.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) verify();
    else {
      setLoading(false);
      setError('No verification token provided.');
    }
  }, [token, verify]);

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.forgotPassword(token);
      toast.success('Verification email has been resent. Please check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <MailOutlined sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
          </motion.div>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Verifying your email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we verify your email address...
          </Typography>
          <CircularProgress size={24} sx={{ mt: 2 }} />
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ textAlign: 'center', py: 2 }}>
        {success ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 12 }}
            >
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Email verified!
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your email has been successfully verified. You can now sign in to your account.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate('/login')}
                sx={{ py: 1.3 }}
              >
                Go to Sign In
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 12 }}
            >
              <ErrorOutlined sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Verification failed
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                {error}
              </Alert>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The verification link may be invalid or expired. You can request a new verification email.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={resending}
                onClick={handleResend}
                sx={{ py: 1.3, mb: 1.5 }}
              >
                {resending ? <CircularProgress size={22} color="inherit" /> : 'Resend Verification Email'}
              </Button>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={() => navigate('/login')}
                startIcon={<ArrowBack />}
                sx={{ py: 1.3 }}
              >
                Back to Sign In
              </Button>
            </motion.div>
          </>
        )}
      </Box>
    </motion.div>
  );
}
