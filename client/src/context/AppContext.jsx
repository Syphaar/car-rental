/* eslint-disable react-refresh/only-export-components */
// Stop ESLint from warning when this file exports things that are not React components
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

// Set default base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// Create a React context to hold global app state
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const currency = import.meta.env.VITE_CURRENCY; // Default currency from environment

    // Global State
    const [token, setToken] = useState(() => localStorage.getItem('token')); // Auth token
    const [user, setUser] = useState(null); // Logged-in user data
    const [isOwner, setIsOwner] = useState(false); // Check if user is an owner
    const [showLogin, setShowLogin] = useState(false); // Control login modal visibility
    const [pickupDate, setPickupDate] = useState(''); // Booking start date
    const [returnDate, setReturnDate] = useState(''); // Booking end date
    const [cars, setCars] = useState([]); // List of all cars

    // Fetch user data
    const fetchUser = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/user/data'); // Get user info from server
            if (data.success) {
                setUser(data.user); // Save user data in state
                setIsOwner(data.user.role === 'owner'); // Update owner status
            } else {
                navigate('/'); // Redirect to home if not authorized
            }
        } catch (error) {
            toast.error(error.message); // Show error message
        }
    }, [navigate]);

    // Fetch all cars
    const fetchCars = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/user/cars'); // Get cars from server
            data.success ? setCars(data.cars) : toast.error(data.message); // Save or show error
        } catch (error) {
            toast.error(error.message); // Show error message
        }
    }, []);

    // Logout user
    const logout = () => {
        localStorage.removeItem('token'); // Remove token from storage
        setToken(null); // Reset token state
        setUser(null); // Clear user data
        setIsOwner(false); // Reset owner status
        axios.defaults.headers.common['Authorization'] = ''; // Remove auth header
        toast.success('You have been logged out'); // Show success message
    };

    // Fetch cars when component mounts
    useEffect(() => {
        const getCars = async () => await fetchCars(); // Fetch cars safely
        getCars();
    }, [fetchCars]);

    // Fetch user info when token exists
    useEffect(() => {
        if (!token) return; // Skip if no token
        axios.defaults.headers.common['Authorization'] = token; // Set auth header
        const getUser = async () => await fetchUser(); // Fetch user safely
        getUser();
    }, [token, fetchUser]);

    // Context value
    const value = {
        navigate,        // Navigation function
        currency,        // App currency
        axios,           // Axios instance for API calls
        user,            // Logged-in user
        setUser,         // Update user
        token,           // Auth token
        setToken,        // Update token
        isOwner,         // Owner status
        setIsOwner,      // Update owner status
        fetchUser,       // Function to fetch user
        showLogin,       // Show/hide login modal
        setShowLogin,    // Toggle login modal
        logout,          // Logout function
        fetchCars,       // Function to fetch cars
        cars,            // List of cars
        setCars,         // Update cars
        pickupDate,      // Booking start date
        setPickupDate,   // Update start date
        returnDate,      // Booking end date
        setReturnDate    // Update end date
    };

    // Provide context to children
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Hook to access the app context in components
export const useAppContext = () => useContext(AppContext);