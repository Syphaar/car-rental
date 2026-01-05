import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
    const {setShowLogin, axios, setToken, navigate} = useAppContext()

    // Track if form is in login or register mode
    const [state, setState] = React.useState('login');
    // Input states
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    // Handle form submission
    const onSubmitHandler = async (submitfunc) => {
        try {
            submitfunc.preventDefault();
            // Send API request to login or register
            const {data} = await axios.post(`/api/user/${state}`, {name, email, password})
            
            if(data.success) {
                // Save token, close modal, redirect
                navigate('/')
                setToken(data.token)
                localStorage.setItem('token', data.token)
                setShowLogin(false)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
    // Overlay: closes modal when clicked outside form
    <div onClick={() => setShowLogin(false)} className='fixed inset-0 z-100 flex items-center justify-center text-sm text-gray-600 bg-black/50'>

        {/* Form container: stops click propagation to overlay */}
        <form onSubmit={onSubmitHandler} onClick={(loginForm)=>loginForm.stopPropagation()} className="flex 
            flex-col bg-white rounded-lg shadow-xl text-sm text-gray-500 border border-gray-200 p-8 py-12 w-80 sm:w-80"
        >
            {/* Form title */}
            <p class="text-2xl font-medium m-auto">
                <span className="text-primary">User</span> {state === 'login' ? 'Login' : 'Sign Up'}
            </p>

            {/* Name input for registration only */}
            {state === 'register' && (
                <div className="w-full">
                    <p>Name</p>
                    <input onChange={(inputChange) => setName(inputChange.target.value)} value={name} placeholder='type here' 
                        className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary' type='text' required 
                    />
                </div>
            )}

            {/* Email input */}
            <div className="mt-4 w-full">
                <p>Email</p>
                <input onChange={(emailField) => setEmail(emailField.target.value)} value={email} type="email" 
                    placeholder="type here" required className="border border-gray-200 rounded w-full p-2 
                    mt-1 outline-primary" 
                />
            </div>

            {/* Password input */}
            <div className="mt-4 w-full">
                <p>Password</p>
                <input onChange={(passwordField) => setPassword(passwordField.target.value)} value={password} 
                    type="password" placeholder="type here" required className="border border-gray-200 rounded 
                    w-full p-2 my-1 outline-primary" 
                />
            </div>

            {/* Toggle between login and register */}
            {state === 'register' ? (
                <p>
                    Already have account? 
                    <span onClick={() => setState('login')} className='text-primary cursor-pointer'> Click here
                    </span>
                </p>
            ) : (
                <p>
                    Create an account? 
                    <span onClick={() => setState('register')} className='text-primary cursor-pointer'> Click here
                    </span>
                </p>
            )}

            {/* Submit button */}
            <button type="submit" className="bg-primary hover:bg-blue-800 transition-all text-white 
                w-full py-2 rounded-md mt-4 cursor-pointer"
            >
                {state === 'register' ? 'Create Account' : 'Login'}
            </button>
        </form>
    </div>
  )
}

export default Login
