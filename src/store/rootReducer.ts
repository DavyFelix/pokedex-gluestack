import { combineReducers } from "@reduxjs/toolkit";
import favoritesReducer from "./slices/favoritesSlice";
import filtersReducer from "./slices/filtersSlice";

const rootReducer = combineReducers({
  favorites: favoritesReducer,
  filters: filtersReducer,
});

export default rootReducer;
