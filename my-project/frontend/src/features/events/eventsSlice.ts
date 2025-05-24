import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  deletedAt?: string | null;
  imageUrl?: string | null;
  createdBy?: string;
}

interface EventsState {
  events: Event[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isDataInvalid: boolean;
}

const initialState: EventsState = {
  events: [],
  isLoading: false,
  isError: false,
  error: null,
  isDataInvalid: false,
};

export const fetchEventsThunk = createAsyncThunk(
  'events/fetchEvents',
  async (showDeleted: boolean = false, thunkAPI) => {
    try {
      const response = await axios.get('/api/events', {
        params: { showDeleted },
      });
      if (!Array.isArray(response.data)) {
        return thunkAPI.rejectWithValue('API вернул не массив');
      }
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Ошибка при загрузке мероприятий');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
        state.isDataInvalid = false;
      })
      .addCase(fetchEventsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.isError = false;
        state.error = null;
        state.isDataInvalid = false;
      })
      .addCase(fetchEventsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.payload as string || 'Ошибка при загрузке мероприятий';
        state.isDataInvalid = action.payload === 'API вернул не массив';
      });
  },
});

export default eventsSlice.reducer; 