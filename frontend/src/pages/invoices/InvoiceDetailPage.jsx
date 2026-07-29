import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, Chip, Divider, alpha, useTheme,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { INVOICE_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/helpers';

const INVOICE = {
  id: 'INV-002', status: 'sent', issueDate: '2026-07-15', dueDate: '2026-08-14',
  client: { name: 'Globex Inc', email: 'info@globex.com', phone: '+1-555-0101', address: '456 Oak Avenue, San Francisco, CA 94102' },
  items: [
    { description: 'UI/UX Design Services', qty: 40, unitPrice: 150, total: 6000 },
    { description: 'Frontend Development', qty: 20, unitPrice: 125, total: 2500 },
  ],
  subtotal: 8500, taxRate: 10, taxAmount: 850, discount: 0, total: 9350,
  amountPaid: 0, balanceDue: 9350,
  notes: 'Payment within 30 days',
  terms: 'Net 30',
  timeline: [
    { event: 'Created', date: '2026-07-15 10:30', icon: <DescriptionOutlinedIcon />, color: 'info' },
    { event: 'Sent to Client', date: '2026-07-15 11:00', icon: <SendOutlinedIcon />, color: 'warning' },
  ],
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const inv = INVOICE;

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title={`Invoice ${inv.id}`}
        breadcrumbs={[{ label: 'Invoices', href: '/invoices' }, { label: inv.id }]}
        actions={
          <Stack direction="row" spacing={1}>
            {inv.status === 'draft' && <Button variant="contained" startIcon={<SendIcon />}>Send</Button>}
            {(inv.status === 'sent' || inv.status === 'overdue') && (
              <Button variant="contained" color="success" startIcon={<CheckCircleIcon />}>Mark Paid</Button>
            )}
            <Button variant="outlined" startIcon={<DownloadIcon />}>Download PDF</Button>
            <Button variant="outlined" startIcon={<EditIcon />}>Edit</Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>Delete</Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <StatusBadge status={inv.status} statusMap={INVOICE_STATUS} size="medium" />
        <Typography variant="body2" color="text.secondary">
          Issued: {formatDate(inv.issueDate)} | Due: {formatDate(inv.dueDate)}
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <motion.div variants={childVariants}>
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Bill To</Typography>
                <Stack spacing={1}>
                  <Typography variant="body1" fontWeight={600}>{inv.client.name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{inv.client.email}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{inv.client.phone}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                    <Typography variant="body2">{inv.client.address}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={childVariants}>
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Invoice Items</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inv.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">{item.qty}</TableCell>
                          <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={0.5} alignItems="flex-end">
                  <Typography variant="body2">Subtotal: <strong>${inv.subtotal.toFixed(2)}</strong></Typography>
                  <Typography variant="body2">Tax ({inv.taxRate}%): <strong>${inv.taxAmount.toFixed(2)}</strong></Typography>
                  {inv.discount > 0 && <Typography variant="body2">Discount: <strong>-${inv.discount.toFixed(2)}</strong></Typography>}
                  <Typography variant="h6" fontWeight={700}>Total: ${inv.total.toFixed(2)}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={childVariants}>
            <Card sx={{ mb: 2.5 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CheckCircleOutlinedIcon color="action" />
                  <Typography variant="h6" fontWeight={600}>Payment Summary</Typography>
                </Stack>
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h6" fontWeight={700}>${inv.total.toFixed(2)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Amount Paid</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">${inv.amountPaid.toFixed(2)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Balance Due</Typography>
                    <Typography variant="h6" fontWeight={700} color={inv.balanceDue > 0 ? 'error.main' : 'text.primary'}>${inv.balanceDue.toFixed(2)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>

          {(inv.notes || inv.terms) && (
            <motion.div variants={childVariants}>
              <Card sx={{ mb: 2.5 }}>
                <CardContent>
                  {inv.notes && (
                    <Box sx={{ mb: inv.terms ? 2 : 0 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Notes</Typography>
                      <Typography variant="body2" color="text.secondary">{inv.notes}</Typography>
                    </Box>
                  )}
                  {inv.terms && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Terms</Typography>
                      <Typography variant="body2" color="text.secondary">{inv.terms}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div variants={childVariants}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Timeline</Typography>
                <Stack spacing={2}>
                  {inv.timeline.map((entry, idx) => (
                    <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', bgcolor: alpha(theme.palette[entry.color]?.main || theme.palette.primary.main, 0.1),
                        color: theme.palette[entry.color]?.main || theme.palette.primary.main, flexShrink: 0,
                      }}>
                        {entry.icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{entry.event}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDate(entry.date, 'MMM DD, YYYY hh:mm A')}</Typography>
                      </Box>
                    </Stack>
                  ))}
                  {inv.status === 'paid' && (
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main, flexShrink: 0,
                      }}>
                        <CheckCircleOutlinedIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>Paid</Typography>
                        <Typography variant="caption" color="text.secondary">Payment received</Typography>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
}
