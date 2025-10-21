import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AuthState, User } from "../types/auth"

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isOnboarded: false,
    isLoading: true
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
            const { user, accessToken } = action.payload
            state.user = user
            state.accessToken = accessToken
            state.isAuthenticated = true
            state.isOnboarded = user.isOnboarded
        },

        logout(state) {
            state.user = null
            state.accessToken = null
            state.isAuthenticated = false
        },

        setLoading(state, action: PayloadAction<boolean>){
            state.isLoading = action.payload
        },

        completeOnboarding(state) {
            state.isOnboarded = true
            if (state.user)
                state.isOnboarded = true
        }
    }
})

export const { 
    setCredentials, 
    logout, 
    setLoading, 
    completeOnboarding 
} = authSlice.actions;

export default authSlice.reducer;