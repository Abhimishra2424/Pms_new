import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, IconButton, Button, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, alpha, useTheme, LinearProgress,
} from '@mui/material';
import {
  ChevronLeft, ChevronRight, AccessTime, Timer, TrendingUp, People,
} from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import HomeIcon from '@mui/icons-material/Home';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { ATTENDANCE_STATUS } from '../../constants/status';
import { formatDate, formatDateTime } from '../../utils/helpers';

const STATUS_COLORS = {
  present: '#22c55e', absent: '#ef4444', late: '#f97316',
  half_day: '#eab308', work_from_home: '#3b82f6', holiday: '#a855f7',
};

const WEEKLY_HOURS = [
  { day: 'Mon', hours: 8 }, { day: 'Tue', hours: 7.5 }, { day: 'Wed', hours: 8 },
  { day: 'Thu', hours: 6 }, { day: 'Fri', hours: 8 }, { day: 'Sat', hours: 0 }, { day: 'Sun', hours: 0 },
];

function generateMonthDays(year, month) {
  const firstDay = dayjs().year(year).month(month).startOf('month');
  const lastDay = firstDay.endOf('month');
  const startPad = firstDay.day();
  const days = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= lastDay.date(); d++) {
    const date = firstDay.date(d);
    const statuses = ['present', 'present', 'present', 'present', 'absent', 'present', 'late', 'present', 'present', 'present', 'half_day', 'present', 'present', 'work_from_home', 'present', 'present', 'present', 'absent', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'work_from_home', 'present', 'present', 'holiday'];
    const randStatus = statuses[d % statuses.length];
    const hasClockIn = randStatus !== 'absent' && randStatus !== 'holiday';
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: d,
      status: randStatus,
      clockIn: hasClockIn ? dayjs(date).hour(9).minute(Math.floor(Math.random() * 30)).format('HH:mm') : null,
      clockOut: hasClockIn ? dayjs(date).hour(18).minute(Math.floor(Math.random() * 60)).format('HH:mm') : null,
      totalHours: hasClockIn ? (7 + Math.random() * 1.5).toFixed(1) : null,
    });
  }
  return days;
}

