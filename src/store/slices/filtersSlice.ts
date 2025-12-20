import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  search: string;
  type: string;
}

const initialState: FiltersState = {
  search: "",
  type: "",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setType(state, action: PayloadAction<string>) {
      state.type = action.payload;
    },
    clearFilters(state) {
      state.search = "";
      state.type = "";
    },
  },
});

export const { setSearch, setType, clearFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;
