import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, IdCard, Mail, Lock, MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../utils/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        employee_id: '',
        email: '',
        password: '',
        confirm_password: '',
        office_location: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [empIdStatus, setEmpIdStatus] = useState(null); // null | 'checking' | 'ok' | 'taken'
    const debounceRef = React.useRef(null);

    // ── Real-time EMP ID uniqueness check ──
    React.useEffect(() => {
        const empId = formData.employee_id.trim().toUpperCase();
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (empId.length >= 3) { // Check if it's long enough to be an ID
            setEmpIdStatus('checking');
            debounceRef.current = setTimeout(async () => {
                try {
                    const res = await api.get(`/auth/check-id?emp_id=${empId}`);
                    setEmpIdStatus(res.data.exists ? 'taken' : 'ok');
                    if (res.data.exists) {
                        setErrors(prev => ({ ...prev, employee_id: 'Employee Id Already exist' }));
                    } else {
                        setErrors(prev => {
                            const next = { ...prev };
                            if (next.employee_id === 'Employee Id Already exist') delete next.employee_id;
                            return next;
                        });
                    }
                } catch {
                    setEmpIdStatus(null);
                }
            }, 500);
        } else {
            setEmpIdStatus(null);
        }

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [formData.employee_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.full_name) newErrors.full_name = 'Full name is required';
        if (!formData.employee_id) newErrors.employee_id = 'Employee ID is required';
        if (!formData.email) newErrors.email = 'Company email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

        if (formData.confirm_password !== formData.password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        if (!termsAccepted) {
            newErrors.terms = 'You must accept the terms & conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                full_name: formData.full_name,
                phone: formData.employee_id,       // backend uses 'phone' for employee ID
                email: formData.email,
                password: formData.password,
                location: formData.office_location  // backend uses 'location'
            });

            if (response.data.success) {
                // Auto login after registration and navigate to dashboard
                const loginRes = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                const { data } = loginRes.data;
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/employee/dashboard');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setErrors(prev => ({ ...prev, server: message }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-6 sm:px-12 flex flex-col items-center">
            <div className="w-full max-w-md">
                <header className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Employee Account</h1>
                    <p className="text-sm text-gray-500">Register to access ResolveIQ dashboard</p>
                </header>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                        <div className="w-1 h-auto bg-blue-500 rounded-full"></div>
                        <div>
                            <p className="text-xs font-bold text-blue-900 mb-1">Employee Registration Only</p>
                            <p className="text-[11px] text-blue-700 leading-relaxed italic">
                                Use your official company email. All other registration types must be requested through your manager.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="card-premium space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="input-field pl-12"
                                />
                            </div>
                            {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
                        </div>

                        {/* Employee ID */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Employee ID</label>
                            <div className="relative">
                                <IdCard className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.employee_id ? 'text-red-400' : 'text-gray-400'}`} />
                                <input
                                    name="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleChange}
                                    placeholder="E.g. EMP123"
                                    className={`input-field pl-12 ${errors.employee_id ? 'border-red-300 bg-red-50' : ''}`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                    {empIdStatus === 'checking' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                                    {empIdStatus === 'ok' && !errors.employee_id && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                </div>
                            </div>
                            {errors.employee_id && <p className="mt-1 text-[11px] font-bold text-red-600">{errors.employee_id}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Company Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    className="input-field pl-12"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 8 characters"
                                    className="input-field pl-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="confirm_password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    className="input-field pl-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirm_password && <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>}
                        </div>

                        {/* Office Location */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Office Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="office_location"
                                    value={formData.office_location}
                                    onChange={handleChange}
                                    className="input-field pl-12 appearance-none"
                                >
                                    <option value="">Select Location</option>
                                    <option value="Headquarters">Headquarters</option>
                                    <option value="Regional Office">Regional Office</option>
                                    <option value="Satellite Campus">Satellite Campus</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="px-1">
                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="terms" className="ml-2 text-xs text-gray-500 leading-normal">
                                I agree to the ResolveIQ Terms of Service and Privacy Policy.
                            </label>
                        </div>
                        {errors.terms && <p className="mt-1 text-xs text-red-600">{errors.terms}</p>}
                    </div>

                    {errors.server && (
                        <p className="text-xs text-red-600 font-medium px-1">{errors.server}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