export default function AttendancePage() {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState(null);
  const [elapsed, setElapsed] = useState('00:00:00');

  const year = currentDate.year();
  const month = currentDate.month();
  const days = useMemo(() => generateMonthDays(year, month), [year, month]);
  const today = dayjs().format('YYYY-MM-DD');

  useEffect(() => {
    let interval;
    if (isClockedIn && clockTime) {
      interval = setInterval(() => {
        const diff = dayjs().diff(dayjs(clockTime));
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setElapsed(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, clockTime]);

  const summary = useMemo(() => {
    const validDays = days.filter(Boolean);
    return {
      present: validDays.filter((d) => d.status === 'present').length,
      absent: validDays.filter((d) => d.status === 'absent').length,
      late: validDays.filter((d) => d.status === 'late').length,
      halfDay: validDays.filter((d) => d.status === 'half_day').length,
      wfh: validDays.filter((d) => d.status === 'work_from_home').length,
      holiday: validDays.filter((d) => d.status === 'holiday').length,
      totalHours: validDays.reduce((acc, d) => acc + (parseFloat(d.totalHours) || 0), 0).toFixed(1),
    };
  }, [days]);

  const teamAttendance = useMemo(() => [
    { name: 'Alice Johnson', status: 'present', clockIn: '09:05', clockOut: '18:00', hours: 8.9 },
    { name: 'Bob Smith', status: 'late', clockIn: '10:15', clockOut: '18:30', hours: 7.3 },
    { name: 'Carol Davis', status: 'absent', clockIn: '-', clockOut: '-', hours: 0 },
    { name: 'David Wilson', status: 'present', clockIn: '08:55', clockOut: '17:45', hours: 8.8 },
    { name: 'Eve Martin', status: 'work_from_home', clockIn: '09:00', clockOut: '18:00', hours: 9 },
  ], []);

  const handleToggleClock = () => {
    if (!isClockedIn) {
      setClockTime(dayjs().format());
      setIsClockedIn(true);
    } else {
      setIsClockedIn(false);
      setClockTime(null);
      setElapsed('00:00:00');
    }
  };

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const containerVariants = {
    hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const childVariants = {
    hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <PageHeader
        title="Attendance"
        subtitle="Track daily attendance and working hours"
        breadcrumbs={[{ label: 'Attendance' }]}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Present', value: summary.present, color: '#22c55e', icon: <CheckCircleIcon /> },
          { label: 'Absent', value: summary.absent, color: '#ef4444', icon: <CancelIcon /> },
          { label: 'Late', value: summary.late, color: '#f97316', icon: <WarningAmberIcon /> },
          { label: 'Half Day', value: summary.halfDay, color: '#eab308', icon: <WbSunnyIcon /> },
          { label: 'WFH', value: summary.wfh, color: '#3b82f6', icon: <HomeIcon /> },
          { label: 'Holiday', value: summary.holiday, color: '#a855f7', icon: <CalendarMonthIcon /> },
          { label: 'Total Hours', value: `${summary.totalHours}h`, color: '#06b6d4', icon: <AccessTime /> },
        ].map((stat) => (
          <Grid item xs={6} sm={4} md={12 / 7} key={stat.label}>
            <motion.div variants={childVariants}>
              <Card sx={{ textAlign: 'center', py: 1.5 }}>
                <CardContent sx={{ p: '8px !important' }}>
                  <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
                  <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <motion.div variants={childVariants}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}>
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                  {currentDate.format('MMMM YYYY')}
                </Typography>
                <IconButton onClick={() => setCurrentDate(currentDate.add(1, 'month'))}>
                  <ChevronRight />
                </IconButton>
                <Button size="small" variant="outlined" onClick={() => setCurrentDate(dayjs())}>
                  Today
                </Button>
              </Stack>
              <Button
                variant={isClockedIn ? 'outlined' : 'contained'}
                color={isClockedIn ? 'error' : 'primary'}
                startIcon={isClockedIn ? <Timer /> : <TodayIcon />}
                onClick={handleToggleClock}
              >
                {isClockedIn ? `Clock Out (${elapsed})` : 'Clock In'}
              </Button>
            </Stack>

            <Box sx={{ overflow: 'auto' }}>
              <Box sx={{ minWidth: 700 }}>
                <Grid container columns={7} spacing={0.5}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <Grid item xs={1} key={d}>
                      <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ py: 0.5 }}>
                        {d}
                      </Typography>
                    </Grid>
                  ))}
                  {days.map((day, i) => (
                    <Grid item xs={1} key={i}>
                      {day ? (
                        <Tooltip
                          title={
                            <Box>
                              <Typography variant="caption" display="block">{formatDate(day.date, 'MMM DD, YYYY')}</Typography>
                              <Typography variant="caption" display="block">Status: {day.status}</Typography>
                              {day.clockIn && <Typography variant="caption" display="block">In: {day.clockIn}</Typography>}
                              {day.clockOut && <Typography variant="caption" display="block">Out: {day.clockOut}</Typography>}
                              {day.totalHours && <Typography variant="caption" display="block">Hours: {day.totalHours}</Typography>}
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <Box
                            onClick={() => setSelectedDay(day)}
                            sx={{
                              aspectRatio: '1',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: 1.5, cursor: 'pointer', position: 'relative',
                              bgcolor: day.date === today ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                              border: day.date === today ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                              borderColor: day.date === today ? theme.palette.primary.main : 'divider',
                              '&:hover': { bgcolor: alpha(STATUS_COLORS[day.status], 0.15) },
                              transition: 'all 0.15s',
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%', height: '100%', position: 'absolute', borderRadius: 'inherit',
                                bgcolor: alpha(STATUS_COLORS[day.status], 0.2),
                                opacity: 0.7,
                              }}
                            />
                            <Typography
                              variant="caption"
                              fontWeight={day.date === today ? 700 : 400}
                              sx={{ position: 'relative', zIndex: 1, fontSize: '0.75rem' }}
                            >
                              {day.day}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Box sx={{ aspectRatio: '1' }} />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <motion.div variants={childVariants}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Weekly Hours</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={WEEKLY_HOURS}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {WEEKLY_HOURS.map((entry, idx) => (
                        <Cell key={idx} fill={entry.hours > 0 ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div variants={childVariants}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <People />
                  <Typography variant="h6" fontWeight={600}>Team Attendance</Typography>
                  <Chip label="Today" size="small" variant="outlined" sx={{ ml: 'auto' }} />
                </Stack>
                <DataTable
                  columns={[
                    { accessorKey: 'name', header: 'Name' },
                    {
                      id: 'status', header: 'Status', size: 120,
                      cell: ({ row }) => <StatusBadge status={row.original.status} statusMap={ATTENDANCE_STATUS} />,
                    },
                    { accessorKey: 'clockIn', header: 'Clock In', size: 90 },
                    { accessorKey: 'clockOut', header: 'Clock Out', size: 90 },
                    { accessorKey: 'hours', header: 'Hours', size: 70 },
                  ]}
                  data={teamAttendance}
                  enableExport={false}
                  enableColumnVisibility={false}
                  emptyTitle="No team data"
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Dialog open={Boolean(selectedDay)} onClose={() => setSelectedDay(null)} maxWidth="xs" fullWidth>
        {selectedDay && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: STATUS_COLORS[selectedDay.status] }} />
                {formatDate(selectedDay.date, 'MMM DD, YYYY')}
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <StatusBadge status={selectedDay.status} statusMap={ATTENDANCE_STATUS} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                  <Typography variant="body2" color="text.secondary">Clock In</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedDay.clockIn || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                  <Typography variant="body2" color="text.secondary">Clock Out</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedDay.clockOut || '-'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                  <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedDay.totalHours ? `${selectedDay.totalHours}h` : '-'}</Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedDay(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </motion.div>
  );
}
