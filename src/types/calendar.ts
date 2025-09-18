// types/calendar.ts
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  source: 'google' | 'outlook';
  isCallEvent?: boolean;
}

export interface CalendarConnection {
  id: string;
  user_id: string;
  provider: 'google' | 'outlook';
  access_token: string;
  refresh_token: string;
  expires_at: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CallReminder {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;
  event_start: string;
  reminder_time: string;
  reminder_type: 'email' | 'push' | 'sms';
  is_sent: boolean;
  created_at: string;
}